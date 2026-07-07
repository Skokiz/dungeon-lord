# Dungeon Lord

Dark fantasy tower defense — UK/EN. Граєш за Dungeon Lord, захищаєш підземелля від героїв монстрами. Чистий HTML5 Canvas + vanilla JS, без фреймворків і build-системи.

## Запуск

Відкрити `main.html` у браузері. Для превʼю — `test/unit_studio.html` або `test/monster_studio.html`. Ніякого build.

Cache-bust через `?v=NN` у всіх `<script src>` у `main.html` — бампай число коли правиш JS-модель і хочеш щоб студія/гра перечитала.

## Структура

```
main.html                 ~13000+ рядків: canvas, рендер, стан, UI, наратив, всі глобалі
models/
  hero_flat.js            ~3100 рядків: всі 20 героїв + _heroStudio helper + drawLordStudio
  draw_monsters.js        ~2400 рядків: спільні helpers + частина монстрів (slime/skeleton/hounds/zombie/spirit/bat/golem)
  draw_slime.js           окремі складніші монстри
  draw_skeleton.js
  draw_shadow.js
  draw_minotaur.js
  draw_necromancer.js
  draw_water_ele.js / draw_earth_ele.js / draw_air_ele.js / draw_fire_ele.js
  draw_lightning.js
  draw_dark_knight.js
  draw_banshee.js
  draw_dragon.js
  draw_arachne.js / draw_web.js     (павук + веб-сутність)
  draw_lich.js
  draw_abyss.js                     (щупальця-бос)
test/
  unit_studio.html          dropdown на 20 героїв, стани idle/walk/run/attack + поворот
  monster_studio.html       галерея монстрів у 3 розмірах, стани idle/move/fight
```

## Юніти

**Герої (20):** Рекрут I/II, Солдат I/II, Розвідник I/II, Лучник I/II, Маг I/II, Лицар I/II, Берсерк I/II, Паладін I/II, Некромант I/II, Чемпіон I/II. Всі параметризовані через один `drawHeroEgg` + конфіг `STUDIO_HEROES` у `hero_flat.js`. Rank-тонування (elite_hp зелений, elite_atk помаранчевий, boss фіолетовий) — через `drawHeroStudio(rank)`.

**Монстри (20, по рівнях):** Slime, Skeleton, Hounds, Zombie, Spirit, Bat, Golem, Minotaur, Shadow, Necromancer, Water Ele, Earth Ele, Air Ele, Fire Ele, Lightning, Dark Knight, Banshee, Dragon, Arachne, Abyss.

## Стиль

Chibi-egg: овальне тіло без шиї, мала голова, дві крапельки-ноги. Жирний чорний контур 1px, плоска заливка + один тоновий блік. Палітра фіолетово-темна. Контракт: `drawXxx(ctx, p) → hpBarY`, де `p` містить позицію, фазу анімації, dir.

## Ригг юнітів

Два незалежних шари: `.traveler` (X-переміщення) + `.facer` (`scaleX(±1)` дзеркалення). Стани через CSS-класи `.state-walk / .state-run / .state-attack`. Anchor-точки фіксовані: стопи 40/60, торс 50, щит 22, меч 78.

## Лорд (drawLordStudio)

Єдина фіксована модель лорда — `drawLordStudio(ctx, p)` у `hero_flat.js`. Розмір: `sizePC=54` (мобільний: `Math.round(54 * 0.74)`).

Базові характеристики (`_LORD_BASE` в main.html):
```js
const _LORD_BASE = { maxHP: 500, dmg: 20, armor: 5, sizePC: 54 };
```

Дві атаки 50/50, приймає `wdup/strk/recv/ap/state`:
- **Beam** — підняття посоха + випромінювання у `fightTarget` (windup 40% / strike 15% / hold 25% / recov 20%)
- **Slam** — удар посохом униз (windup 50% / strike 12%)

Main.html при малюванні лорда передає `tgtX/tgtY` = центр `this.fightTarget` щоб beam наводився.

## Типографіка — 3 токени

- `--font-ui` — системний sans, body і всі панелі (Arial-хардкоди викорінені)
- `--font-display` — Cinzel/Georgia serif: game-over h1, pause h2, wave-banner label
- `--font-deco` — Cinzel Decorative: старт-заголовок, wave-banner число

Cinzel — **латиниця-only**: кирилиця падає у Georgia (свідомо, виглядає ок). Вантажиться з Google Fonts `<link>` — офлайн буде Georgia-fallback.

