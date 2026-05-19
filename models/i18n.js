// models/i18n.js — Dungeon Lord localization (UK / EN)
'use strict';

let _lang = (function() {
    try { return localStorage.getItem('DL_lang') || 'uk'; } catch(e) { return 'uk'; }
})();

// ── UI string tables ──────────────────────────────────────────────────────────
const _I18N = {
uk: {
  // Start screen
  'lvl-label':      'Рівень',
  'btn-start':      '▶ Почати гру',
  'btn-level':      '▶ Рівень {n}',
  'btn-instr':      '📖 Інструкція',
  'btn-reset':      '↺ Скинути все',
  // Soul dungeon
  'sd-title':       '💜 Душа Підземелля',
  'sd-hint':        'Витрачай Елітні Душі на назавжди-покращення.<br>Ефект застосовується з наступного рівня.',
  'btn-back':       '← Назад',
  // Instructions
  'instr-title':    '📖 Інструкція',
  'instr-goal-h':   '🎯 Мета',
  'instr-goal':     'Захисти підземелля від героїв. Знищ місто ворогів (зменши ❤️ до 0), перш ніж герої вб\'ють твого Лорда 💜.',
  'instr-souls-h':  '💀 Душі',
  'instr-souls':    'Вбивай героїв — отримуй Душі 💀. Купуй нові поверхи, монстрів, пастки, покращуй Лорда і монстрів.',
  'instr-elite-h':  'Елітні Душі',
  'instr-elite':    'З елітних героїв випадає 1💀, з босів — 3💀. Вони зберігаються між рівнями. Використовуй їх у Душі Підземелля для назавжди-покращень.',
  'instr-floor-h':  '🏗️ Поверхи',
  'instr-floor':    'Будуй нові поверхи кнопкою "Побудувати поверх". Кожен поверх може мати монстрів і пастки.',
  'instr-mon-h':    '⚔️ Монстри',
  'instr-mon':      'Виклик монстра коштує душі. Покращуй атаку і HP монстрів глобально через меню.',
  'instr-trap-h':   '🌀 Пастки',
  'instr-trap':     'Купи пастку → натисни на поверх щоб встановити. Шипи 🗡️ — урон, Дротик 🪃 — обстріл, Телепорт 🌀 — відправляє назад, Монстр 👾 — виклик захисника.',
  'instr-lvl-h':    '📈 Рівні 1–50',
  'instr-lvl':      'Кожен рівень місто стає сильнішим, а герої потужнішими. Пройди всі 50 рівнів!',
  // Story
  'lord-name':      '👑 Лорд',
  'story-tap':      'Натисни щоб продовжити ▼',
  'story-loading':  'Лорд думає... що само по собі вже підозріло',
  'story-skip':     'Пропустити →',
  // Pause
  'pause-title':    '⏸ ПАУЗА',
  'pause-resume':   'Продовжити',
  'pause-restart':  '🔄 Рестарт',
  'pause-api':      '🤖 Claude API-ключ',
  // Game over
  'go-defeat':      'ПОРАЗКА',
  'go-dead':        'Володаря вбито...',
  'go-win-all':     '🏆 ГРУ ПРОЙДЕНО!',
  'go-win-lvl':     'Рівень {n} пройдено!',
  'go-all50':       'Всі 50 рівнів пройдено! 🎉',
  'go-next':        'Далі: Рівень {n} / 50',
  'go-elite':       '+{n} 💀 зароблено (всього: {t})',
  'go-retry':       '🔄 Спробувати знову',
  'go-retry-all':   '🔄 Грати заново',
  'go-next-btn':    '→ Рівень {n}',
  'btn-share':      '📤 Поділитись результатом',
  // Branch choice
  'branch-subtitle': 'Обери шлях розвитку — рішення невідворотне',
  'branch-warn':    'Після вибору інша гілка стане недоступною для цього монстра',
  // Monster dev
  'mon-dev-label':  'Розвиток: ',
  // HUD
  'hud-city':       'Місто',
  'hud-lord':       'Володар',
  'hud-threat':     'Загроза — ',
  'hud-heroes':     'Сила героїв — ',
  // Controls
  'ctrl-lord':      'Лорд',
  'ctrl-lord-upg':  'Прокачка',
  'ctrl-trap':      'Пастки',
  'trap-spike':     'Шипи',
  'trap-spike-d':   'фіз. шкода',
  'trap-dart':      'Дротик',
  'trap-dart-d':    'дальня атака',
  'trap-tele':      'Телепорт',
  'trap-tele-d':    'відкидає назад',
  'trap-summon':    'Виклик',
  'trap-summon-d':  'спавн монстра',
  'ctrl-bestiary':  'Бестіарій',
  'btn-floor':      'Побудувати поверх',
  'btn-wave':       'АТАКА',
  'btn-wave-cd':    '⚔️ АТАКА ({n}с)',
  'btn-wave-ready': '⚔️ АТАКА',
  'btn-pause':      'Пауза',
  // Trap install hint
  'trap-hint-line1':'Натисни на поверх',
  'trap-hint-line2':'для встановлення пастки',
  // Help modal
  'help-title':     '👑 Dungeon Lord: Siege Defense',
  'help-sub':       'Ти — Повелитель Підземелля. Не дай героям дістатись до міста!',
  'help-souls':     '<b>Душі</b> — твоя валюта. Збираєш їх убиваючи героїв, витрачаєш на розвиток.',
  'help-atk':       '<b>АТАКА</b> — запускає наступну групу героїв. <span class="hd">Чим раніше натиснеш — тим більше бонусних душ!</span>',
  'help-floor':     '<b>Поверх</b> — будує новий підземний поверх. <span class="hd">На поверхах стоять монстри і можна ставити пастки — чим глибше герой йде, тим важче йому вижити.</span>',
  'help-trap':      '<b>Пастки</b> — купи пастку, потім <span class="hd">натисни на поверх</span> щоб встановити. Шипи — шкода, Дротик — обстріл, Телепорт — повертає назад, Виклик — призиває монстра.',
  'help-lord-row':  '<b>Володар</b> — твій персонаж що атакує героїв на поверхні. Прокачуй атаку і HP.',
  'help-monsters':  '<b>Монстри</b> — покращуй атаку і витривалість усіх монстрів підземелля одночасно.',
  'help-camera':    '<span class="hd">Потягни камеру вгору/вниз</span> щоб побачити глибші поверхи.',
  'help-ok':        '✅ Зрозуміло! Починаємо!',
  // Daily panel
  'daily-title':    '📋 Завдання дня',
  'dq-kills':       '○ Знищ 5 героїв +5💀',
  'dq-kills-done':  '✓ Знищ 5 героїв +5💀',
  'dq-wave':        '○ Запусти хвилю +5💀',
  'dq-wave-done':   '✓ Запусти хвилю +5💀',
  'dq-upgrade':     '○ Апгрейдни +5💀',
  'dq-upgrade-done':'✓ Апгрейдни +5💀',
  // Toast
  'toast-copied':   '📋 Скопійовано!',
  'toast-streak':   '🔥 Серія {n} дні! +{b} 💀',
  'toast-quest':    '✅ Завдання виконано! +5 💀',
  // Tutorial
  'tut-label':      'Підказка {n} / {t}',
  'tut-skip':       'Пропустити',
  'tut-next':       'Далі →',
  'tut-done':       '✅ Зрозуміло!',
  'tut-step1':      '⚔️ Натисни <b>АТАКА</b> — відправ першу хвилю ворогів у підземелля!',
  'tut-step2':      '💀 За кожного вбитого героя отримуєш <b>Душі</b>. Трать їх між хвилями на монстрів, поверхи і пастки.',
  'tut-step3':      '🪤 <b>Пастки</b> добивають тих хто прорвався. Шипи — шкода, Телепорт — відкидає назад, Виклик — спавн монстра. Натисни поверх після покупки.',
  'tut-step4':      '👑 <b>Лорд</b> б\'ється особисто на поверхні. Натисни на нього щоб відкрити апгрейди. Вдалого полювання!',
  // Share
  'share-text':     '👑 Я — {arch} у Dungeon Lord!\nОбороняв {r} хвиль, знищив {k} ворогів.\n🔗 github.com/Skokiz/dungeon-lord',
  // Psy-whisper
  'psy-lord':       'Лорд',
  'psy-army':       'Армія',
  'psy-fortress':   'Фортеця',
  'psy-traps':      'Пастки',
  'psy-hoard':      'Резерв',
  'psy-hint':       '💭 Твій стиль: {s}',
  // Psy result panel
  'psy-lbl-lord':   'Лорд',
  'psy-lbl-army':   'Монстри',
  'psy-lbl-floor':  'Поверхи',
  'psy-lbl-trap':   'Пастки',
  'psy-decisions':  'рішень',
  'psy-played-as':  '🔮 Ти зіграв як:',
  'psy-stats':      'Статистика',
  'psy-no-dec':     '📜 Рішень не приймалось',
  'psy-rounds':     '📊 Раундів: {n}',
  'psy-lord-kills': 'лорд особисто {r}% з {k} вбивств',
  'psy-few-data':   'замало даних ({k} вбивств, сер. {a} атак/раунд)',
  'psy-char-dom':   'Влада',
  'psy-char-pom':   'Помста',
  'psy-char-zna':   'Знання',
  'psy-char-vyj':   'Виживання',
  'psy-char-kha':   'Хаос',
  'psy-char-per':   'Архітектура',
  'psy-temp-hot':   'Ти не спостерігав — ти сам стояв у перших рядах.',
  'psy-temp-cold':  'Поки підземелля горіло, ти знав що робити — і це не було "йти вперед".',
  'psy-temp-cyn':   'Ти бився тільки коли це мало сенс. Зазвичай мало.',
  // Lord upgrade panel
  'lud-rv':         'Рв',
  'lud-maxed':      '✨ Максимальний рівень',
  'lud-upgrade':    'Прокачати — {n} 💀',
  'lud-need':       'Потрібно {n} 💀 еліт',
  'lud-lvl-of':     'Рівень {n}/5',
  // Perma cards
  'perma-lvl':      'Рівень: {n}',
  // Confirm reset
  'confirm-reset':  'Скинути ВСЕ? Рівень, елітні душі, прокачки та сюжет повернуться до початку.',
  // Lang button
  'lang-btn':       '🇬🇧 EN',
  // Run modifiers
  'mod-pick-title': 'Оберіть благословення цього рану',
  'mod-blood':      '💀 Жага крові',     'mod-blood-d':   '+1 душа за кожного вбитого ворога',
  'mod-elite':      '⚡ Елітна вилазка', 'mod-elite-d':   'Елітні душі ×2 цей ран',
  'mod-fury':       '🔥 Лють Лорда',     'mod-fury-d':    '+25% до атаки Лорда',
  'mod-iron':       '🏰 Залізні Стіни',  'mod-iron-d':    'Монстри отримують бонус HP залежно від рівня',
  'mod-pact':       '🌑 Темний Пакт',    'mod-pact-d':    '+5 💀 зараз, але герої на +15% сильніші',
  'mod-well':       '💧 Криниця Душ',    'mod-well-d':    '+80 звичайних душ на старті',
  'mod-aura':       '👹 Аура Воєнлорда', 'mod-aura-d':    'Всі монстри отримують +4 до атаки',
  'mod-regen':      '💜 Незламний',      'mod-regen-d':   '+150 HP Лорда і +1 регенерація HP/сек',
  // Milestone titles
  'title-arch':     '☠ Арх-Демон',
  'title-overlord': '💀 Темний Владика',
  'title-master':   '🔮 Майстер Підземелль',
  'title-dark':     '⚔ Темний Лорд',
  'title-lord':     '🦴 Лорд Підземелля',
  'title-novice':   '👑 Лорд-Початківець',
},

en: {
  // Start screen
  'lvl-label':      'Level',
  'btn-start':      '▶ Start Game',
  'btn-level':      '▶ Level {n}',
  'btn-instr':      '📖 How to Play',
  'btn-reset':      '↺ Reset All',
  // Soul dungeon
  'sd-title':       '💜 Soul of the Dungeon',
  'sd-hint':        'Spend Elite Souls on permanent upgrades.<br>Takes effect from the next level.',
  'btn-back':       '← Back',
  // Instructions
  'instr-title':    '📖 How to Play',
  'instr-goal-h':   '🎯 Goal',
  'instr-goal':     'Defend your dungeon from heroes. Destroy the enemy city (reduce ❤️ to 0) before heroes kill your Lord 💜.',
  'instr-souls-h':  '💀 Souls',
  'instr-souls':    'Kill heroes — earn Souls 💀. Buy floors, monsters, traps, upgrade the Lord and monsters.',
  'instr-elite-h':  'Elite Souls',
  'instr-elite':    'Elite heroes drop 1💀, bosses drop 3💀. They persist between levels. Use them in Soul of the Dungeon for permanent upgrades.',
  'instr-floor-h':  '🏗️ Floors',
  'instr-floor':    'Build new floors with the "Build Floor" button. Each floor can have monsters and traps.',
  'instr-mon-h':    '⚔️ Monsters',
  'instr-mon':      'Summoning monsters costs souls. Upgrade all monsters\' attack and HP globally through the menu.',
  'instr-trap-h':   '🌀 Traps',
  'instr-trap':     'Buy a trap → tap a floor to install. Spikes 🗡️ — damage, Dart 🪃 — ranged fire, Teleport 🌀 — sends hero back, Monster 👾 — summons a guardian.',
  'instr-lvl-h':    '📈 Levels 1–50',
  'instr-lvl':      'Each level the city grows stronger and heroes more powerful. Beat all 50 levels!',
  // Story
  'lord-name':      '👑 Lord',
  'story-tap':      'Tap to continue ▼',
  'story-loading':  'The Lord is thinking... which is already suspicious',
  'story-skip':     'Skip →',
  // Pause
  'pause-title':    '⏸ PAUSED',
  'pause-resume':   'Resume',
  'pause-restart':  '🔄 Restart',
  'pause-api':      '🤖 Claude API Key',
  // Game over
  'go-defeat':      'DEFEAT',
  'go-dead':        'Your Lord has fallen...',
  'go-win-all':     '🏆 GAME COMPLETE!',
  'go-win-lvl':     'Level {n} cleared!',
  'go-all50':       'All 50 levels conquered! 🎉',
  'go-next':        'Next: Level {n} / 50',
  'go-elite':       '+{n} 💀 earned (total: {t})',
  'go-retry':       '🔄 Try Again',
  'go-retry-all':   '🔄 Play Again',
  'go-next-btn':    '→ Level {n}',
  'btn-share':      '📤 Share Result',
  // Branch choice
  'branch-subtitle': 'Choose an evolution path — this decision is final',
  'branch-warn':    'After choosing, the other branch will be locked for this monster',
  // Monster dev
  'mon-dev-label':  'Develop: ',
  // HUD
  'hud-city':       'City',
  'hud-lord':       'Lord',
  'hud-threat':     'Threat — ',
  'hud-heroes':     'Hero power — ',
  // Controls
  'ctrl-lord':      'Lord',
  'ctrl-lord-upg':  'Upgrade',
  'ctrl-trap':      'Traps',
  'trap-spike':     'Spikes',
  'trap-spike-d':   'phys damage',
  'trap-dart':      'Dart',
  'trap-dart-d':    'ranged fire',
  'trap-tele':      'Teleport',
  'trap-tele-d':    'pushes back',
  'trap-summon':    'Summon',
  'trap-summon-d':  'spawn monster',
  'ctrl-bestiary':  'Bestiary',
  'btn-floor':      'Build Floor',
  'btn-wave':       'ATTACK',
  'btn-wave-cd':    '⚔️ ATTACK ({n}s)',
  'btn-wave-ready': '⚔️ ATTACK',
  'btn-pause':      'Pause',
  // Trap install hint
  'trap-hint-line1':'Tap a floor',
  'trap-hint-line2':'to place the trap',
  // Help modal
  'help-title':     '👑 Dungeon Lord: Siege Defense',
  'help-sub':       'You are the Dungeon Lord. Don\'t let heroes reach the city!',
  'help-souls':     '<b>Souls</b> — your currency. Earn by killing heroes, spend on upgrades.',
  'help-atk':       '<b>ATTACK</b> — sends the next wave of heroes. <span class="hd">The sooner you press — the more bonus souls you get!</span>',
  'help-floor':     '<b>Floor</b> — builds a new dungeon level. <span class="hd">Floors hold monsters and traps — the deeper heroes go, the harder it is to survive.</span>',
  'help-trap':      '<b>Traps</b> — buy a trap, then <span class="hd">tap a floor</span> to install. Spikes — damage, Dart — ranged fire, Teleport — sends back, Summon — calls a monster.',
  'help-lord-row':  '<b>Lord</b> — your character who attacks heroes on the surface. Upgrade attack and HP.',
  'help-monsters':  '<b>Monsters</b> — upgrade all dungeon monsters\' attack and endurance at once.',
  'help-camera':    '<span class="hd">Drag the camera up/down</span> to see deeper floors.',
  'help-ok':        '✅ Got it! Let\'s start!',
  // Daily panel
  'daily-title':    '📋 Daily Quests',
  'dq-kills':       '○ Kill 5 heroes +5💀',
  'dq-kills-done':  '✓ Kill 5 heroes +5💀',
  'dq-wave':        '○ Trigger a wave +5💀',
  'dq-wave-done':   '✓ Trigger a wave +5💀',
  'dq-upgrade':     '○ Upgrade something +5💀',
  'dq-upgrade-done':'✓ Upgrade something +5💀',
  // Toast
  'toast-copied':   '📋 Copied!',
  'toast-streak':   '🔥 {n}-day streak! +{b} 💀',
  'toast-quest':    '✅ Quest complete! +5 💀',
  // Tutorial
  'tut-label':      'Tip {n} / {t}',
  'tut-skip':       'Skip',
  'tut-next':       'Next →',
  'tut-done':       '✅ Got it!',
  'tut-step1':      '⚔️ Press <b>ATTACK</b> — send the first wave of enemies into the dungeon!',
  'tut-step2':      '💀 Each hero you kill earns <b>Souls</b>. Spend them between waves on monsters, floors, and traps.',
  'tut-step3':      '🪤 <b>Traps</b> finish off those who broke through. Spikes — damage, Teleport — pushes back, Summon — spawns a monster. Tap a floor after buying.',
  'tut-step4':      '👑 The <b>Lord</b> fights personally on the surface. Tap him to open upgrades. Good hunting!',
  // Share
  'share-text':     '👑 I am the {arch} in Dungeon Lord!\nDefended {r} waves, destroyed {k} enemies.\n🔗 github.com/Skokiz/dungeon-lord',
  // Psy-whisper
  'psy-lord':       'Lord',
  'psy-army':       'Army',
  'psy-fortress':   'Fortress',
  'psy-traps':      'Traps',
  'psy-hoard':      'Reserve',
  'psy-hint':       '💭 Your style: {s}',
  // Psy result panel
  'psy-lbl-lord':   'Lord',
  'psy-lbl-army':   'Monsters',
  'psy-lbl-floor':  'Floors',
  'psy-lbl-trap':   'Traps',
  'psy-decisions':  'decisions',
  'psy-played-as':  '🔮 You played as:',
  'psy-stats':      'Statistics',
  'psy-no-dec':     '📜 No decisions taken',
  'psy-rounds':     '📊 Rounds: {n}',
  'psy-lord-kills': 'lord personally {r}% of {k} kills',
  'psy-few-data':   'insufficient data ({k} kills, avg {a} attacks/round)',
  'psy-char-dom':   'Power',
  'psy-char-pom':   'Revenge',
  'psy-char-zna':   'Knowledge',
  'psy-char-vyj':   'Survival',
  'psy-char-kha':   'Chaos',
  'psy-char-per':   'Architecture',
  'psy-temp-hot':   "You didn't observe — you stood in the front lines yourself.",
  'psy-temp-cold':  'While the dungeon burned, you knew what to do — and it wasn\'t "charge forward".',
  'psy-temp-cyn':   'You fought only when it made sense. It usually did.',
  // Lord upgrade panel
  'lud-rv':         'Lv',
  'lud-maxed':      '✨ Maximum level',
  'lud-upgrade':    'Upgrade — {n} 💀',
  'lud-need':       'Need {n} 💀 elite',
  'lud-lvl-of':     'Level {n}/5',
  // Perma cards
  'perma-lvl':      'Level: {n}',
  // Confirm reset
  'confirm-reset':  'Reset EVERYTHING? Level, elite souls, upgrades and story will return to the beginning.',
  // Lang button
  'lang-btn':       '🇺🇦 UA',
  // Run modifiers
  'mod-pick-title': 'Choose this run\'s blessing',
  'mod-blood':      '💀 Blood Frenzy',    'mod-blood-d':   '+1 soul per enemy killed',
  'mod-elite':      '⚡ Elite Surge',     'mod-elite-d':   'Elite souls ×2 this run',
  'mod-fury':       '🔥 Lord\'s Fury',    'mod-fury-d':    '+25% Lord attack damage',
  'mod-iron':       '🏰 Iron Walls',      'mod-iron-d':    'Monsters gain bonus HP based on level',
  'mod-pact':       '🌑 Dark Pact',       'mod-pact-d':    '+5 💀 now, but heroes are +15% stronger',
  'mod-well':       '💧 Soul Well',       'mod-well-d':    '+80 souls at the start',
  'mod-aura':       '👹 Warlord Aura',    'mod-aura-d':    'All monsters gain +4 attack',
  'mod-regen':      '💜 Undying',         'mod-regen-d':   '+150 Lord HP and +1 HP/sec regen',
  // Milestone titles
  'title-arch':     '☠ Arch Demon',
  'title-overlord': '💀 Dark Overlord',
  'title-master':   '🔮 Dungeon Master',
  'title-dark':     '⚔ Dark Lord',
  'title-lord':     '🦴 Dungeon Lord',
  'title-novice':   '👑 Aspiring Lord',
},
};

