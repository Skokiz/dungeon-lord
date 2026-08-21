// Тести інваріантів дерев еволюції. Виконуються всередині сторінки main.html
// (headless Chromium), бо вся логіка гри — глобалі в main.html, імпортувати нема що.
// Запуск: .venv-video\Scripts\python.exe test\run_tests.py
//
// Головне, що тут ловиться — «фантомне дерево»: коли дерево є в MON_DEV_TREES і
// малюється в UI, але _apply<Kind>Evo не робить нічого. У грі це виглядає як
// витрачені душі без ефекту, і мовчить — жодної помилки в консолі.

function __runTests() {
    const results = [];
    const ok   = (name) => results.push({ name, pass: true });
    const fail = (name, detail) => results.push({ name, pass: false, detail: String(detail) });

    const check = (name, fn) => {
        try {
            const r = fn();
            if (r === true || r === undefined) ok(name);
            else fail(name, r);
        } catch (e) {
            fail(name, (e && e.stack) ? e.stack.split('\n').slice(0, 3).join(' | ') : e);
        }
    };

    // kind 'water_ele' → '_applyWaterEleEvo'
    const fnNameFor = (kind) =>
        '_apply' + kind.split('_').map(s => s[0].toUpperCase() + s.slice(1)).join('') + 'Evo';

    const MAX_LVL = 10;
    const maxSpent = MON_TREE_THRESHOLDS[MAX_LVL];

    // ---------- 1. Реєстр ----------

    check('MONSTER_KIND_NAMES не порожній', () =>
        MONSTER_KIND_NAMES.length > 0 || 'порожній список монстрів');

    check('кожен монстр має дерево в MON_DEV_TREES', () => {
        const missing = MONSTER_KIND_NAMES.filter(k => !MON_DEV_TREES[k]);
        return missing.length === 0 || 'без дерева: ' + missing.join(', ');
    });

    check('немає дерев-сиріт (дерево без монстра)', () => {
        const orphans = Object.keys(MON_DEV_TREES).filter(k => !MONSTER_KIND_NAMES.includes(k));
        return orphans.length === 0 || 'сироти: ' + orphans.join(', ');
    });

    check('кожен монстр має _apply<Kind>Evo', () => {
        const missing = MONSTER_KIND_NAMES.filter(k => typeof window[fnNameFor(k)] !== 'function');
        return missing.length === 0 || 'без apply-функції: ' + missing.join(', ');
    });

    check('пороги MON_TREE_THRESHOLDS зростають', () => {
        for (let i = 1; i <= MAX_LVL; i++) {
            if (!(MON_TREE_THRESHOLDS[i] > MON_TREE_THRESHOLDS[i - 1]))
                return `поріг ${i} (${MON_TREE_THRESHOLDS[i]}) не більший за ${i - 1} (${MON_TREE_THRESHOLDS[i - 1]})`;
        }
        return true;
    });

    check('computeEvoLevel узгоджений з порогами', () => {
        for (let i = 0; i <= MAX_LVL; i++) {
            const got = computeEvoLevel(MON_TREE_THRESHOLDS[i]);
            if (got !== i) return `spent=${MON_TREE_THRESHOLDS[i]} → рівень ${got}, очікували ${i}`;
        }
        return computeEvoLevel(0) === 0 || 'spent=0 має давати рівень 0';
    });

    // ---------- 2. Структура дерев ----------

    for (const kind of MONSTER_KIND_NAMES) {
        const tree = MON_DEV_TREES[kind];
        if (!tree) continue;

        check(`[${kind}] дерево має trunk, branchA, branchB`, () => {
            for (const part of ['trunk', 'branchA', 'branchB'])
                if (!tree[part]) return `немає ${part}`;
            return true;
        });

        check(`[${kind}] вузли мають lvl і desc, рівні зростають`, () => {
            const branches = [
                ['trunk',   tree.trunk],
                ['branchA', tree.branchA && tree.branchA.nodes ? tree.branchA.nodes : tree.branchA],
                ['branchB', tree.branchB && tree.branchB.nodes ? tree.branchB.nodes : tree.branchB],
            ];
            for (const [label, nodes] of branches) {
                if (!Array.isArray(nodes)) return `${label} не масив вузлів`;
                let prev = 0;
                for (const n of nodes) {
                    if (typeof n.lvl !== 'number') return `${label}: вузол без lvl`;
                    if (n.lvl < 1 || n.lvl > MAX_LVL) return `${label}: lvl ${n.lvl} поза 1..${MAX_LVL}`;
                    if (!n.desc) return `${label}: вузол lvl ${n.lvl} без опису`;
                    if (n.lvl <= prev) return `${label}: рівні не зростають (${prev} → ${n.lvl})`;
                    prev = n.lvl;
                }
            }
            return true;
        });
    }

    // ---------- 3. Ефекти реально застосовуються ----------
    // Підміняємо джерело стану, а не чіпаємо localStorage: apply-функції читають
    // рівень і гілку тільки через getMonDev / getMonDevGolden.

    const origMonDev  = window.getMonDev;
    const origGolden  = window.getMonDevGolden;

    const makeUnit = (kind) => ({
        monsterKind: kind, type: 'monster',
        hp: 100, maxHp: 100, dmg: 10, baseDmg: 10,
        size: 20, speed: 1, armor: 0, magArmor: 0,
        atkSpeedBonus: 0, floorIdx: 0, x: 0, y: 0,
    });

    // Поля, що не свідчать про ефект: їх apply виставляє завжди.
    const IGNORED = new Set(['_evoLvl', '_branch', 'monsterKind', 'type']);

    const snapshot = (u) => {
        const out = {};
        for (const k of Object.keys(u)) if (!IGNORED.has(k)) out[k] = JSON.stringify(u[k]);
        return out;
    };

    const diffKeys = (before, after) => {
        const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
        return [...keys].filter(k => before[k] !== after[k]);
    };

    try {
        for (const branch of ['A', 'B']) {
            for (const kind of MONSTER_KIND_NAMES) {
                const fn = window[fnNameFor(kind)];
                if (typeof fn !== 'function') continue;

                check(`[${kind}] гілка ${branch} на макс. рівні дає ефект`, () => {
                    window.getMonDev       = () => ({ soulsSpent: maxSpent, branch });
                    window.getMonDevGolden = () => ({ goldenSpent: 0, branch: null });

                    const unit = makeUnit(kind);
                    const before = snapshot(unit);
                    fn(unit);
                    const after = snapshot(unit);

                    if (unit._evoLvl !== MAX_LVL)
                        return `_evoLvl = ${unit._evoLvl}, очікували ${MAX_LVL}`;

                    const changed = diffKeys(before, after);
                    if (changed.length === 0)
                        return 'apply-функція не змінила жодного поля — дерево фантомне';
                    return true;
                });
            }
        }

        // Нульовий рівень не має давати БОНУСІВ. Перевіряти «нічого не змінилось»
        // не можна: apply-функції відповідають і за базову ініціалізацію юніта
        // (слайм виставляє ability/color, водяний — щит 20% maxHp навіть без
        // вибраної гілки). Легітимно. Тече бонус — це вже інша річ.
        const COMBAT_STATS = ['dmg', 'baseDmg', 'maxHp', 'hp', 'armor', 'magArmor', 'atkSpeedBonus', 'speed'];

        for (const kind of MONSTER_KIND_NAMES) {
            const fn = window[fnNameFor(kind)];
            if (typeof fn !== 'function') continue;

            check(`[${kind}] рівень 0 не дає бонусів`, () => {
                window.getMonDev       = () => ({ soulsSpent: 0, branch: null });
                window.getMonDevGolden = () => ({ goldenSpent: 0, branch: null });

                const unit = makeUnit(kind);
                const base = makeUnit(kind);
                fn(unit);

                if (unit._evoLvl !== 0) return `_evoLvl = ${unit._evoLvl}, очікували 0`;

                const grown = COMBAT_STATS.filter(s => (unit[s] || 0) > (base[s] || 0));
                if (grown.length)
                    return 'бойові стати виросли без витрачених душ: ' +
                           grown.map(s => `${s} ${base[s]}→${unit[s]}`).join(', ');

                const flags = Object.keys(unit).filter(k =>
                    k !== '_evoLvl' && k.startsWith('_evo') && unit[k] === true);
                return flags.length === 0 || 'увімкнені evo-прапорці на рівні 0: ' + flags.join(', ');
            });
        }
    } finally {
        window.getMonDev       = origMonDev;
        window.getMonDevGolden = origGolden;
    }

    return {
        passed: results.filter(r => r.pass).length,
        failed: results.filter(r => !r.pass).length,
        results,
    };
}