**Пастка i18n**: рядки з HTML (`<span class="dl-ico ...">`) працюють тільки через `innerHTML`. `data-i18n` за замовчуванням — `textContent`; додавай `data-i18n-html` атрибут. JS-оновлення кнопок (`_tryBtn` тощо) — теж `innerHTML`, не `textContent`.

## Іконки UI — без системних емодзі

**Валюта — gem-пара** (CSS radial-gradient, розмір в `em` → масштабується зі шрифтом):
- `.soul-gem` — фіолетовий орб, звичайні душі
- `.esoul-gem` — золотий орб, елітні душі

Клас `.esoul-icon` (золочення 💀 через filter) — **видалений**, не повертати: ламався на кольорових Apple/Android емодзі.

**Стат/нав-іконки — `.dl-ico` система**: monochrome mask-SVG (data-URI), тонується `currentColor`. Набір: `dl-crown/trap/beast/flask/sword/heart/shield/bolt/burst/regen/spark/star/bone/eye/ghost/crystal/swirl/moon/drop/orb`. Використання: `<span class="dl-ico dl-sword"></span>`, колір — успадкований або inline `style="color:..."`.

**Canvas**: у збирача душ 💀 замінено хелпером `_drawValOrb(val,cx,cy,font,col)` — малює «число + орб» відцентрованою групою. Для нових canvas-цін використовуй його ж.

**Ще на емодзі** (свідомо не чіпали): спливаючі damage-тексти (`+N💀`), туторіал-підказки (😈), стат-рядки mon-dev списку, дерево еволюцій (SVG), тематичні 💀 у діалогах/i18n.

## Прокачка Лорда — 3×3 матриця

Замість лінійних апгрейдів — сітка 3×3 (Тіло/Розум/Душа × Атака/Захист/Аура), 5 рівнів кожна клітинка. Платиться елітними душами. `_LORD_GRID_DEF[].icon` — клас `.dl-ico` (напр. `'dl-sword'`), рендериться з `def.color`.

**Ключові константи:**
```js
const _LORD_GRID_IDS = ['body_atk','body_def','body_sup','mind_atk','mind_def','mind_sup','soul_atk','soul_def','soul_sup'];
const _LORD_GRID_COSTS = [0, 80, 150, 250, 400, 600]; // cost[lvl] щоб купити lvl
```

**Зберігається:** `_permaData.lordGrid` — об'єкт `{ body_atk: 0..5, ... }`. Міграція зі старих `lordAtkLvl`/`lordVitLvl` → `body_atk`/`body_def`.

**Ключові функції:**
- `_LORD_GRID_DEF` — масив з 9 об'єктів `{ id, row, col, icon, name, color, rowLbl, colLbl, levels[5] }`
- `_applyLordGridEffects(p)` — скидає GAME.lordDmg/lordArmor/etc. до базових і нараховує всі бонуси з сітки
- `buyLordGrid(id)` — купує наступний рівень, списує elite souls, оновлює юніт лорда + UI
- `openLordUpgrade()` / `_renderLordUpgrade()` — overlay `#lord-upg-overlay`
- `_lordUpgNextCost()` — повертає мінімальну вартість наступного доступного апгрейду (для badge)

**UI:** кнопка ⚗️ Прокачка у circle menu лорда → overlay `#lord-upg-overlay`.

**Важливо для `_applyLordGridEffects`:** `soul_def` Lv4 (+40% maxHP) застосовується мультиплікативно після всіх адитивних бонусів — завжди останнім.

## Музика і SFX

### `_Music` IIFE-модуль (оголошений до `init()`)

```js
const _Music = (function() {
    const MENU_SRC = 'music/Under_the_Mountain_Arch.mp3';
    const GAME_SRCS = [/* 5 треків */];
    // ...
    return { playMenu(), startGame(), setVolume(pct), pause(), resume(), stop(fade) };
})();
```

**Важливо: `_Music` оголошений ПЕРЕД `init()`** — інакше TDZ-помилка, бо `_initStartScreen()` викликається з `init()`.

Хуки:
- `_initStartScreen()` → `_Music.playMenu()`
- `startGame()` → `_Music.startGame()`
- `gameOver()` / `gameWin()` / `_peacefulVictory()` → `_Music.stop(true)`
- `togglePause()` pause → `_Music.pause()`, resume → `_Music.resume()`