// ── Translation function ──────────────────────────────────────────────────────
function _t(key, vars) {
    const d = _I18N[_lang] || _I18N['uk'];
    let s = (key in d) ? d[key] : (_I18N['uk'][key] || key);
    if (vars) {
        for (var k in vars) s = s.split('{' + k + '}').join(vars[k]);
    }
    return s;
}

// ── Language switch ───────────────────────────────────────────────────────────
function _setLang(l) {
    _lang = l;
    try { localStorage.setItem('DL_lang', l); } catch(e) {}
    _applyLang();
}

function _applyLang() {
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
        var key = el.getAttribute('data-i18n');
        if (el.getAttribute('data-i18n-html') !== null) {
            el.innerHTML = _t(key);
        } else {
            el.textContent = _t(key);
        }
    });
    var btn = document.getElementById('btn-lang');
    if (btn) btn.textContent = _t('lang-btn');
    // Update html lang attribute
    document.documentElement.lang = _lang;
}

// ── English decision events ───────────────────────────────────────────────────
const _DECISION_EVENTS_EN = [
    { id:'prisoner_knight', trigger:'wave_start', minRound:1, weight:3,
      badge:'📜 Intelligence Report', title:'Captured Knight',
      text:'A scout reports: a wounded knight is asking for shelter in exchange for information about the next company.',
      choices:[
        { text:'→ Interrogate and release', tags:['zna','vyj'], buff:{ heroThreatPct:-0.5 } },
        { text:'→ Throw in a cell. Could be useful later', tags:['dom'], buff:{ soulBonus:2 } },
        { text:'→ Execute publicly. Let them know', tags:['pom','per'], buff:{ eliteChance:2 } },
      ]},
    { id:'village_revolt', trigger:'wave_end', minRound:2, weight:2,
      badge:'📜 Village Report', title:'Popular Uprising',
      text:'Villagers have blocked the roads — heroes must detour. They await the Lord\'s response.',
      choices:[
        { text:'→ Take them under protection. Allies are useful', tags:['vyj'], buff:{ soulBonus:3, eliteChance:-2 } },
        { text:'→ Ignore. Not my problem', tags:['kha'], buff:{} },
        { text:'→ Intimidate and subjugate', tags:['dom'], buff:{ captainChance:2 } },
      ]},
    { id:'traitor', trigger:'wave_start', minRound:3, weight:2,
      badge:'⚠️ Warning', title:'Traitor in the Ranks',
      text:'A monster was caught passing dungeon maps to heroes. It awaits sentencing.',
      choices:[
        { text:'→ Public execution. Discipline above all', tags:['dom','pom'], buff:{ soulBonus:5, heroThreatPct:0.5 } },
        { text:'→ Turn into a double agent', tags:['zna','kha'], buff:{ eliteChance:-3 } },
        { text:'→ Extract all intel and release', tags:['zna'], buff:{ heroThreatPct:-0.5 } },
      ]},
    { id:'guild_pact', trigger:'wave_start', minRound:2, weight:2,
      badge:'🤝 Offer', title:'Guild Proposal',
      text:'An adventurers\' guild offers a temporary pact: 90 seconds without attacks in exchange for 60 souls.',
      choices:[
        { text:'→ Accept. A breather matters', tags:['vyj'], buff:{ soulBonus:8 } },
        { text:'→ Refuse with contempt', tags:['per','pom'], buff:{} },
        { text:'→ Accept and break it at the right moment', tags:['kha','dom'], buff:{ heroThreatPct:1, soulBonus:15 } },
      ]},
    { id:'dark_relic', trigger:'wave_end', minRound:4, weight:2,
      badge:'🔮 Discovery', title:'Dark Relic',
      text:'Monsters unearthed a relic from the wall. It pulses inexplicably. What to do with it?',
      choices:[
        { text:'→ Study it carefully', tags:['zna'], buff:{ lordDmg:3 } },
        { text:'→ Destroy it. Nothing unnecessary', tags:['per','vyj'], buff:{ heroThreatPct:-0.5 } },
        { text:'→ Absorb the power. Risk is justified', tags:['dom','kha'], buff:{ lordDmg:8, heroThreatPct:1 } },
      ]},
    { id:'wounded_hero', trigger:'wave_end', minRound:1, weight:3,
      badge:'⚔️ After Battle', title:'Wounded Hero',
      text:'A hero lies alive in the corridor after battle. The monsters await orders.',
      choices:[
        { text:'→ Heal and release. Show magnanimity', tags:['vyj','zna'], buff:{ captainChance:-3 } },
        { text:'→ Convert into a dungeon servant', tags:['dom','kha'], buff:{ soulBonus:5 } },
        { text:'→ Sacrifice. Power matters more', tags:['per','dom'], buff:{ eliteChance:-1 } },
      ]},
    { id:'night_raid', trigger:'wave_start', minRound:3, weight:2,
      badge:'🌑 Night Intel', title:'Night Raid',
      text:'Heroes sleep in camp. Monsters propose a sortie. Success chance: 70%.',
      choices:[
        { text:'→ Wait. Let them come to us', tags:['vyj'], buff:{} },
        { text:'→ Send monsters on a raid', tags:['dom','kha'], buff:{ heroThreatPct:-1, eliteChance:2 } },
        { text:'→ Set traps around the camp', tags:['kha','per'], buff:{ soulBonus:4 } },
      ]},
    { id:'prophecy', trigger:'wave_start', minRound:5, weight:1,
      badge:'🔮 Prophecy', title:'The Witch\'s Vision',
      text:'A witch sees in the flames: the next wave is especially dangerous. She demands a sacrifice.',
      choices:[
        { text:'→ Prepare normally. Superstition is not for lords', tags:['per'], buff:{} },
        { text:'→ Make the sacrifice', tags:['dom','per'], buff:{ heroThreatPct:-1 } },
        { text:'→ Tell the witch to leave', tags:['kha'], buff:{ soulBonus:3 } },
      ]},
    { id:'deserters', trigger:'wave_end', minRound:4, weight:2,
      badge:'⚠️ Incident', title:'Deserters',
      text:'Three monsters abandoned their posts during the attack. Reason: fear. The rest of the army is watching.',
      choices:[
        { text:'→ Execute before the ranks', tags:['dom'], buff:{ soulBonus:5, heroThreatPct:0.3 } },
        { text:'→ Forgive. Anyone can be afraid', tags:['vyj'], buff:{} },
        { text:'→ Assign to the most dangerous tasks', tags:['zna','kha'], buff:{ captainChance:-2 } },
      ]},
    { id:'ambassador', trigger:'wave_start', minRound:6, weight:1,
      badge:'🤝 Envoy', title:'Royal Ambassador',
      text:'The king\'s ambassador offers: leave upper floors free — and the city won\'t send more heroes.',
      choices:[
        { text:'→ Negotiate. Details matter', tags:['zna','vyj'], buff:{ heroThreatPct:-1 } },
        { text:'→ Kill the ambassador. We don\'t negotiate', tags:['pom','dom'], buff:{ eliteChance:3, heroThreatPct:0.5 } },
        { text:'→ Agree and break it when it suits us', tags:['kha','dom'], buff:{ soulBonus:8 } },
      ]},
    { id:'trophy', trigger:'wave_end', minRound:2, weight:3,
      badge:'⚔️ Trophy', title:'Weapon of the Fallen',
      text:'A slain hero carried a rare weapon. What to do with it?',
      choices:[
        { text:'→ Disassemble and study', tags:['zna'], buff:{ lordDmg:3 } },
        { text:'→ Decorate the throne', tags:['per'], buff:{ soulBonus:2 } },
        { text:'→ Send back as a challenge', tags:['pom'], buff:{ captainChance:3, eliteChance:2 } },
      ]},
    { id:'legend', trigger:'wave_end', minRound:7, weight:1,
      badge:'📜 Rumors', title:'Folk Legend',
      text:'Bards are spreading legends about the lord\'s cruelty. Some are true.',
      choices:[
        { text:'→ Amplify the legend: send your own storytellers', tags:['dom','per'], buff:{ eliteChance:-3 } },
        { text:'→ Quietly refute it', tags:['zna'], buff:{ captainChance:-2 } },
        { text:'→ Ignore it', tags:['kha'], buff:{} },
      ]},
    { id:'spy_map', trigger:'wave_start', minRound:5, weight:1,
      badge:'🔍 Intelligence', title:'Map Leaked',
      text:'Discovered: heroes have an accurate map of all dungeon floors.',
      choices:[
        { text:'→ Reconstruct the labyrinth', tags:['per','vyj'], buff:{ heroThreatPct:-1 } },
        { text:'→ Spread disinformation', tags:['zna','kha'], buff:{ captainChance:-3 } },
        { text:'→ Accept it as a challenge — we\'ll win anyway', tags:['dom','per'], buff:{ heroThreatPct:0.5 } },
      ]},
    { id:'necro_offer', trigger:'wave_start', minRound:8, weight:1,
      badge:'💀 Offer', title:'The Necromancer\'s Word',
      text:'A necromancer offers to raise dead heroes against their own — once, but powerfully.',
      choices:[
        { text:'→ Agree. Resources should be used', tags:['kha','zna'], buff:{ soulBonus:6 } },
        { text:'→ Refuse. Our own army is better', tags:['dom','per'], buff:{ lordDmg:5 } },
        { text:'→ Use it, then eliminate the necromancer', tags:['dom','kha'], buff:{ lordDmg:8, heroThreatPct:0.5 } },
      ]},
    { id:'fire_corridor', trigger:'wave_end', minRound:3, weight:2,
      badge:'🔥 Emergency', title:'Fire in the Corridors',
      text:'Fire in the third corridor. Monsters hesitate. Minutes to decide.',
      choices:[
        { text:'→ Extinguish immediately. Minimal losses', tags:['vyj'], buff:{} },
        { text:'→ Let it burn — distracts heroes', tags:['kha'], buff:{ soulBonus:3 } },
        { text:'→ Turn it into a controlled fire-trap', tags:['zna','per'], buff:{ eliteChance:2 } },
      ]},
    { id:'prisoner_return', trigger:'wave_start', minRound:4, weight:2,
      requires: { id:'prisoner_knight', choice:0 },
      badge:'⚔️ Return', title:'The Knight Returns',
      text:'The knight you released is back — not with a sword, but with an unrolled scroll and an offer to become an informant. Says he fights for coin, not ideology.',
      choices:[
        { text:'→ Take him as an informant. Unreliable, but useful', tags:['zna','kha'], buff:{ heroThreatPct:-1 } },
        { text:'→ Refuse. Those who yield easily betray easily', tags:['per','dom'], buff:{} },
        { text:'→ Take him and secretly report him to the city. Let them deal with it', tags:['kha'], buff:{ soulBonus:10 } },
      ]},
    { id:'prisoner_revenge', trigger:'wave_start', minRound:4, weight:2,
      requires: { id:'prisoner_knight', choice:1 },
      badge:'🩸 Blood Feud', title:'The Knight\'s Brother',
      text:'The executed knight\'s brother has taken command of the next wave. He isn\'t just fighting — he\'s heading straight for your floor. Messengers say: he has a name for you, and it isn\'t flattering.',
      choices:[
        { text:'→ Prepare separately: rage makes people predictable', tags:['per','vyj'], buff:{ heroThreatPct:1.5 } },
        { text:'→ Try negotiations. Gold quenches even fire', tags:['zna','vyj'], buff:{ heroThreatPct:0.5 } },
        { text:'→ Post a bounty on his head among the heroes themselves', tags:['kha','dom'], buff:{ eliteChance:3 } },
      ]},
    { id:'village_supply', trigger:'wave_end', minRound:5, weight:2,
      requires: { id:'village_revolt', choice:0 },
      badge:'📜 Village Report', title:'Debt Repaid',
      text:'The villagers sent seven volunteers — people who don\'t want to live under the city\'s rule. Not monsters, but willing to help: block roads, carry information, hide the wounded.',
      choices:[
        { text:'→ Accept. Allies come in all forms', tags:['vyj'], buff:{ heroThreatPct:-1, soulBonus:4 } },
        { text:'→ Take the intelligence only, no people in the dungeon', tags:['zna'], buff:{ heroThreatPct:-0.5 } },
        { text:'→ Refuse. People in the dungeon are a weak point', tags:['per'], buff:{} },
      ]},
    { id:'village_occupied', trigger:'wave_start', minRound:5, weight:2,
      requires: { id:'village_revolt', choice:2 },
      badge:'⚠️ Situation', title:'City Occupied the Village',
      text:'Hearing of the "intimidation," the city sent a garrison. Now these people are angry at both you and the city. Awkward for everyone.',
      choices:[
        { text:'→ Send them weapons. Let them fight the garrison', tags:['kha','dom'], buff:{ heroThreatPct:1, soulBonus:8 } },
        { text:'→ Pretend this wasn\'t our idea', tags:['kha'], buff:{} },
        { text:'→ Send monsters to drive out the garrison — openly', tags:['dom','pom'], buff:{ heroThreatPct:2, eliteChance:4 } },
      ]},
    { id:'spy_news', trigger:'wave_start', minRound:6, weight:2,
      requires: { id:'traitor', choice:1 },
      badge:'🔍 Spy Report', title:'Inside Intelligence',
      text:'Your spy sent an encrypted scroll. The city council is planning to bribe two of your captains. One seems to have already agreed.',
      choices:[
        { text:'→ Expose the traitor publicly — discipline over secrecy', tags:['dom','pom'], buff:{ soulBonus:5, heroThreatPct:0.5 } },
        { text:'→ Pretend not to know — and keep watching', tags:['zna','kha'], buff:{ heroThreatPct:-0.5 } },
        { text:'→ Set the traitor up through disinformation to the council', tags:['kha','per'], buff:{ captainChance:-5 } },
      ]},
    { id:'guild_war', trigger:'wave_start', minRound:7, weight:2,
      requires: { id:'guild_pact', choice:2 },
      badge:'⚠️ Consequences', title:'Guild Declared a Hunt',
      text:'The adventurers\' guild officially declared an open hunt on your lord. Every wave now includes two or three of their assassins. Reputation is brutal.',
      choices:[
        { text:'→ Pay compensation. Stop escalation before it\'s too late', tags:['vyj'], buff:{ soulBonus:-15 } },
        { text:'→ Counter with a hunt on their guildmaster', tags:['pom','dom'], buff:{ heroThreatPct:2, eliteChance:5 } },
        { text:'→ Hire a rival guild to cause them trouble', tags:['kha'], buff:{ heroThreatPct:0.5, soulBonus:5 } },
      ]},
    { id:'relic_awakens', trigger:'wave_end', minRound:7, weight:2,
      requires: { id:'dark_relic', choice:2 },
      badge:'🔮 Awakening', title:'The Relic Speaks',
      text:'At night — a voice. You don\'t know whose. The voice says it "wants more." Monsters are nervous. Even the golem.',
      choices:[
        { text:'→ Steel your will. You\'re the lord here, not a piece of stone', tags:['dom','per'], buff:{ lordDmg:5 } },
        { text:'→ Give it what it asks. For now', tags:['kha'], buff:{ lordDmg:10, heroThreatPct:1 } },
        { text:'→ Call the witch — let her handle it', tags:['zna','vyj'], buff:{} },
      ]},
    { id:'slime_petition', trigger:'wave_end', minRound:2, weight:2,
      badge:'💙 Petition', title:'Slimes Demand Respect',
      text:'A slime delegation appeared in the throne room. They brought a scroll — surprisingly neatly written, considering they have no hands. Key demands: more darkness, fewer torches, and officially stop calling them "those green blobs."',
      choices:[
        { text:'→ Grant it. They\'ve earned respect', tags:['vyj'], buff:{ soulBonus:3 } },
        { text:'→ Compromise: new names yes, torches stay', tags:['kha','zna'], buff:{} },
        { text:'→ Declare official title: "Elite Slime Warriors"', tags:['per'], buff:{ eliteChance:2 } },
      ]},
    { id:'bat_strike', trigger:'wave_start', minRound:3, weight:2,
      badge:'🦇 Labor Dispute', title:'Bat Strike',
      text:'The bats declared a strike. After rebuilding the third corridor their echolocation misfires and two flew into a wall. They want either reconstruction or compensation for "occupational injury." The delegate\'s nose is bandaged.',
      choices:[
        { text:'→ Agree to compensation. Give them... flies', tags:['vyj'], buff:{} },
        { text:'→ Rebuild the corridor. Healthy monsters are effective monsters', tags:['zna','per'], buff:{ heroThreatPct:-0.3 } },
        { text:'→ Remind them "strike" isn\'t in their contract', tags:['dom'], buff:{ soulBonus:2 } },
      ]},
    { id:'golem_poet', trigger:'wave_end', minRound:4, weight:2,
      badge:'🗿 Cultural Event', title:'Golem Wrote a Poem',
      text:'The golem brought a stone slab with chiseled text. An ode to the dungeon. One line about you: "Lord is great. Lord is dark. Lord sometimes doesn\'t explain why we do this. But we go anyway." The author didn\'t sign — but only one monster has a chisel.',
      choices:[
        { text:'→ Declare it the "Dungeon Poem." Officially', tags:['per'], buff:{ soulBonus:3 } },
        { text:'→ Order another slab carved — with the lord\'s reply', tags:['dom','per'], buff:{} },
        { text:'→ Say nothing. Quietly keep the slab', tags:['vyj'], buff:{ lordDmg:2 } },
      ]},
    { id:'skeleton_law', trigger:'wave_start', minRound:5, weight:2,
      badge:'💀 Legal Dispute', title:'Skeleton and Tax Status',
      text:'A skeleton came with a question after heroes yelled "You\'re already dead!". It wants legal clarity: if officially dead — must it pay castle tax? And who will be its heir, exactly.',
      choices:[
        { text:'→ Explain: "undead" is a separate legal category. With benefits', tags:['zna','kha'], buff:{} },
        { text:'→ Designate it "Living-For-Dungeon-Purposes." There\'s a seal', tags:['per','dom'], buff:{ soulBonus:4 } },
        { text:'→ Say questions like this mean it owes another round of service', tags:['dom'], buff:{ heroThreatPct:-0.2 } },
      ]},
    { id:'zombie_menu', trigger:'wave_end', minRound:3, weight:2,
      badge:'🧟 Complaint', title:'Zombies Dislike the Menu',
      text:'Zombies filed a complaint. Anonymously, but the handwriting is recognizable. The gist: we\'re only fed heroes that have "cooled down." We want fresh. Don\'t count spelling errors — not bad for undead.',
      choices:[
        { text:'→ Explain the logistics: "fresh" means still alive', tags:['zna'], buff:{} },
        { text:'→ Introduce a "premium menu" for those distinguished in battle', tags:['kha','per'], buff:{ eliteChance:2 } },
        { text:'→ Put them on the front line — let them solve the freshness problem themselves', tags:['dom'], buff:{ heroThreatPct:-0.5, soulBonus:3 } },
      ]},
    { id:'minotaur_mirror', trigger:'wave_end', minRound:6, weight:1,
      badge:'🐂 Personal Matter', title:'The Minotaur and the Mirror',
      text:'The minotaur found a silver mirror in the trophy room and hasn\'t moved in three days. Doesn\'t bother anyone. Just looks. Occasionally sighs. Monsters pass by and speak in whispers.',
      choices:[
        { text:'→ Remove the mirror. Sentimentality isn\'t for fighters', tags:['dom','per'], buff:{} },
        { text:'→ Leave it. Everyone needs something', tags:['vyj'], buff:{ soulBonus:3 } },
        { text:'→ Give it another mirror. Let it figure things out', tags:['kha'], buff:{ captainChance:3 } },
      ]},
    { id:'city_legend', trigger:'wave_end', minRound:4, weight:2,
      badge:'📜 City News', title:'New Name',
      text:'The city officially renamed your dungeon on its maps. Now it\'s "The Cursed Heart." Tourists are banned. Parents scare children with it. Bards write ballads. Ironic, but better than before.',
      choices:[
        { text:'→ Send your own map with the correct name', tags:['pom','per'], buff:{ eliteChance:2 } },
        { text:'→ Accept the name. Sounds respectable', tags:['kha','dom'], buff:{} },
        { text:'→ Find the bards and offer "technical corrections" to the songs', tags:['zna'], buff:{ soulBonus:4 } },
      ]},
    { id:'historian_visit', trigger:'wave_start', minRound:6, weight:1,
      badge:'📖 Unexpected Guest', title:'Traveling Chronicler',
      text:'An old man in a robe with a quill walked past the guards — they just froze. Says he\'s writing "A True Chronicle of Dark Places" and wants your version of events. Insistently. Very.',
      choices:[
        { text:'→ Give an interview. First chance at your own narrative', tags:['per','pom'], buff:{ eliteChance:3 } },
        { text:'→ Expel him. Uninvited scroll-carriers are always a risk', tags:['dom','per'], buff:{} },
        { text:'→ Keep him in the dungeon. Could be useful — or a hostage', tags:['kha','zna'], buff:{ heroThreatPct:-0.5 } },
      ]},
    { id:'ancient_dungeon', trigger:'wave_end', minRound:8, weight:1,
      badge:'🗝️ Discovery', title:'400 Years of Dungeon',
      text:'Monsters dug a new room and found walls with inscriptions. By the dates — the dungeon is over 400 years old. There are names of previous lords. The last entry cuts off mid-sentence.',
      choices:[
        { text:'→ Research carefully. The past always has something to teach', tags:['zna'], buff:{ lordDmg:4, heroThreatPct:-0.5 } },
        { text:'→ Seal it. Others\' legacy is unnecessary burden', tags:['per'], buff:{} },
        { text:'→ Use it for propaganda: "400 years undefeated"', tags:['kha','pom'], buff:{ eliteChance:3 } },
      ]},
    { id:'hero_memorial', trigger:'wave_start', minRound:5, weight:2,
      badge:'📜 City News', title:'Monument to the Fallen',
      text:'The city unveiled a monument to 50 known heroes who died here. Ceremonial speech. The crowd weeps. Your dungeon wasn\'t mentioned — only "hostile forces." But there are photographers.',
      choices:[
        { text:'→ Send an anonymous wreath. Ironic and restrained', tags:['kha'], buff:{ soulBonus:5 } },
        { text:'→ Prepare: after such ceremonies there\'s always a surge of hero motivation', tags:['vyj','per'], buff:{ heroThreatPct:0.5 } },
        { text:'→ Destroy the monument in a night raid. Symbolic and unambiguous', tags:['pom','dom'], buff:{ heroThreatPct:2, eliteChance:5 } },
      ]},
    { id:'legendary_hero', trigger:'wave_start', minRound:9, weight:1,
      badge:'⚔️ Threat', title:'A Hero with a Name',
      text:'Kindred the Sunlit arrived in the city — a paladin with a legend. Survived five dungeons. The city pays triple. He\'s already studying the map.',
      choices:[
        { text:'→ Completely rebuild the defense. Different threat level, different response', tags:['per','vyj'], buff:{ heroThreatPct:1, soulBonus:10 } },
        { text:'→ Spread disinformation about the dungeon', tags:['kha','zna'], buff:{ captainChance:-3 } },
        { text:'→ Wait. Legends also die from traps and arrows', tags:['dom','kha'], buff:{} },
      ]},
    { id:'dark_lord_message', trigger:'wave_end', minRound:10, weight:1,
      badge:'🏰 Dark Diplomacy', title:'Letter from a Neighbor',
      text:'A raven brought a letter with a black seal. You\'re being written to from another dungeon. Offers a "pact between dark ones." Intelligence exchange, possibly joint action. Signed: "Mort the Nameless." Suspiciously modest for a lord.',
      choices:[
        { text:'→ Accept the pact. More information means more survival', tags:['zna','kha'], buff:{ heroThreatPct:-1 } },
        { text:'→ Refuse. Allies in darkness are always future rivals', tags:['dom','per'], buff:{} },
        { text:'→ Accept and secretly report him to the city. Higher level of cunning', tags:['kha'], buff:{ soulBonus:12 } },
      ]},
    { id:'oracle_prophecy', trigger:'wave_end', minRound:7, weight:1,
      badge:'🔮 Omen', title:'The Oracle Spoke Five Words',
      text:'A blind oracle came uninvited. Stopped before you and said exactly five words: "Your end will come through acceptance." Then left. The guards ask what to do.',
      choices:[
        { text:'→ Ignore it. Prophecies are always ambiguous', tags:['kha','dom'], buff:{} },
        { text:'→ Reconsider recent decisions. What exactly was "accepted" that shouldn\'t have been', tags:['zna','vyj'], buff:{ heroThreatPct:-0.5 } },
        { text:'→ Punish the oracle. Bad news has no place in the dungeon', tags:['pom','dom'], buff:{ lordDmg:5, heroThreatPct:0.5 } },
      ]},
    { id:'mercenary_offer', trigger:'wave_start', minRound:4, weight:2,
      badge:'💰 Offer', title:'Mercenaries without Principles',
      text:'"Iron Teeth" unit offers their services. Price: 20 souls per wave. They\'re good, but not loyal. And they can be hired against you.',
      choices:[
        { text:'→ Hire them. Effectiveness over loyalty', tags:['kha','zna'], buff:{ soulBonus:-10, heroThreatPct:-1.5 } },
        { text:'→ Refuse. Our own army is more reliable', tags:['dom','per'], buff:{} },
        { text:'→ Hire them and frame them to the city — let it pay them instead', tags:['kha'], buff:{ eliteChance:-2, heroThreatPct:-0.5 } },
      ]},
];