Autoplay policy: `.play()` в `.catch()` встановлює `_blocked = true`; listener на `click`/`touchstart` відновлює через `_unlock()`.

Гучність: `localStorage('DL_musicVol')`, ціле 0–100. Дефолт 38.

### SFX (`_SFX`, Web Audio API)

Синтезовані звуки: `spawn()`, `death()`, `bossDeath()`, `hit()`, `buy()`, `place()`, `trap()`, `trapFire()`, `lordAtk()`, `lordDeath()`, `win()`. Всі інші (lordHit, wave, elite, ambientStart/Stop) — **видалено**.

### Гучність-слайдер

Присутній у двох місцях:
- `#start-vol-slider` / `#start-vol-label` — у `#start-screen`, ініціалізується в `_initStartScreen()`
- `#music-vol-slider` / `#music-vol-label` — у `#pause-overlay`, ініціалізується в `togglePause()`

Обидва використовують `oninput="_onMusicVolSlider(this.value)"`. Функція синхронізує обидва слайдери і обидва лейбли одночасно.

`_initMusicVolSlider()` — читає `DL_musicVol` і ставить значення у всі 4 елементи.

## Рун-модифікатори (`_RUN_MODS`)

Гравець обирає одне благословення перед кожним раном. 8 варіантів, показуються 3 випадкових.

### `_rms(min, max)` — лінійне масштабування по рівню

```js
function _rms(min, max) {
    const f = Math.min(1, Math.max(0, ((GAME.currentLevel || 1) - 1) / 49));
    return Math.round(min + (max - min) * f);
}
```

Рівень 1 → `min`, рівень 50 → `max`. Використовується в: `lord_fury`, `dark_pact`, `soul_well`, `warlord_aura`, `undying`.

### Список модів (desc відповідає apply):

| id | Ефект |
|---|---|
| `blood_frenzy` | `GAME.soulBonus += 1` — +1 душа за кожне вбивство |
| `elite_surge` | `_runEliteMult = 2` — подвоює ДУШІ від еліт/босів (не спавн-рейт!) |
| `lord_fury` | `GAME.lordDmg *= 1 + _rms(10,35)%` |
| `iron_walls` | `GAME.monsterHpBonus += 40 + heroScalePercent * 0.5` |
| `dark_pact` | `+_rms(2,10)` елітних душ, герої `+_rms(5,20)%` сильніші |
| `soul_well` | `GAME.souls += _rms(30,100)` |
| `warlord_aura` | `GAME.lordGlobalAtkAura += _rms(1,6)` |
| `undying` | `GAME.maxLordHP += _rms(50,200)`, `lordRegen += 1` |

`_runEliteMult` скидається в 1 на початку кожного рану. Використовується: boss дає `6 * _runEliteMult`, elite → `2 * _runEliteMult` елітних душ.

## Ключові фічі головної петлі

- **Drift-fix при resize/zoom**: `main.html` рахує `dx = newCenterX - oldCenterX` і зсуває `floors[].ladderX` + `units[].x`.
- **Resize міста**: `CFG.floorW = Math.min(gW - 200, ...)` (не `gW - 60`) — резервує 200px для міста і марджинів. Мінімальний `_cityScale`: `Math.max(isMobile ? 0.52 : 0.48, ...)`.
- **Монстри**: aggro на тому ж поверсі; patrol зупиняється за 40px від точки входу (щоб не бити свіжих героїв).
- **Ranged кайт** (некромант): якщо герой <110px — відступає з ×1.6 швидкістю.
- **Projectile-частинки**: 5 пурпурних частинок + impact-flash.
- **AoE proc** (мінотавр/голем): рандомний шанс 12% на удар, візуальне кільце тоді ж.
- **Кеш фону**: рендер поверху один раз ліниво при першому `draw()`. Інвалідація — зміна `fw / fh / wallW`. Seed = `depth`.
- **Тіні слаймів**: `ctx.shadowBlur = 3` (було 7) у `draw_slime.js` — менше кровотечі тіні на підлогу.

## Психотип-система (прихований тест 6×6×3)

Три незалежних вектори пишуться у фоні без відома гравця. Результат — архетип на екрані game-over.

### Структура `_psyTrack`
```js
_psyTrack = {
    buys:     { lord:0, monster:0, floor:0, trap:0, total:0 }, // кількість рішень
    priority: { lord:0, monster:0, floor:0, trap:0 },          // бонус за першу купівлю після хвилі
    firstBuyDone: false,   // скидається на кожній хвилі
    decisions: { dom:0, pom:0, zna:0, vyj:0, kha:0, per:0 },  // теги з "Донесень"
    combat:    { lordAttacks:0, lordKills:0, totalKills:0 },   // темперамент
    rounds:    0, shown:[], pending:false,
};
```

### Σ Стратегія — 6 варіантів

Кожна категорія нормалізується до `[0, 1.0]` своїм cap:
- **syla** (лорд): cap=45 (9 клітинок × 5 рівнів)
- **lehion** (монстри): cap=`rounds × 2`
- **fortress** (поверхи): cap=`_MAX_FLOORS=20`
- **trap**: cap=`floors.length - 1`

```js
const _sc = (buys, prio, cap) => Math.min((buys + prio * 0.5) / Math.max(cap, 1), 1.0);
```

Перша купівля після кожної хвилі: `_psyBuy(cat)` нараховує `priority[cat]++` якщо `!firstBuyDone`. Якщо жодна категорія не перевищує поріг 0.12 — "Скарбниця" (hoarding: `buys.total / rounds < 1.0`).

**Хуки:** `_psyBuy('lord'/'monster'/'floor'/'trap')` у `buyLordGrid`, `buyMonStat`, `buyFloor`, `buyTrap`.

### Φ Характер — 6 варіантів (Донесення)

15 текстових подій-оверлеїв (overlay `#donesnnia-overlay`) тригеряться на `wave_start`/`wave_end`. Гравець вибирає варіант → теги `{ dom, pom, zna, vyj, kha, per }` інкрементуються, бафи для GAME.* (heroThreatPct, lordDmg тощо) застосовуються непомітно.

**Ключові функції:** `_psyReset()`, `_psyBuy(cat)`, `_psyCheck(trigger)`, `_showDonesnnia(ev)`, `_psyDismiss(choiceIdx)`.

### Θ Темперамент — 3 варіанти

Kill attribution: `enemy._lastHitBy = this.type` при attack-hit. При смерті героя:
- `_psyTrack.combat.totalKills++`
- якщо `._lastHitBy === 'lord'` → `lordKills++`

Лорд-атаки → `lordAttacks++` при кожному хіті лорда.

### `_computePsychotype()` → `_showPsychotypeResult()`

Викликається з `gameOver()`. Повертає: `{ stratKey, charKey, tempKey, scores, buys, decisions, combat, rounds }`. Bar-chart у `#psy-result-panel`:
```
💜 Лорд: 15 рішень ████░░░░░░ ◄
```

Повний дизайн матриці — `D:/Claude/brain/projects/dungeon-lord-psychotype.md`.

## Бестіарій / Розвиток монстрів

Панель "Розвиток" показує базові стати монстра через `_monDevBaseInfoFor(level)`. Повертає: `atk`, `hp`, `dmgType`, `armor`, `magArmor`, `regen`, `atkSpd`. Відображаються: Атака, ХП, Броня (фіз/маг), Реген, ША, Тип атаки.

## Важливо

- **Vanilla JS + Canvas 2D** — ніяких фреймворків, npm, збірки.
- **localStorage** для state (Telegram WebApp-сумісний, обгорнутий у try-catch).
- **Anthropic API** (опційно): `claude-haiku-4-5-20251001` для персоналізованих вступів, ключ вводиться в грі.
- **Playwright MCP** підключений локально (`.mcp.json`) — використовуй для UI-тесту/скрінів.
- **i18n** — `models/i18n.js`: `_lang` (uk/en), `_t(key, vars)` для JS-рядків, `data-i18n` атрибути для HTML елементів, `_setLang(l)` перемикає + зберігає в localStorage. `_getDecisionEvents()` і `_getPsyDesc()` повертають відповідний масив/об'єкт. `_applyLang()` викликається при старті і при перемиканні. `_PSY_TEMP_LINE` — lazy functions: `_PSY_TEMP_LINE.hot()`.
- Мова інтерфейсу — **UK/EN**, тон саркастичний dark fantasy.
- Sonnet достатньо. Opus — тільки для складної геймплей-логіки/архітектури.

## При структурних змінах

Оновлюй:
1. Цей `CLAUDE.md` (Claude-facing onboarding)
2. `D:/Claude/brain/projects/dungeon-lord.md` (зовнішній індекс)

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