// ── English psychotype descriptions ──────────────────────────────────────────
const _PSY_DESC_EN = {
dom_syla: {
    name: 'Autocrat',
    tag: 'You invested in yourself — because your own strength is the only currency that lasts.',
    body: 'You upgraded the lord — yourself. Every level was about self-sufficiency, not the dungeon as a whole. Your logic was clean: if I\'m strong enough, I need no system, no allies, no mechanism. In life you build on personal qualities, avoid dependencies, and consider autonomy the highest form of dignity. Rarely ask for help — even when you should.<br><br>The paradox: strength that doesn\'t delegate grows upward but not outward. You can carry more than most — and do — but pay in solitude at the top. The rare version of you that learns to open a door while holding your core becomes something genuinely formidable.',
},
dom_lehion: {
    name: 'Commander',
    tag: 'Power through those who serve — that\'s not weakness. That\'s understanding of scale.',
    body: 'You built an army — and felt it was right. Every monster found its place not because you decided, but because the system itself dictated where each was needed. In life you think in terms of structures: who\'s responsible for what, where\'s the efficiency, where\'s the least chaos. You see the legion where others see a crowd.<br><br>But an army that answers to you isn\'t always one that believes in you. The powerful commander without loyalty is a manager, not a leader. Loyalty is built not through hierarchy, but in the moment when people see you\'re also vulnerable — and don\'t hide it. The person who can combine command strength with human honesty builds something that outlasts any battle.',
},
dom_fortress: {
    name: 'Architect',
    tag: 'You don\'t defend — you dictate the rules through the mere existence of your walls.',
    body: 'You built order — floor by floor, layer by layer. Heroes entered your system and the system ground them down — not your personal strength, but your structure. In life you establish rules, rituals, and frameworks and hold others within them. You call this civilization. And there\'s great truth in it: without structure, chaos wins.<br><br>But the walls you build protect against the outside while also defining where people can and cannot be. Your need for order sometimes doesn\'t let people closer than you planned. Order doesn\'t only protect from enemies — sometimes it also protects from those who could be let in. The person who can build something solid and still leave windows in it is already an architect in the deepest sense.',
},
dom_trap: {
    name: 'Schemer',
    tag: 'Power is purest when others walk into your snares by their own choice.',
    body: 'You didn\'t storm — you waited and prepared. Let enemies choose their own destruction. In life you read the room ahead: knowing what someone will say before they say it, seeing where a conversation leads three steps ahead. A rare and somewhat unsettling gift — and you\'ve long grown used to not being fully understood.<br><br>There\'s a particular loneliness in those who see all the patterns ahead. People sense you\'re reading them — and start performing a role instead of being themselves. The trap becomes two-sided. The person who can set down the scanner and simply be present discovers something no tactic can give: genuine contact.',
},
dom_skarb: {
    name: 'Pretender',
    tag: 'You wanted power — but never quite decided which kind.',
    body: 'You gathered resources, built up potential — and waited. For the right moment, the right step, the right confidence. Your ambitions are large, but action comes harder than preparation. Not from fear: you see the cost of mistakes more clearly than most, which makes the entry threshold steep. Your lord could have become the strongest — if you\'d finally decided what "strong enough" means.<br><br>In life, those like you have a particular struggle: they see their future more clearly than others, and that\'s precisely why they stand motionless before it. Power held in reserve becomes weight, not a weapon. But what you haven\'t yet begun means it\'s still ahead. Your moment hasn\'t passed. You simply haven\'t decided it\'s arrived — and that can still be fixed.',
},
dom_rivnovaha: {
    name: 'Regent',
    tag: 'A lord who holds balance — that\'s either wisdom or indecision. You decide.',
    body: 'You didn\'t bet on one thing — you spread across lord, army, and structure, keeping everything in equilibrium. In life you\'re flexible, adaptive, not bound to one approach. You\'re not a fanatic of any system, and this saves you where ideological players break against reality.<br><br>But there\'s a question that can stop you at three in the morning: is this truly balance — or did you simply not choose? Real power requires a decision, and decisions require giving up alternatives — and that\'s painful. The person who genuinely learns to balance — rather than merely delay the choice — becomes steady in any storm. That\'s already rare maturity.',
},

pom_syla: {
    name: 'Avenger',
    tag: 'You fight like someone who still has something to prove.',
    body: 'You upgraded your lord carefully and methodically, knowing what strength you\'d need when the time came — to strike hard enough that it would be remembered. Not for beauty. Not for glory. For the score. In life you have scores — not necessarily with people, sometimes with circumstances or with who you once couldn\'t become. Revenge as motivation gives colossal energy — burning, persistent, nearly inexhaustible.<br><br>The problem with scores: they\'re never finally closed. Close one — another opens. The lord in the strongest dungeon still finds a new reason for dissatisfaction. There\'s a moment worth asking: who are you really fighting? And when you find something beyond the score — you become genuinely dangerous, because now you fight for something, not against.',
},
pom_lehion: {
    name: 'Warlord',
    tag: 'Your army is anger organized into form.',
    body: 'You didn\'t take revenge personally — you built a system. Each monster carried a piece of your unexpressed, but organized, in formation, with its role. In life you channel anger into structure: complaints, arguments, coalitions, pressure. Anger becomes architecture — more effective than any outburst, and you\'ve known this for a long time.<br><br>But systematized grievance takes up more space than ordinary anger — because it\'s well-organized and goes nowhere on its own. You have an internal archive: dates, words, situations, carefully maintained even when you\'re not consciously opening it. The strongest version of you is the one who learns to close the archive and start fresh, keeping everything the old page taught.',
},
pom_fortress: {
    name: 'Endurer',
    tag: 'The best revenge — outliving.',
    body: 'You built walls not to attack, but so that enemies would break themselves against you. In life: when hurt, you don\'t scream — you harden. Silently. Wait. This form of revenge is the most patient and most exhausting for those trying to break you. Your resilience is real, not performed.<br><br>But a wall built against an enemy sometimes stays even after the enemy has long gone. You maintain defense reflexively, and don\'t always notice there\'s no longer anyone to defend against — the wall stands simply because it\'s used to standing. "Surviving" and "winning" are different things. You stopped at the first, and that\'s already much — but beyond the walls, something is waiting. The person who survived what would have broken others knows something deep that no book can teach.',
},
pom_trap: {
    name: 'Web-Weaver',
    tag: 'The sweetest revenge is the kind they don\'t notice until it\'s too late.',
    body: 'You didn\'t storm and didn\'t shout. You set traps and waited for them to step in — refined, almost artistic. In life you rarely confront directly, but know how to build a situation so that people arrive at the consequences of their own actions. Not you who led them — they came. Cold head and patience are a rare kind of intelligence.<br><br>Subtle revenge requires maintaining a grievance in working order long-term — technically complex. The person who remembers every nuance years later, plans, waits for the moment — is very alive inside. Sometimes worth asking: how much of your best resources are you spending on people who honestly aren\'t worth such attention? Your sharpness aimed elsewhere could build something that outlasts any revenge.',
},
pom_skarb: {
    name: 'Brooder',
    tag: 'Unexpressed grievance grows inward.',
    body: 'You saved and didn\'t spend. Perhaps waiting for the moment. Perhaps not yet decided how to make it precise and final. In life you have unfinished accounts — and you remember them with accuracy down to the date, word, and tone. The fact that you haven\'t acted means you know how to wait.<br><br>But accumulated grievance waiting — the heaviest form — gives neither the relief of action nor the relief of forgiveness. You\'re suspended between two exits, both requiring effort you\'re not yet ready for. The person who finally closes the open tabs frees space for something new, and that space is worth more than it seems right now.',
},
pom_rivnovaha: {
    name: 'Suppressor',
    tag: 'Anger spread across everything is no longer anger — it\'s background noise.',
    body: 'You distributed resources evenly, not letting any direction — including anger — take everything. In life you have sharp feelings, but don\'t let them govern decisions. You hold balance where others break. This is noticed — the person who doesn\'t explode in hard moments, who keeps their voice even and their thinking clear, is rare.<br><br>But sometimes this is genuine control, and sometimes you simply don\'t let yourself feel to the end. Anger that can\'t break out takes strange forms. You hold yourself where most collapse — a rare and valuable quality worth knowing and protecting.',
},

zna_syla: {
    name: 'Strategist',
    tag: 'You don\'t learn for understanding — you learn for advantage.',
    body: 'You upgraded the lord through understanding: what each upgrade gives, where the synergies are, where the efficiency lies. Not intuition — analysis, precise and methodical. In life: before action, research; before decision, preparation. You enter any situation more prepared than most, and this is a real advantage that can\'t be improvised.<br><br>But knowledge gives understanding, not always authority. You may know exactly that someone will make a mistake — and still have no right to stop it. Preparation that stretches becomes self-sufficient. But those who combine analysis with respect for others\' experience and know when to step — become genuine authority, not just people who are always right.',
},
zna_lehion: {
    name: 'Systematist',
    tag: 'You understood your monsters better than they understood themselves.',
    body: 'You invested in the legion with knowledge: this type is strong here, this one holds the line, this one creates synergy. Not mass — a system built on understanding each element\'s nature. In life you see people structurally: who for what, where is the friction, where is unused potential.<br><br>But systematic understanding of people can invisibly turn them into functions in your head. The person you analyze also analyzes you. If they sense they\'re being broken into components — they close off, begin playing a role. The strongest teams form where the leader can switch between the structural and the human view — and is sometimes simply a present person, without analysis.',
},
zna_fortress: {
    name: 'Planner',
    tag: 'The dungeon architecture was finished in your head before the first brick.',
    body: 'Every floor was a pre-considered decision. You thought about enemy flows, optimal positions, risk minimization — all as a clear plan before the first block was placed. In life you live in structures thought through in advance: schedule, plan, backup plan, backup to the backup.<br><br>But the ideally planned system has a hidden cost: it can start protecting you from new data, not just danger. The best plans sometimes lose to those who improvise — not because the plan was bad, but because reality is unpredictable. Architecture that anticipated everything and still left room for the living — that\'s your next level.',
},
zna_trap: {
    name: 'Seer',
    tag: 'You didn\'t set traps — you formulated theorems.',
    body: 'Each trap was a calculation. Where heroes walk, where they pause, where they expect danger and where they don\'t. You used information advantage over others\' behavior as the primary tool. In life you see patterns where others see chaos: you predict decisions, read situations, see the end from the beginning.<br><br>But models always simplify. Someone who reads patterns too well starts seeing them where there are none — and reacts to their own projection, not reality. There\'s also a particular loneliness in those who see everything ahead: surprise is the beginning of the best things, and you rarely experience it. Allowing yourself not to know — not weakness, but a skill worth developing.',
},
zna_skarb: {
    name: 'Scholar',
    tag: 'The most dangerous form of knowledge — the kind that justifies inaction.',
    body: 'You gathered, analyzed, waited. For the right moment, sufficient data, the full picture. In life you have theories about almost everything — careful, justified, well-built. Rarely enough certainty to act, because you see nuances and risks others simply don\'t notice.<br><br>But there\'s an intellectual perfectionism here — a state where you don\'t act because you don\'t yet know enough. It masquerades as prudence, but inside — anxiety dressed as methodology. Uncertainty doesn\'t decrease with more data — it decreases with practice of acting in uncertainty. When you finally step — you act with quality that\'s rare in those who always rushed.',
},
zna_rivnovaha: {
    name: 'Polymath',
    tag: 'Someone who knows a little about everything is either a genius or still looking for their thing.',
    body: 'You distributed knowledge evenly — no fanaticism, no bets on one thing, broad and curious. In life you find connections between things that seem incompatible. You see how one field explains another, where crossovers give new answers. This you find naturally, without effort, and in the right moment it\'s invaluable.<br><br>But wide view has its cost: depth requires giving up other possibilities. You sometimes stop exactly before the point where true mastery begins. Breadth without depth is erudition, not wisdom — and you\'re somewhere on the border. But those who see the full picture are invaluable where narrow specialists see only their part. And: which topic is already calling you deeper than all the others?',
},

vyj_syla: {
    name: 'Stoic',
    tag: 'You upgraded yourself not for glory — to make sure you wouldn\'t lose.',
    body: 'You invested in the lord methodically: not because it\'s beautiful, but because it\'s reliable. If the lord is strong — there\'s a chance. In life you don\'t risk more than necessary, choose proven solutions, build reserves for when things go wrong. That you\'re still here already means you\'re doing something very right.<br><br>But there\'s a difference between "not losing" and "winning" — and it matters. "Not losing" as a goal is always achievable if you\'re careful enough. But sufficient caution rarely looks like play. There are things you can only get by betting — and you know them, because you specifically don\'t bet on them. The moment you finally dare — you do it with quality those who never paused and thought couldn\'t match.',
},
vyj_lehion: {
    name: 'Pragmatist',
    tag: 'The most pragmatic army — the one that simply works.',
    body: 'You didn\'t look for elegant solutions — monsters exist, they need to hold the line, they did. You invested where the effect was tangible, where each unit justified its place. In life: team, tools, processes — all evaluated by one criterion, and it\'s honest. Functional systems don\'t need justification.<br><br>But loyalty isn\'t measured by productivity, and the most important relationships are often worst-measured. People who prioritize function over relationship sometimes miss when someone nearby is signaling something completely different. From you they get results and respect you — but rarely share their real selves. Only you can open that door.',
},
vyj_fortress: {
    name: 'Guardian',
    tag: 'Walls — the most honest form of survival.',
    body: 'You built defense not from fear, but from understanding that without a reliable rear, everything else is meaningless. Stability first, then everything else. People around you live in stability you provide, often not noticing because it simply exists.<br><br>But when you always hold the fortress, people start expecting you always to hold it. Asking for help becomes hard, because the "holder" status doesn\'t allow vulnerability. And you sometimes need a reliable rear too — which is hard to admit precisely because you are one for others. The person who didn\'t fall when everyone around them was wavering — someone who can genuinely be trusted.',
},
vyj_trap: {
    name: 'Engineer',
    tag: 'The most effective trap — the one that works while you sleep.',
    body: 'You invested pragmatically: maximum damage with minimum attention. In life you love systems that work without constant involvement — automation, protocols, processes that run independently. Your ability to build what works by itself is a gift most don\'t even understand, seeing only the result and not the architecture behind it.<br><br>But when everything is automated — who makes decisions when the system meets something unexpected? Delegating sometimes masks a desire not to be personally responsible. The person who builds systems that outlast their personal involvement — that\'s genuine scale. Remaining connected to the living result alongside it — that\'s art.',
},
vyj_skarb: {
    name: 'Hoarder',
    tag: 'The safest place — the one where you haven\'t spent anything yet.',
    body: 'You gathered and held — reserve is safety, safety is survival. In life you don\'t rush to spend: time, money, emotions, chances. Wait until it\'s definitely worth it. This caution isn\'t greed or fear — it\'s understanding that resources are finite. In the right moment, your reserve saves everything.<br><br>But "definitely worth it" sometimes never arrives — and you\'re left with full pockets and an empty game. Windows close, and the reserve afterward no longer has the same application. When you finally decide to act — you do it with resources most have long since spent.',
},
vyj_rivnovaha: {
    name: 'Hedger',
    tag: 'You didn\'t take positions — you hedged every one.',
    body: 'Even distribution, no concentration risk, maximum stability under any scenario. In life you always keep several options open, never put everything in one place. This is intellectually honest in the face of uncertainty — and such honesty is rare. You survive any scenario.<br><br>But there\'s a distinction between "I keep options open because they genuinely are" and "I keep them open because closing is frightening" — and they look identical from outside. Some of the most important things require an uncovered bet. Hedging everything can be indecision that looks like wisdom. But the person who survives the worst scenarios has already won something more important than most victories.',
},

kha_syla: {
    name: 'Impulse',
    tag: 'You didn\'t upgrade by plan — by feeling.',
    body: 'You pressed what felt right in the moment. No guides, no optimization — just intuition. In life you act. While others analyze, you\'re already in the fight, already have a first result. This gives lived experience no preparation can replace.<br><br>But there\'s a difference between genuine intuition and reactivity. Intuition that accumulated experience reads patterns faster than conscious thought. But this skill doesn\'t always distinguish "right feeling" from "habitual feeling" — sometimes you repeat what\'s habitual instead of right. The person who acts always has more data for the next decision than the one who waited. And a second to ask "why do I feel exactly this?" won\'t slow you — it will make you more precise.',
},
kha_lehion: {
    name: 'Tempest',
    tag: 'Your army is a storm that contains you.',
    body: 'You threw monsters into battle without clear hierarchy or plan — and somehow it held. Sometimes better than those who counted every cell. In life you gather people not by authority, but by energy. Your team doesn\'t always know the plan, but always senses there\'s somewhere to move, that with you it\'s interesting.<br><br>But an army sustained by the leader\'s energy is very alive and very dependent on him. After the peak comes an emptiness you don\'t always know how to fill. The question isn\'t how to suppress this force, but how to give it a foundation that holds even in quiet times.',
},
kha_fortress: {
    name: 'Improviser',
    tag: 'Your fortress was built the same way as everything else — in the process.',
    body: 'Floors grew not by plan but by need — added here, reinforced there, placed something because that\'s how it came out. Strangely, it holds. In life you also build organically: career, home, relationships — without an architectural plan, by feeling. A living space is always more alive than a perfectly built dead one.<br><br>But organic structure requires more maintenance than planned — it\'s held by feeling, not principle. When the feeling changes, the structure wavers with it. There are cracks where planning wouldn\'t have allowed. But a living dungeon is always more interesting than a dead one, even held together strangely — and that\'s a real advantage hard to fake.',
},
kha_trap: {
    name: 'Wildcard',
    tag: 'Your traps had no system — and that\'s exactly why they caught.',
    body: 'You placed where it seemed and when you wanted. Paradoxically, an unpredictable opponent is the most dangerous. No system can fully defend against what it cannot predict. In life you\'re hard to calculate, hard to read — and this is a protection no one can teach deliberately.<br><br>But there\'s a fine difference between "I\'m unpredictable" and "I\'m playing the role of unpredictable." Spontaneity that became strategy is no longer genuine — it\'s performance. The real you is where there\'s no audience, no reason to perform. Sometimes the silence with no one watching is what frightens — and that silence holds the most accurate version of you.',
},
kha_skarb: {
    name: 'Volcano',
    tag: 'Even chaos sometimes stops and doesn\'t know what to do next.',
    body: 'You gathered — maybe planned something grand, maybe just didn\'t get around to spending, maybe the moment wasn\'t right. In life you know this state: heap of ideas, energy exists, but something doesn\'t fire and everything stagnates. You generate more than you realize.<br><br>The chaotic person who stopped — this isn\'t rest, it\'s a pause that can last longer than planned. Any action specifies and limits, and you\'re not yet ready to be limited. But everyone who finally begins feels exactly what you feel right now — and it passes immediately after the first step. A volcano that hasn\'t erupted — and when it does, it will be noticed.',
},
kha_rivnovaha: {
    name: 'Jazzist',
    tag: 'Chaos that holds balance — that\'s not chaos anymore. That\'s jazz.',
    body: 'You distributed resources evenly but without a system — it just came out that way. And it worked. In life you\'re unpredictable even to yourself, but somehow always end up in balance — not through planning, but through a sense of equilibrium that\'s in you and you can\'t explain.<br><br>Jazz looks like chaos — but it has tonality, a moment, a sense of where to move, all without a score. People around you sometimes need certainty you can\'t offer in words, because you yourself don\'t know how it works — only that it does. But the person who found their voice in chaos, who plays and doesn\'t break the instrument — lives more fully than those who never deviated from the score.',
},

per_syla: {
    name: 'Sculptor',
    tag: 'You perfected yourself as a project — there\'s always a next version.',
    body: 'You upgraded the lord not from fear and not from greed, but because you saw what it could become. Like a sculptor who sees the statue in stone before beginning. In life you treat yourself as an unfinished project: there\'s a better version than the current one, and you know which direction to move.<br><br>The project approach to oneself is very productive, but carries a hidden trap: a person always "in process" is never "enough." The next version is always better — and the current one always looks incomplete. You rarely stop to feel you\'ve already achieved something. Growth that never completes is sometimes escape from the present, not movement toward the future. But the current version of you is already worth far more than you give yourself credit for.',
},
per_lehion: {
    name: 'Synergist',
    tag: 'You didn\'t build an army — you built an ecosystem.',
    body: 'Each monster occupied a place not just as a combat unit, but as a system element — synergy, interaction, structure of the living. In life you think systemically: how these people interact, where the friction is, where one plus one becomes three.<br><br>But systematic thinking in relationships has its shadow. The person you analyze also analyzes you. If they sense they\'re being broken into components — they close off, begin playing a role. The most alive teams have both systemic vision and the ability to be unpredictable, simply a present person who sometimes steps beyond their own system. The architect who can also be an element — builds something truly alive.',
},
per_fortress: {
    name: 'Conditioner',
    tag: 'You didn\'t build walls — you built conditions.',
    body: 'Your floors weren\'t just defense — they were an environment: where the enemy slows, where monsters have advantage, where every meter leads to a specific result. In life you know how to shape an environment: arranging conditions so the needed result arises naturally, without obvious force.<br><br>But there\'s a difference between "I created conditions where people flourish" and "I created conditions where people do what I need" — these differ in intent but look very similar from outside, sometimes from inside. The master of environment with clean intent is one of the rarest and most needed people — and when the intent is clean, it\'s visible and felt.',
},
per_trap: {
    name: 'Director',
    tag: 'Your traps — questions with a known answer.',
    body: 'You set traps like an architect places doors — knowing where people will go before they\'ve decided. In life you frame situations so others "themselves" arrive at the needed conclusion. In hands with good intent — this is art that helps others find their own answers.<br><br>But there\'s a cost for those who always design: they\'re rarely vulnerable and unprepared. And vulnerability is the only path to genuine closeness where no one designs anything and both simply are. When you allow yourself to step out of the director\'s role — you become the most interesting version of yourself.',
},
per_skarb: {
    name: 'Visionary',
    tag: 'You saw the big picture — and didn\'t want to waste the details on small things.',
    body: 'You gathered, held resources — because you understood a grand design requires grand resources. In life you have a vision — large and real. You wait until conditions are right so it comes out as you see it. Those who see a picture where others see blank canvas have already done half the work.<br><br>But a grand picture that never begins remains a sketch even if it\'s flawless in your head. Perfectionism masquerading as strategic waiting — one of the most cunning self-protection mechanisms. The person who sees the grand design bears responsibility for it beginning, even if the first version is imperfect, even if conditions aren\'t right. Those who finally begin always find they were more ready than they thought.',
},
per_rivnovaha: {
    name: 'Conductor',
    tag: 'You didn\'t balance — you held all threads simultaneously.',
    body: 'Even distribution in your case isn\'t absence of priorities, but a conscious choice to keep all possibilities open, see the full system, be ready to respond at any level. In life you don\'t close on one path, seeing how they intersect and where something new emerges between them.<br><br>Holding all threads — the position of maximum information and maximum load simultaneously. You carry more than most — invisible load, because it looks like calm competence. You rarely allow yourself not to understand what\'s happening — and this costs great effort nobody counts. But the person who sees the whole system when others are lost is invaluable precisely then, and no specialization replaces it.',
},
};

// ── Getters for language-sensitive arrays ─────────────────────────────────────
function _getDecisionEvents() {
    return (_lang === 'en') ? _DECISION_EVENTS_EN : _DECISION_EVENTS;
}

function _getPsyDesc() {
    return (_lang === 'en') ? _PSY_DESC_EN : _PSY_DESC;
}
