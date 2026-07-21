// models/i18n.js — Dungeon Lord localization (UK / EN)
'use strict';

let _lang = (function() {
    try {
        const saved = localStorage.getItem('DL_lang');
        if (saved) return saved;
        const nav = (navigator.language || 'en').toLowerCase();
        return nav.indexOf('uk') === 0 ? 'uk' : 'en';
    } catch(e) { return 'en'; }
})();

// ── UI string tables ──────────────────────────────────────────────────────────
const _I18N = {
uk: {
  // Start screen
  'lvl-label':      'Рівень',
  'start-lore':     'П\'ятсот років тому герой Варан запечатав Безодню ціною власної пам\'яті. Ти — що від нього залишилось.',
  'btn-start':      '▶ Почати гру',
  'btn-level':      '▶ Рівень {n}',
  'btn-hell':       '🔥 Режим Пекла',
  'btn-instr':      'Інструкція',
  'btn-reset':      '↺ Скинути все',
  // Soul dungeon
  'sd-title':       'Душа Підземелля',
  'sd-hint':        'Витрачай Елітні Душі на назавжди-покращення.<br>Ефект застосовується з наступного рівня.',
  'btn-back':       '← Назад',
  // Instructions
  'instr-title':    'Інструкція',
  'instr-goal-h':   '🎯 Мета',
  'instr-goal':     'Захисти підземелля від героїв. Знищ місто ворогів (зменши ❤️ до 0), перш ніж герої вб\'ють твого Лорда 💜.',
  'instr-souls-h':  '💀 Душі',
  'instr-souls':    'Вбивай героїв — отримуй Душі <span class="soul-gem"></span>. Купуй нові поверхи, пастки, покращуй монстрів через Розвиток.',
  'instr-elite-h':  'Елітні Душі',
  'instr-elite':    'З елітних героїв випадає 2 <span class="esoul-gem"></span>, з босів — 6 <span class="esoul-gem"></span>. Вони зберігаються між рівнями. Витрачай у Душі Підземелля, на золоті гілки Розвитку і на Збирач душ.',
  'instr-floor-h':  '🏗️ Поверхи',
  'instr-floor':    'Будуй нові поверхи кнопкою «Новий поверх». Кожен поверх може мати монстрів і пастки.',
  'instr-mon-h':    '⚔️ Монстри',
  'instr-mon':      'Монстри виникають на поверхах автоматично. Покращуй їхню атаку, ХП і кількість у меню Розвитку.',
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
  'pause-restart':  '<span class="dl-ico dl-regen"></span> Рестарт',
  'pause-api':      '🤖 Claude API-ключ',
  // Game over
  'go-defeat':      'ПОРАЗКА',
  'go-dead':        'Володаря вбито...',
  'go-win-all':     '🏆 ГРУ ПРОЙДЕНО!',
  'go-win-lvl':     'Рівень {n} пройдено!',
  'go-all50':       'Всі 50 рівнів пройдено! 🎉',
  'andrii-end-0':   'Андрій пішов. Мабуть, так і краще.',
  'andrii-end-1':   'Андрій поніс твою розповідь у місто. Щось там змінилось.',
  'andrii-end-2':   'Ти дізнався більше, ніж сказав. Андрій теж.',
  'andrii-end-3':   'Навіть Андрію ти не сказав нічого. Тиша — теж відповідь.',
  'go-next':        'Далі: Рівень {n} / 50',
  'go-elite':       '+{n} <span class="esoul-gem"></span> золотих зароблено (всього: {t})',
  'go-souls':       '+{n} <span class="soul-gem"></span> душ зібрано за рівень',
  'go-retry':       '<span class="dl-ico dl-regen"></span> Спробувати знову',
  'go-retry-all':   '<span class="dl-ico dl-regen"></span> Грати заново',
  'go-next-btn':    '→ Рівень {n}',
  'btn-share':      '<span class="dl-ico dl-share"></span> Поділитись результатом',
  'btn-invite':     '🎁 Запросити друга',
  'invite-text':    '👑 Стань володарем власного підземелля в Dungeon Lord — я дарую тобі {n} золотих душ на старт!',
  'invite-welcome': '🎁 Друг подарував тобі {n} золотих душ на старт!',
  // Branch choice
  'branch-subtitle': 'Обери шлях розвитку — рішення невідворотне',
  'branch-warn':    'Після вибору інша гілка стане недоступною для цього монстра',
  // Monster dev
  'mon-dev-label':  'Розвиток: ',
  'mon-dev-tab-souls':  'Душі',
  'mon-dev-tab-golden': 'Золоті',
  'btn-gold-label':     'Вічне',
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
  'btn-floor':      'Новий поверх',
  'btn-floor-perma':'Вічний поверх',
  'btn-wave':       'АТАКА',
  'btn-wave-cd':    '⚔️ АТАКА ({n}с)',
  'btn-wave-ready': '⚔️ АТАКА',
  'btn-pause':      'Пауза',
  // Trap install hint
  'trap-hint-line1':'Натисни на поверх',
  'trap-hint-line2':'для встановлення пастки',
  // Help modal
  'help-title':     'Dungeon Lord: Siege Defense',
  'help-sub':       'Ти — Повелитель Підземелля. Не дай героям дістатись до міста!',
  'help-souls':     '<b>Душі</b> — твоя валюта. Збираєш їх убиваючи героїв, витрачаєш на розвиток.',
  'help-elite':     '<b>Золоті Душі</b> — падають з еліт і босів, зберігаються між рівнями. Назавжди-покращення в «Душі Підземелля».',
  'help-atk':       '<b>АТАКА</b> — запускає наступну групу героїв. <span class="hd">Монстри йдуть на місто; кожні 10 HP міста дають душу.</span>',
  'help-floor':     '<b>Поверх</b> — будує новий підземний поверх. <span class="hd">На поверхах стоять монстри і можна ставити пастки — чим глибше герой йде, тим важче йому вижити.</span>',
  'help-trap':      '<b>Пастки</b> — купи пастку, потім <span class="hd">натисни на поверх</span> щоб встановити. Шипи — шкода, Дротик — обстріл, Телепорт — повертає назад, Виклик — призиває монстра.',
  'help-lord-row':  '<b>Володар</b> — це ти: сидить на троні найглибшого поверху і б\'ється сам, якщо герої дійдуть. Загине він — кінець. Прокачуй атаку і HP.',
  'help-monsters':  '<b>Монстри</b> — покращуй атаку і витривалість усіх монстрів підземелля одночасно.',
  'help-camera':    '<span class="hd">Потягни камеру вгору/вниз</span> щоб побачити глибші поверхи.',
  'help-ok':        'Зрозуміло! Починаємо!',
  // Daily panel
  'daily-title':    '📋 Завдання дня',
  'dq-kills':       '○ Знищ 5 героїв +5 <span class="esoul-gem"></span>',
  'dq-kills-done':  '✓ Знищ 5 героїв +5 <span class="esoul-gem"></span>',
  'dq-wave':        '○ Запусти хвилю +5 <span class="esoul-gem"></span>',
  'dq-wave-done':   '✓ Запусти хвилю +5 <span class="esoul-gem"></span>',
  'dq-upgrade':     '○ Апгрейдни +5 <span class="esoul-gem"></span>',
  'dq-upgrade-done':'✓ Апгрейдни +5 <span class="esoul-gem"></span>',
  // Toast
  'toast-copied':   '📋 Скопійовано!',
  'toast-streak':   '🔥 Серія {n} дні! +{b} 💀',
  'toast-quest':    '✅ Завдання виконано! +5 💀',
  // Tutorial
  'tut-label':      'Підказка {n} / {t}',
  'tut-skip':       'Пропустити',
  'tut-next':       'Далі →',
  'tut-got':        'Зрозуміло',
  'tut-done':       '✅ Готово!',
  'wave-label':     'Хвиля',
  'tut-step1':      '⚔️ Натисни <b>АТАКА</b> — відправ першу хвилю ворогів у підземелля!',
  'tut-step2':      '💀 За кожного вбитого героя отримуєш <b>Душі</b>. Трать їх між хвилями на монстрів, поверхи і пастки.',
  'tut-step3':      '🪤 <b>Пастки</b> добивають тих хто прорвався. Шипи — шкода, Телепорт — відкидає назад, Виклик — спавн монстра. Натисни поверх після покупки.',
  'tut-step4':      '👑 <b>Лорд</b> б\'ється особисто на поверхні. Натисни на нього щоб відкрити апгрейди. Вдалого полювання!',
  // Share
  'share-text':     '👑 Я — {arch} у Dungeon Lord!\nОбороняв {r} хвиль, знищив {k} ворогів.\nА яким лордом підземелля будеш ти? 👇',
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
  'mod-blood':      'Жага крові',     'mod-blood-d':   '+1 душа за кожного вбитого ворога',
  'mod-elite':      'Елітна вилазка', 'mod-elite-d':   'Елітні душі ×2 цей ран',
  'mod-fury':       'Лють Лорда',     'mod-fury-d':    '+25% до атаки Лорда',
  'mod-iron':       'Залізні Стіни',  'mod-iron-d':    'Монстри отримують бонус HP залежно від рівня',
  'mod-pact':       'Темний Пакт',    'mod-pact-d':    '+5 <span class="esoul-gem"></span> зараз, але герої на +15% сильніші',
  'mod-well':       'Криниця Душ',    'mod-well-d':    '+80 звичайних душ на старті',
  'mod-aura':       'Аура Воєнлорда', 'mod-aura-d':    'Всі монстри отримують +4 до атаки',
  'mod-regen':      'Незламний',      'mod-regen-d':   '+150 HP Лорда і +1 регенерація HP/сек',
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
  'start-lore':     'Five hundred years ago the hero Varan sealed the Abyss at the cost of his own memory. You are what remains of him.',
  'btn-start':      '▶ Start Game',
  'btn-level':      '▶ Level {n}',
  'btn-hell':       '🔥 Hell Mode',
  'btn-instr':      'How to Play',
  'btn-reset':      '↺ Reset All',
  // Soul dungeon
  'sd-title':       'Soul of the Dungeon',
  'sd-hint':        'Spend Elite Souls on permanent upgrades.<br>Takes effect from the next level.',
  'btn-back':       '← Back',
  // Instructions
  'instr-title':    'How to Play',
  'instr-goal-h':   '🎯 Goal',
  'instr-goal':     'Defend your dungeon from heroes. Destroy the enemy city (reduce ❤️ to 0) before heroes kill your Lord 💜.',
  'instr-souls-h':  '💀 Souls',
  'instr-souls':    'Kill heroes — earn Souls <span class="soul-gem"></span>. Buy floors and traps, upgrade monsters via Development.',
  'instr-elite-h':  'Elite Souls',
  'instr-elite':    'Elite heroes drop 2 <span class="esoul-gem"></span>, bosses drop 6 <span class="esoul-gem"></span>. They persist between levels. Spend them in Soul of the Dungeon, golden Development branches, and the Soul Collector.',
  'instr-floor-h':  '🏗️ Floors',
  'instr-floor':    'Build new floors with the "Build Floor" button. Each floor can have monsters and traps.',
  'instr-mon-h':    '⚔️ Monsters',
  'instr-mon':      'Monsters spawn automatically on each floor. Upgrade their attack, HP and count in the Development menu.',
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
  'pause-restart':  '<span class="dl-ico dl-regen"></span> Restart',
  'pause-api':      '🤖 Claude API Key',
  // Game over
  'go-defeat':      'DEFEAT',
  'go-dead':        'Your Lord has fallen...',
  'go-win-all':     '🏆 GAME COMPLETE!',
  'go-win-lvl':     'Level {n} cleared!',
  'go-all50':       'All 50 levels conquered! 🎉',
  'andrii-end-0':   'Andrii left. Perhaps that was for the best.',
  'andrii-end-1':   'Andrii carried your story back to the city. Something changed there.',
  'andrii-end-2':   'You learned more than you told him. So did he.',
  'andrii-end-3':   'Even to Andrii, you said nothing. Silence is also an answer.',
  'go-next':        'Next: Level {n} / 50',
  'go-elite':       '+{n} <span class="esoul-gem"></span> gold earned (total: {t})',
  'go-souls':       '+{n} <span class="soul-gem"></span> souls collected this level',
  'go-retry':       '<span class="dl-ico dl-regen"></span> Try Again',
  'go-retry-all':   '<span class="dl-ico dl-regen"></span> Play Again',
  'go-next-btn':    '→ Level {n}',
  'btn-share':      '<span class="dl-ico dl-share"></span> Share Result',
  'btn-invite':     '🎁 Invite a friend',
  'invite-text':    '👑 Come rule your own dungeon in Dungeon Lord — I\'m gifting you {n} golden souls to start!',
  'invite-welcome': '🎁 A friend gifted you {n} golden souls to start!',
  // Branch choice
  'branch-subtitle': 'Choose an evolution path — this decision is final',
  'branch-warn':    'After choosing, the other branch will be locked for this monster',
  // Monster dev
  'mon-dev-label':  'Develop: ',
  'mon-dev-tab-souls':  'Souls',
  'mon-dev-tab-golden': 'Golden',
  'btn-gold-label':     'Perma',
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
  'btn-floor-perma':'Eternal Floor',
  'btn-wave':       'ATTACK',
  'btn-wave-cd':    '⚔️ ATTACK ({n}s)',
  'btn-wave-ready': '⚔️ ATTACK',
  'btn-pause':      'Pause',
  // Trap install hint
  'trap-hint-line1':'Tap a floor',
  'trap-hint-line2':'to place the trap',
  // Help modal
  'help-title':     'Dungeon Lord: Siege Defense',
  'help-sub':       'You are the Dungeon Lord. Don\'t let heroes reach the city!',
  'help-souls':     '<b>Souls</b> — your currency. Earn by killing heroes, spend on upgrades.',
  'help-elite':     '<b>Gold Souls</b> — drop from elites and bosses, kept between levels. Permanent upgrades in the "Dungeon Soul".',
  'help-atk':       '<b>ATTACK</b> — sends the next wave of heroes. <span class="hd">Monsters march on the city; every 10 city HP grants a soul.</span>',
  'help-floor':     '<b>Floor</b> — builds a new dungeon level. <span class="hd">Floors hold monsters and traps — the deeper heroes go, the harder it is to survive.</span>',
  'help-trap':      '<b>Traps</b> — buy a trap, then <span class="hd">tap a floor</span> to install. Spikes — damage, Dart — ranged fire, Teleport — sends back, Summon — calls a monster.',
  'help-lord-row':  '<b>Lord</b> — that\'s you: seated on the throne of the deepest floor, he fights back if heroes reach him. If he dies, it\'s over. Upgrade his attack and HP.',
  'help-monsters':  '<b>Monsters</b> — upgrade all dungeon monsters\' attack and endurance at once.',
  'help-camera':    '<span class="hd">Drag the camera up/down</span> to see deeper floors.',
  'help-ok':        'Got it! Let\'s start!',
  // Daily panel
  'daily-title':    '📋 Daily Quests',
  'dq-kills':       '○ Kill 5 heroes +5 <span class="esoul-gem"></span>',
  'dq-kills-done':  '✓ Kill 5 heroes +5 <span class="esoul-gem"></span>',
  'dq-wave':        '○ Trigger a wave +5 <span class="esoul-gem"></span>',
  'dq-wave-done':   '✓ Trigger a wave +5 <span class="esoul-gem"></span>',
  'dq-upgrade':     '○ Upgrade something +5 <span class="esoul-gem"></span>',
  'dq-upgrade-done':'✓ Upgrade something +5 <span class="esoul-gem"></span>',
  // Toast
  'toast-copied':   '📋 Copied!',
  'toast-streak':   '🔥 {n}-day streak! +{b} 💀',
  'toast-quest':    '✅ Quest complete! +5 💀',
  // Tutorial
  'tut-label':      'Tip {n} / {t}',
  'tut-skip':       'Skip',
  'tut-next':       'Next →',
  'tut-got':        'Got it',
  'tut-done':       '✅ Done!',
  'wave-label':     'Wave',
  'tut-step1':      '⚔️ Press <b>ATTACK</b> — send the first wave of enemies into the dungeon!',
  'tut-step2':      '💀 Each hero you kill earns <b>Souls</b>. Spend them between waves on monsters, floors, and traps.',
  'tut-step3':      '🪤 <b>Traps</b> finish off those who broke through. Spikes — damage, Teleport — pushes back, Summon — spawns a monster. Tap a floor after buying.',
  'tut-step4':      '👑 The <b>Lord</b> fights personally on the surface. Tap him to open upgrades. Good hunting!',
  // Share
  'share-text':     '👑 I am the {arch} in Dungeon Lord!\nDefended {r} waves, destroyed {k} enemies.\nWhat kind of dungeon lord are you? 👇',
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
  'mod-blood':      'Blood Frenzy',    'mod-blood-d':   '+1 soul per enemy killed',
  'mod-elite':      'Elite Surge',     'mod-elite-d':   'Elite souls ×2 this run',
  'mod-fury':       'Lord\'s Fury',    'mod-fury-d':    '+25% Lord attack damage',
  'mod-iron':       'Iron Walls',      'mod-iron-d':    'Monsters gain bonus HP based on level',
  'mod-pact':       'Dark Pact',       'mod-pact-d':    '+5 <span class="esoul-gem"></span> now, but heroes are +15% stronger',
  'mod-well':       'Soul Well',       'mod-well-d':    '+80 souls at the start',
  'mod-aura':       'Warlord Aura',    'mod-aura-d':    'All monsters gain +4 attack',
  'mod-regen':      'Undying',         'mod-regen-d':   '+150 Lord HP and +1 HP/sec regen',
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
    // lord-title ставиться через _getTitleByElite (не data-i18n) — при зміні
    // мови його треба перерахувати вручну, інакше лишається старою мовою
    var _lt = document.getElementById('lord-title');
    if (_lt && typeof _getTitleByElite === 'function' && typeof getStoredEliteSouls === 'function') {
        _lt.textContent = _getTitleByElite(getStoredEliteSouls());
    }
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
        { text:'→ Public execution. Discipline above all', tags:['dom','pom'], buff:{ soulBonus:3, heroThreatPct:0.5 } },
        { text:'→ Turn into a double agent', tags:['zna','kha'], buff:{ eliteChance:-3 } },
        { text:'→ Extract all intel and release', tags:['zna'], buff:{ heroThreatPct:-0.5 } },
      ]},
    { id:'guild_pact', trigger:'wave_start', minRound:2, weight:2,
      badge:'🤝 Offer', title:'Guild Proposal',
      text:'An adventurers\' guild offers a temporary pact: 90 seconds without attacks in exchange for 60 souls.',
      choices:[
        { text:'→ Accept. A breather matters', tags:['vyj'], buff:{ soulBonus:4 } },
        { text:'→ Refuse with contempt', tags:['per','pom'], buff:{} },
        { text:'→ Accept and break it at the right moment', tags:['kha','dom'], buff:{ heroThreatPct:1, soulBonus:6 } },
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
        { text:'→ Convert into a dungeon servant', tags:['dom','kha'], buff:{ soulBonus:3 } },
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
        { text:'→ Execute before the ranks', tags:['dom'], buff:{ soulBonus:3, heroThreatPct:0.3 } },
        { text:'→ Forgive. Anyone can be afraid', tags:['vyj'], buff:{} },
        { text:'→ Assign to the most dangerous tasks', tags:['zna','kha'], buff:{ captainChance:-2 } },
      ]},
    { id:'ambassador', trigger:'wave_start', minRound:6, weight:1,
      badge:'🤝 Envoy', title:'Royal Ambassador',
      text:'The king\'s ambassador offers: leave upper floors free — and the city won\'t send more heroes.',
      choices:[
        { text:'→ Negotiate. Details matter', tags:['zna','vyj'], buff:{ heroThreatPct:-1 } },
        { text:'→ Kill the ambassador. We don\'t negotiate', tags:['pom','dom'], buff:{ eliteChance:3, heroThreatPct:0.5 } },
        { text:'→ Agree and break it when it suits us', tags:['kha','dom'], buff:{ soulBonus:4 } },
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
        { text:'→ Agree. Resources should be used', tags:['kha','zna'], buff:{ soulBonus:3 } },
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
    { id:'prisoner_return', trigger:'wave_start', minRound:4, weight:2, story:true,
      requires: { id:'prisoner_knight', choice:0 },
      badge:'⚔️ Return', title:'The Knight Returns',
      text:'The knight you released is back — not with a sword, but with an unrolled scroll and an offer to become an informant. Says he fights for coin, not ideology.',
      choices:[
        { text:'→ Take him as an informant. Unreliable, but useful', tags:['zna','kha'], buff:{ heroThreatPct:-1 } },
        { text:'→ Refuse. Those who yield easily betray easily', tags:['per','dom'], buff:{} },
        { text:'→ Take him and secretly report him to the city. Let them deal with it', tags:['kha'], buff:{ soulBonus:4 } },
      ]},
    { id:'prisoner_revenge', trigger:'wave_start', minRound:4, weight:2, story:true,
      requires: { id:'prisoner_knight', choice:1 },
      badge:'🩸 Blood Feud', title:'The Knight\'s Brother',
      text:'The executed knight\'s brother has taken command of the next wave. He isn\'t just fighting — he\'s heading straight for your floor. Messengers say: he has a name for you, and it isn\'t flattering.',
      choices:[
        { text:'→ Prepare separately: rage makes people predictable', tags:['per','vyj'], buff:{ heroThreatPct:1.5 } },
        { text:'→ Try negotiations. Gold quenches even fire', tags:['zna','vyj'], buff:{ heroThreatPct:0.5 } },
        { text:'→ Post a bounty on his head among the heroes themselves', tags:['kha','dom'], buff:{ eliteChance:3 } },
      ]},
    { id:'village_supply', trigger:'wave_end', minRound:4, weight:2, story:true,
      requires: { id:'village_revolt', choice:0 },
      badge:'📜 Village Report', title:'Debt Repaid',
      text:'The villagers sent seven volunteers — people who don\'t want to live under the city\'s rule. Not monsters, but willing to help: block roads, carry information, hide the wounded.',
      choices:[
        { text:'→ Accept. Allies come in all forms', tags:['vyj'], buff:{ heroThreatPct:-1, soulBonus:4 } },
        { text:'→ Take the intelligence only, no people in the dungeon', tags:['zna'], buff:{ heroThreatPct:-0.5 } },
        { text:'→ Refuse. People in the dungeon are a weak point', tags:['per'], buff:{} },
      ]},
    { id:'village_occupied', trigger:'wave_start', minRound:4, weight:2, story:true,
      requires: { id:'village_revolt', choice:2 },
      badge:'⚠️ Situation', title:'City Occupied the Village',
      text:'Hearing of the "intimidation," the city sent a garrison. Now these people are angry at both you and the city. Awkward for everyone.',
      choices:[
        { text:'→ Send them weapons. Let them fight the garrison', tags:['kha','dom'], buff:{ heroThreatPct:1, soulBonus:4 } },
        { text:'→ Pretend this wasn\'t our idea', tags:['kha'], buff:{} },
        { text:'→ Send monsters to drive out the garrison — openly', tags:['dom','pom'], buff:{ heroThreatPct:2, eliteChance:4 } },
      ]},
    { id:'spy_news', trigger:'wave_start', minRound:4, weight:2, story:true,
      requires: { id:'traitor', choice:1 },
      badge:'🔍 Spy Report', title:'Inside Intelligence',
      text:'Your spy sent an encrypted scroll. The city council is planning to bribe two of your captains. One seems to have already agreed.',
      choices:[
        { text:'→ Expose the traitor publicly — discipline over secrecy', tags:['dom','pom'], buff:{ soulBonus:3, heroThreatPct:0.5 } },
        { text:'→ Pretend not to know — and keep watching', tags:['zna','kha'], buff:{ heroThreatPct:-0.5 } },
        { text:'→ Set the traitor up through disinformation to the council', tags:['kha','per'], buff:{ captainChance:-5 } },
      ]},
    { id:'guild_war', trigger:'wave_start', minRound:4, weight:2, story:true,
      requires: { id:'guild_pact', choice:2 },
      badge:'⚠️ Consequences', title:'Guild Declared a Hunt',
      text:'The adventurers\' guild officially declared an open hunt on your lord. Every wave now includes two or three of their assassins. Reputation is brutal.',
      choices:[
        { text:'→ Pay compensation. Stop escalation before it\'s too late', tags:['vyj'], buff:{ soulBonus:-15 } },
        { text:'→ Counter with a hunt on their guildmaster', tags:['pom','dom'], buff:{ heroThreatPct:2, eliteChance:5 } },
        { text:'→ Hire a rival guild to cause them trouble', tags:['kha'], buff:{ heroThreatPct:0.5, soulBonus:3 } },
      ]},
    { id:'relic_awakens', trigger:'wave_end', minRound:4, weight:2, story:true,
      requires: { id:'dark_relic', choice:2 },
      badge:'🔮 Awakening', title:'The Relic Speaks',
      text:'At night — a voice. You don\'t know whose. The voice says it "wants more." Monsters are nervous. Even the golem.',
      choices:[
        { text:'→ Steel your will. You\'re the lord here, not a piece of stone', tags:['dom','per'], buff:{ lordDmg:5 } },
        { text:'→ Give it what it asks. For now', tags:['kha'], buff:{ lordDmg:10, heroThreatPct:1 } },
        { text:'→ Call the witch — let her handle it', tags:['zna','vyj'], buff:{} },
      ]},
    { id:'slime_petition', trigger:'wave_end', maxLevel:25, minRound:2, weight:2,
      badge:'💙 Petition', title:'Slimes Demand Respect',
      text:'A slime delegation appeared in the throne room. They brought a scroll — surprisingly neatly written, considering they have no hands. Key demands: more darkness, fewer torches, and officially stop calling them "those green blobs."',
      choices:[
        { text:'→ Grant it. They\'ve earned respect', tags:['vyj'], buff:{ soulBonus:3 } },
        { text:'→ Compromise: new names yes, torches stay', tags:['kha','zna'], buff:{} },
        { text:'→ Declare official title: "Elite Slime Warriors"', tags:['per'], buff:{ eliteChance:2 } },
      ]},
    { id:'bat_strike', trigger:'wave_start', maxLevel:25, minRound:3, weight:2,
      badge:'🦇 Labor Dispute', title:'Bat Strike',
      text:'The bats declared a strike. After rebuilding the third corridor their echolocation misfires and two flew into a wall. They want either reconstruction or compensation for "occupational injury." The delegate\'s nose is bandaged.',
      choices:[
        { text:'→ Agree to compensation. Give them... flies', tags:['vyj'], buff:{} },
        { text:'→ Rebuild the corridor. Healthy monsters are effective monsters', tags:['zna','per'], buff:{ heroThreatPct:-0.3 } },
        { text:'→ Remind them "strike" isn\'t in their contract', tags:['dom'], buff:{ soulBonus:2 } },
      ]},
    { id:'golem_poet', trigger:'wave_end', maxLevel:25, minRound:4, weight:2,
      badge:'🗿 Cultural Event', title:'Golem Wrote a Poem',
      text:'The golem brought a stone slab with chiseled text. An ode to the dungeon. One line about you: "Lord is great. Lord is dark. Lord sometimes doesn\'t explain why we do this. But we go anyway." The author didn\'t sign — but only one monster has a chisel.',
      choices:[
        { text:'→ Declare it the "Dungeon Poem." Officially', tags:['per'], buff:{ soulBonus:3 } },
        { text:'→ Order another slab carved — with the lord\'s reply', tags:['dom','per'], buff:{} },
        { text:'→ Say nothing. Quietly keep the slab', tags:['vyj'], buff:{ lordDmg:2 } },
      ]},
    { id:'skeleton_law', trigger:'wave_start', maxLevel:25, minRound:5, weight:2,
      badge:'💀 Legal Dispute', title:'Skeleton and Tax Status',
      text:'A skeleton came with a question after heroes yelled "You\'re already dead!". It wants legal clarity: if officially dead — must it pay castle tax? And who will be its heir, exactly.',
      choices:[
        { text:'→ Explain: "undead" is a separate legal category. With benefits', tags:['zna','kha'], buff:{} },
        { text:'→ Designate it "Living-For-Dungeon-Purposes." There\'s a seal', tags:['per','dom'], buff:{ soulBonus:4 } },
        { text:'→ Say questions like this mean it owes another round of service', tags:['dom'], buff:{ heroThreatPct:-0.2 } },
      ]},
    { id:'zombie_menu', trigger:'wave_end', maxLevel:25, minRound:3, weight:2,
      badge:'🧟 Complaint', title:'Zombies Dislike the Menu',
      text:'Zombies filed a complaint. Anonymously, but the handwriting is recognizable. The gist: we\'re only fed heroes that have "cooled down." We want fresh. Don\'t count spelling errors — not bad for undead.',
      choices:[
        { text:'→ Explain the logistics: "fresh" means still alive', tags:['zna'], buff:{} },
        { text:'→ Introduce a "premium menu" for those distinguished in battle', tags:['kha','per'], buff:{ eliteChance:2 } },
        { text:'→ Put them on the front line — let them solve the freshness problem themselves', tags:['dom'], buff:{ heroThreatPct:-0.5, soulBonus:3 } },
      ]},
    { id:'minotaur_mirror', trigger:'wave_end', maxLevel:25, minRound:6, weight:1,
      badge:'🐂 Personal Matter', title:'The Minotaur and the Mirror',
      text:'The minotaur found a silver mirror in the trophy room and hasn\'t moved in three days. Doesn\'t bother anyone. Just looks. Occasionally sighs. Monsters pass by and speak in whispers.',
      choices:[
        { text:'→ Remove the mirror. Sentimentality isn\'t for fighters', tags:['dom','per'], buff:{} },
        { text:'→ Leave it. Everyone needs something', tags:['vyj'], buff:{ soulBonus:3 } },
        { text:'→ Give it another mirror. Let it figure things out', tags:['kha'], buff:{ captainChance:3 } },
      ]},
    { id:'city_legend', trigger:'wave_end', minLevel:4, minRound:2, weight:2, story:true,
      badge:'📜 City News', title:'New Name',
      text:'The city officially renamed your dungeon on its maps. Now it\'s "The Cursed Heart." Tourists are banned. Parents scare children with it. Bards write ballads. Ironic, but better than before.',
      choices:[
        { text:'→ Send your own map with the correct name', tags:['pom','per'], buff:{ eliteChance:2 } },
        { text:'→ Accept the name. Sounds respectable', tags:['kha','dom'], buff:{} },
        { text:'→ Find the bards and offer "technical corrections" to the songs', tags:['zna'], buff:{ soulBonus:4 } },
      ]},
    { id:'historian_visit', trigger:'wave_start', minLevel:6, minRound:2, weight:1, story:true,
      badge:'📖 Unexpected Guest', title:'Traveling Chronicler',
      text:'An old man in a robe with a quill walked past the guards — they just froze. Says he\'s writing "A True Chronicle of Dark Places" and wants your version of events. Insistently. Very.',
      choices:[
        { text:'→ Give an interview. First chance at your own narrative', tags:['per','pom'], buff:{ eliteChance:3 } },
        { text:'→ Expel him. Uninvited scroll-carriers are always a risk', tags:['dom','per'], buff:{} },
        { text:'→ Keep him in the dungeon. Could be useful — or a hostage', tags:['kha','zna'], buff:{ heroThreatPct:-0.5 } },
      ]},
    { id:'ancient_dungeon', trigger:'wave_end', minLevel:8, minRound:2, weight:1, story:true,
      badge:'🗝️ Discovery', title:'400 Years of Dungeon',
      text:'Monsters dug a new room and found walls with inscriptions. By the dates — the dungeon is over 400 years old. There are names of previous lords. The last entry cuts off mid-sentence.',
      choices:[
        { text:'→ Research carefully. The past always has something to teach', tags:['zna'], buff:{ lordDmg:4, heroThreatPct:-0.5 } },
        { text:'→ Seal it. Others\' legacy is unnecessary burden', tags:['per'], buff:{} },
        { text:'→ Use it for propaganda: "400 years undefeated"', tags:['kha','pom'], buff:{ eliteChance:3 } },
      ]},
    { id:'hero_memorial', trigger:'wave_start', minLevel:5, minRound:2, weight:2, story:true,
      badge:'📜 City News', title:'Monument to the Fallen',
      text:'The city unveiled a monument to 50 known heroes who died here. Ceremonial speech. The crowd weeps. Your dungeon wasn\'t mentioned — only "hostile forces." But there are photographers.',
      choices:[
        { text:'→ Send an anonymous wreath. Ironic and restrained', tags:['kha'], buff:{ soulBonus:3 } },
        { text:'→ Prepare: after such ceremonies there\'s always a surge of hero motivation', tags:['vyj','per'], buff:{ heroThreatPct:0.5 } },
        { text:'→ Destroy the monument in a night raid. Symbolic and unambiguous', tags:['pom','dom'], buff:{ heroThreatPct:2, eliteChance:5 } },
      ]},
    { id:'legendary_hero', trigger:'wave_start', minLevel:18, minRound:3, weight:1, story:true,
      badge:'⚔️ Threat', title:'A Hero with a Name',
      text:'Kindred the Sunlit arrived in the city — a paladin with a legend. Survived five dungeons. The city pays triple. He\'s already studying the map.',
      choices:[
        { text:'→ Completely rebuild the defense. Different threat level, different response', tags:['per','vyj'], buff:{ heroThreatPct:1, soulBonus:4 } },
        { text:'→ Spread disinformation about the dungeon', tags:['kha','zna'], buff:{ captainChance:-3 } },
        { text:'→ Wait. Legends also die from traps and arrows', tags:['dom','kha'], buff:{} },
      ]},
    { id:'dark_lord_message', trigger:'wave_end', minLevel:10, minRound:3, weight:1, story:true,
      badge:'🏰 Dark Diplomacy', title:'Letter from a Neighbor',
      text:'A raven brought a letter with a black seal. You\'re being written to from another dungeon. Offers a "pact between dark ones." Intelligence exchange, possibly joint action. Signed: "Mort the Nameless." Suspiciously modest for a lord.',
      choices:[
        { text:'→ Accept the pact. More information means more survival', tags:['zna','kha'], buff:{ heroThreatPct:-1 } },
        { text:'→ Refuse. Allies in darkness are always future rivals', tags:['dom','per'], buff:{} },
        { text:'→ Accept and secretly report him to the city. Higher level of cunning', tags:['kha'], buff:{ soulBonus:5 } },
      ]},
    { id:'oracle_prophecy', trigger:'wave_end', minLevel:7, minRound:2, weight:1, story:true,
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

    // ── Named heroes: Marta ─────────────────────────────────────────────────────
    { id:'marta_spy', trigger:'wave_start', minLevel:12, maxLevel:15, minRound:3, weight:4, story:true,
      badge:'🕵 Intercepted', title:'Scout Marta',
      text:'Your monsters caught a girl sketching a map of the lower floors. She didn\'t run. She stared straight at you. «I want to know who you are. Not for the guild — for myself.» Her name is embroidered on the cloak: Marta.',
      choices:[
        { text:'→ Release her. She\'s done nothing wrong', tags:['vyj','zna'], buff:{ heroThreatPct:-0.5 } },
        { text:'→ Propose a trade: she tells you about the city, you say nothing about her', tags:['zna','kha'], buff:{ soulBonus:4 } },
        { text:'→ Keep her under guard. Too curious to let go', tags:['dom'], buff:{ captainChance:2 } },
      ]},
    { id:'marta_return', trigger:'wave_start', minLevel:26, maxLevel:31, minRound:3, weight:5, story:true,
      requires: { id:'marta_spy', choice:0 },
      badge:'📜 Letter from the scout', title:'Marta returns',
      text:'She came alone. No weapons, no escort. She placed a list on the floor: families sending heroes, debt contracts, who pays for each raid. «I thought — maybe there\'s a way that doesn\'t kill both of us.»',
      choices:[
        { text:'→ «This is worth a great deal. Continue.»', tags:['zna','vyj'], buff:{ heroThreatPct:-1.5, soulBonus:3 } },
        { text:'→ «You understand I cannot stop?»', tags:['vyj','per'], buff:{ heroThreatPct:-0.5 } },
        { text:'→ «Peace is impossible. But this data is useful.»', tags:['dom','zna'], buff:{ soulBonus:4 } },
      ]},
    { id:'marta_escaped', trigger:'wave_start', minLevel:26, maxLevel:31, minRound:3, weight:5, story:true,
      requires: { id:'marta_spy', choice:2 },
      badge:'⚠ Complication', title:'Marta escaped',
      text:'The cell is empty. The guard knocked out. Written in charcoal on the wall: «You could have let me go.» Scouts report she is now leading the next wave personally.',
      choices:[
        { text:'→ Prepare a trap. She knows the dungeon — but not all of it', tags:['per','kha'], buff:{ eliteChance:3 } },
        { text:'→ Send a signal that you remember. Maybe she\'ll stop', tags:['vyj','zna'], buff:{ heroThreatPct:-0.5 } },
        { text:'→ Let her come. She chose her path', tags:['dom','pom'], buff:{ lordDmg:4 } },
      ]},

    // ── Named heroes: Old Vilem ─────────────────────────────────────────────────
    { id:'vitem_first', trigger:'wave_end', minLevel:20, maxLevel:23, minRound:3, weight:4, story:true,
      badge:'⚔️ Veteran', title:'Old Vilem',
      text:'He didn\'t attack. He sat in the middle of the corridor and said: «I served the lord before you. Fifty years. I know what he did — and why he stopped. Do you have a minute?»',
      choices:[
        { text:'→ «Speak. But briefly.»', tags:['zna'], buff:{ lordDmg:3 } },
        { text:'→ «That lord lost. His lessons aren\'t mine.»', tags:['per','dom'], buff:{ heroThreatPct:0.5 } },
        { text:'→ Release without conversation. Age is no reason to halt a battle', tags:['kha','vyj'], buff:{ soulBonus:3 } },
      ]},
    { id:'vitem_second', trigger:'wave_start', minLevel:35, maxLevel:38, minRound:3, weight:4, story:true,
      requires: { id:'vitem_first', choice:0 },
      badge:'📜 Letter from the veteran', title:'Vilem writes',
      text:'Paper arrived via a monster nobody killed. «That lord stopped because he found a name. Varan. He wrote it on the wall of the lowest floor before he disappeared. Have you seen that name yet?»',
      choices:[
        { text:'→ «I have. How did he know my name?»', tags:['zna','vyj'], buff:{ lordDmg:5 } },
        { text:'→ Burn the letter. This could be a trap', tags:['per','dom'], buff:{} },
        { text:'→ Write back: «I remember more than you think.»', tags:['kha','zna'], buff:{ heroThreatPct:-1, lordDmg:3 } },
      ]},

    // ── Named heroes: Lyra · Path of peace ─────────────────────────────────────
    { id:'lira_peace', trigger:'wave_start', minLevel:30, maxLevel:33, minRound:3, weight:4, story:true,
      badge:'✦ Proposal', title:'Priestess Lyra',
      text:'A woman in white stopped five steps from the gate. No weapons. «I am not a hero. I am an envoy of gods nobody remembers anymore. I am permitted to speak — if you permit me to be heard.»',
      choices:[
        { text:'→ «Speak. But first — who truly sent you?»', tags:['zna','vyj'], buff:{ heroThreatPct:-1 } },
        { text:'→ Let her in silently and listen', tags:['vyj','kha'], buff:{ soulBonus:3 } },
        { text:'→ «Gods were silent for five hundred years. Their turn.»', tags:['per','dom'], buff:{ lordDmg:3 } },
      ]},
    { id:'lira_truce', trigger:'wave_start', minLevel:43, maxLevel:45, minRound:3, weight:5, story:true,
      requires: { id:'lira_peace', choice:0 },
      badge:'✦ Last chance', title:'Lyra: terms fulfilled',
      text:'Lyra stands in the same place. «Terms fulfilled on both sides. The city is ready to stop the attacks — permanently. In return — you do not leave here. But no one else dies.» The dungeon\'s silence almost sounds like consent.',
      choices:[
        { text:'→ Accept. This is the only victory without bodies.', tags:['vyj','zna'], buff:{ lordDmg:0 }, specialAction:'peace_victory' },
        { text:'→ «Too late. I\'ve already chosen a different path.»', tags:['per','dom'], buff:{ heroThreatPct:-1 } },
        { text:'→ «Give me one more round to think.»', tags:['kha','vyj'], buff:{ heroThreatPct:-0.5 } },
      ]},

    // ── ACT III (rounds 26–38): Fracture · Memory stirs ────────────────────

    { id:'memory_fragment', trigger:'wave_start', minLevel:26, minRound:3, weight:2, story:true,
      badge:'🌀 Memory', title:'A Shard of the Past',
      text:'You wake from battle with a name on your tongue. Varan. It feels foreign — yet sounds like yours. The monsters stare. You were speaking aloud.',
      choices:[
        { text:'→ Ignore it. Exhaustion and stress, nothing more', tags:['per','kha'], buff:{} },
        { text:'→ Write it down. Could matter — or explain something important', tags:['zna'], buff:{ lordDmg:3 } },
        { text:'→ Ask the Abyss. It knows more than it says', tags:['vyj','dom'], buff:{ heroThreatPct:-0.5, lordDmg:5 } },
      ]},

    { id:'old_soldier', trigger:'wave_end', minLevel:30, minRound:3, weight:2, story:true,
      badge:'⚔️ Encounter', title:'The Veteran',
      text:'An old soldier refuses to fight. He lays on the floor: «I saw the lord before you. He also thought he was winning.» The monsters don\'t know what to do.',
      choices:[
        { text:'→ Let him go. Those who choose peace aren\'t my enemies', tags:['vyj'], buff:{ soulBonus:3 } },
        { text:'→ Interrogate him. Who was «the lord before me»?', tags:['zna'], buff:{ lordDmg:4 } },
        { text:'→ Detain him by force. An example of defiance is more dangerous than one old man', tags:['dom','per'], buff:{ heroThreatPct:0.5, eliteChance:2 } },
      ]},

    { id:'abyss_whisper', trigger:'wave_start', minLevel:33, minRound:3, weight:2, story:true,
      badge:'🌑 Inner Voice', title:'The Abyss Advises',
      text:'The Abyss doesn\'t command for once — it asks. «Do you still remember why you began?» A pause. «Do you want to remember?»',
      choices:[
        { text:'→ «Yes. I want to know everything.» Even if the answer hurts', tags:['zna','vyj'], buff:{ lordDmg:4 } },
        { text:'→ «It doesn\'t matter. I do what I do.»', tags:['per','dom'], buff:{} },
        { text:'→ «Why are you asking? What do you need?»', tags:['kha','zna'], buff:{ heroThreatPct:-0.5, lordDmg:3 } },
      ]},

    // ── ACT IV (rounds 39–50): Choice · Abyss Intercepts ───────────────────

    { id:'andrii_talk', trigger:'wave_start', minLevel:44, maxLevel:44, minRound:4, weight:10, story:true,
      badge:'⚔️ Messenger', title:'Hero Andrii',
      text:'He came unarmed. Set his shield on the floor and said: «I\'m not here to fight. I want to know who you are. The city says — a monster. But monsters don\'t build. You build.» The Abyss commands: kill him.',
      choices:[
        { text:'→ «Go. While you can.» He\'s not your enemy — but not an ally either', tags:['per','vyj'], buff:{ heroThreatPct:-1 } },
        { text:'→ Tell him everything. About Varan, the Abyss, 500 years', tags:['zna','vyj'], buff:{ lordDmg:5 } },
        { text:'→ Listen. What does he know about your true purpose?', tags:['zna','kha'], buff:{ heroThreatPct:-1.5, lordDmg:3 } },
        { text:'→ Stay silent. Let him decide for himself', tags:['kha'], buff:{} },
      ]},

    { id:'abyss_intercept_loyalty', trigger:'wave_start', minLevel:39, minRound:3, weight:3, story:true,
      type:'abyss',
      badge:'∞ THE ABYSS', title:'First Offer',
      text:'The Abyss speaks without monsters, without intermediaries. Directly. «Five hundred years you guarded me. Now I offer you to become me. No pain. No memory. Simply — an end.»',
      choices:[
        { text:'→ «No.» One word. Enough.', tags:['per','dom'], buff:{ lordDmg:6 } },
        { text:'→ «Tell me more. No pain — what does that mean?»', tags:['zna','kha'], buff:{ heroThreatPct:-1 } },
        { text:'→ «Five hundred years — and you think I forgot what you are?»', tags:['vyj','per'], buff:{ lordDmg:4, heroThreatPct:-0.5 } },
      ]},

    { id:'abyss_offer_freedom', trigger:'wave_end', minLevel:43, minRound:3, weight:3, story:true,
      type:'abyss',
      badge:'∞ THE ABYSS', title:'Second Offer',
      text:'«You protected them and they sent more heroes. You gave them time and they used it against you. Let me handle this differently. Permanently.»',
      choices:[
        { text:'→ «I don\'t need a protector.»', tags:['dom','per'], buff:{ lordDmg:5 } },
        { text:'→ «What would you do to them?»', tags:['zna'], buff:{ heroThreatPct:1 } },
        { text:'→ Stay silent. Sometimes silence is the only honest answer.', tags:['vyj','kha'], buff:{} },
      ]},

    { id:'abyss_confession', trigger:'wave_start', minLevel:47, minRound:3, weight:3, story:true,
      type:'abyss',
      badge:'∞ THE ABYSS', title:'Third and Last',
      text:'«Varan.» Not lord. Varan. «I fear you. Not because you\'re strong. Because you remember. And now you\'re choosing.» The dungeon falls to absolute silence.',
      choices:[
        { text:'→ «I remember. And so — no.»', tags:['per','vyj'], buff:{ lordDmg:8 } },
        { text:'→ «Tell me what you are and I\'ll decide.»', tags:['zna','kha'], buff:{ lordDmg:4 } },
        { text:'→ «Five hundred years — is my answer. You already know it.»', tags:['dom','per'], buff:{ lordDmg:6, heroThreatPct:-1 } },
      ]},

    // ═══ ACT-SPECIFIC STORY EVENTS (campaign level scale) ════════════════════
    { id:'act1_census', trigger:'wave_start', minLevel:2, maxLevel:10, minRound:2, weight:2, story:true,
      badge:'SCOUT REPORT', title:'Prisoner Census',
      text:'The steward lays a scroll on the table: three times more prisoners than mouths we can feed. He awaits your decision with the face of a man who already knows the answer.',
      choices:[
        { text:'→ Release the weak. Fewer mouths', tags:['vyj'], buff:{ heroThreatPct:-0.5 }, tag:'The city hesitates' },
        { text:'→ All to the mines. Work will find them', tags:['dom','pom'], buff:{ soulBonus:2, heroThreatPct:0.5 }, tag:'Souls flow, the city seethes' },
        { text:'→ Whatever. Let the steward decide', tags:['per'], buff:{}, tag:'' },
      ] },

    { id:'act1_famine', trigger:'wave_end', minLevel:3, maxLevel:12, minRound:1, weight:2, story:true,
      badge:'VOICES OF THE DUNGEON', title:'Hunger in the Vaults',
      text:'The stores are empty. The goblin quartermaster reports that the monsters are eyeing one another in a distinctly non-collegial manner.',
      choices:[
        { text:'→ Requisition grain from nearby villages', tags:['dom'], buff:{ soulBonus:1, eliteChance:1 }, tag:'Fed, but noticed' },
        { text:'→ Let them eat prisoners. It\'s a dungeon', tags:['pom','kha'], buff:{ soulBonus:2, heroThreatPct:0.5 }, tag:'Horror feeds the legends' },
        { text:'→ Tighten belts. Discipline above all', tags:['per','vyj'], buff:{}, tag:'' },
      ] },

    { id:'act1_spy', trigger:'wave_start', minLevel:4, maxLevel:12, minRound:3, weight:2, story:true,
      badge:'SCOUT REPORT', title:'The First Spy',
      text:'Among the recruits: a man with a carrier pigeon and suspiciously clean fingernails. The city wants to know how many towers we have. Touching — someone is finally counting.',
      choices:[
        { text:'→ Execute him publicly. A visual aid', tags:['dom','pom'], buff:{ soulBonus:1, eliteChance:1 }, tag:'The city sends its best' },
        { text:'→ Feed him falsified plans', tags:['kha','zna'], buff:{ heroThreatPct:-1 }, tag:'Heroes wander the wrong map' },
        { text:'→ Release him. Let truth be reported', tags:['dom','per'], buff:{ eliteChance:2 }, tag:'Challenge accepted' },
      ] },

    { id:'act1_tempo', trigger:'wave_end', minLevel:5, maxLevel:12, minRound:2, weight:3, story:true,
      badge:'WHISPER OF THE ABYSS', title:'Praise and Whip',
      text:'"You destroy beautifully, my weapon. But slowly. The next city waits, and waiting... disagrees with me. Faster."',
      choices:[
        { text:'→ Speed up. The Abyss knows best', tags:['dom'], buff:{ lordDmg:3, heroThreatPct:0.5 }, tag:'Power on a leash' },
        { text:'→ Keep my own pace', tags:['per','vyj'], buff:{ heroThreatPct:-0.5 }, tag:'Method pays off' },
        { text:'→ Ask what the hurry is about', tags:['zna'], buff:{}, tag:'' },
      ] },

    { id:'act2_refugees', trigger:'wave_start', minLevel:13, maxLevel:20, minRound:1, weight:3, story:true,
      badge:'SCOUT REPORT', title:'Refugees of the Ashes',
      text:'A refugee column from the razed city crosses the valley. An old woman points at your tower and shouts something. The scout clarifies: not "monster". She was shouting a name.',
      choices:[
        { text:'→ Let the column pass. Don\'t look', tags:['vyj'], buff:{ heroThreatPct:-0.5 }, tag:'Mercy breeds rumors' },
        { text:'→ Bring the old woman. What name?', tags:['zna'], buff:{ heroThreatPct:0.5 }, tag:'The name creeps through camp' },
        { text:'→ Scatter them. A name is a weapon', tags:['pom','dom'], buff:{ soulBonus:2, heroThreatPct:1 }, tag:'The city hoards its hatred' },
      ] },

    { id:'act2_ransom', trigger:'wave_start', minLevel:14, maxLevel:22, minRound:2, weight:2, story:true,
      badge:'ENVOY', title:'Ransom for a City',
      text:'A young knight stands at the gate, helmet off. His name is Dalen. He offers the treasury of three guilds if you pass Vellas by. He believes this will work. Touching. And dangerous.',
      choices:[
        { text:'→ Take the ransom. A Lord\'s word sells', tags:['kha','vyj'], buff:{ heroThreatPct:-1 }, tag:'Vellas lays down arms' },
        { text:'→ Refuse. The city falls on schedule', tags:['dom','per'], buff:{ soulBonus:2, heroThreatPct:0.5 }, tag:'Dalen will return with an army' },
        { text:'→ Ask why he trusts a monster', tags:['zna'], buff:{}, tag:'' },
      ] },

    { id:'act2_burial', trigger:'wave_end', minLevel:15, maxLevel:24, minRound:1, weight:2, story:true,
      badge:'VOICES OF THE DUNGEON', title:'The Gravedigger\'s Plea',
      text:'An old troll gravedigger shuffles at the threshold: the monsters ask permission to bury fallen heroes "like people". Says they fought honestly. Your monsters are more sentimental than you.',
      choices:[
        { text:'→ Allow it. The dead don\'t fight', tags:['per','vyj'], buff:{ heroThreatPct:-0.5 }, tag:'Heroes hesitate to kill' },
        { text:'→ Forbid it. Corpses are a resource', tags:['dom','pom'], buff:{ soulBonus:2, heroThreatPct:0.5 }, tag:'Richer souls, thicker wrath' },
        { text:'→ Attend the first funeral. Silently', tags:['zna'], buff:{}, tag:'' },
      ] },

    { id:'act2_mapseller', trigger:'wave_start', minLevel:16, maxLevel:25, minRound:3, weight:2, story:true,
      badge:'VISITOR', title:'The Map Seller',
      text:'A smuggler sells the defense plans of the next city. Pocketing the gold, he suddenly asks: "Why these cities, exactly? They have nothing in common." You catch yourself not knowing.',
      choices:[
        { text:'→ Buy the map. Skip the questions', tags:['dom'], buff:{ heroThreatPct:-1, eliteChance:1 }, tag:'Defenses laid bare' },
        { text:'→ Buy it and answer honestly: no idea', tags:['zna'], buff:{ heroThreatPct:-0.5 }, tag:'The question stays lodged' },
        { text:'→ Execute him. Far too observant', tags:['pom','kha'], buff:{ soulBonus:1, heroThreatPct:0.5 }, tag:'Merchants avoid the valley' },
      ] },

    { id:'act2_evasion', trigger:'wave_end', minLevel:17, maxLevel:25, minRound:2, weight:3, story:true,
      requires:{ id:'act2_mapseller', choice:1 },
      badge:'WHISPER OF THE ABYSS', title:'The First Evasion',
      text:'You ask the Abyss: why these cities? The pause stretches longer than it should. "They... interfere. Don\'t ask the obvious, my weapon." For the first time, she didn\'t answer at once.',
      choices:[
        { text:'→ Press her. Interfere with what?', tags:['zna','dom'], buff:{ heroThreatPct:0.5 }, tag:'The Abyss tightens the leash' },
        { text:'→ Stay silent. Not yet', tags:['vyj','per'], buff:{ lordDmg:2 }, tag:'Obedience rewarded' },
      ] },

    { id:'act3_diary', trigger:'wave_start', minLevel:26, maxLevel:32, minRound:1, weight:3, story:true,
      badge:'DISCOVERY', title:'A Stranger\'s Diary',
      text:'In the temple ruins: a diary, five centuries old. The handwriting is irritatingly familiar. The last entry: "If you read this and remember nothing — do not trust her." No signature. None needed.',
      choices:[
        { text:'→ Read on. To the last page', tags:['zna'], buff:{ heroThreatPct:0.5 }, tag:'A sleepless night of questions' },
        { text:'→ Burn it. Handwriting can look alike', tags:['vyj'], buff:{ lordDmg:2 }, tag:'Doubt crushed by force' },
        { text:'→ Hide it under the throne. For later', tags:['per','kha'], buff:{}, tag:'' },
      ] },

    { id:'act3_priestess', trigger:'wave_end', minLevel:28, maxLevel:35, minRound:2, weight:2, story:true,
      requires:{ id:'act2_burial', choice:0 },
      badge:'CAPTIVE', title:'The Priestess\' Offer',
      text:'An old priestess heard you bury enemies like people. She says: "I can show you one of your memories. Only one." The Abyss hisses in your skull: "Don\'t you dare. She lies." It hisses too loudly.',
      choices:[
        { text:'→ See the memory. Let her hiss', tags:['zna','kha'], buff:{ heroThreatPct:1 }, tag:'The Abyss punishes defiance' },
        { text:'→ Refuse. Not yet', tags:['vyj'], buff:{ lordDmg:2 }, tag:'The Abyss purrs, satisfied' },
        { text:'→ Execute her. No trust for witches', tags:['pom'], buff:{ soulBonus:2, heroThreatPct:0.5 }, tag:'The memory died with her' },
      ] },

    { id:'act3_symbol', trigger:'wave_start', minLevel:29, maxLevel:36, minRound:3, weight:2, story:true,
      badge:'VOICES OF THE DUNGEON', title:'Symbol on the Wall',
      text:'Someone drew half a seal on the throne room wall. You raise your hand to wipe it — and the hand completes the other half instead. Perfectly. From a memory you don\'t have.',
      choices:[
        { text:'→ Study the symbol. The hand knows', tags:['zna','per'], buff:{ heroThreatPct:0.5 }, tag:'The hand remembers more' },
        { text:'→ Wipe it. Double the guard', tags:['vyj'], buff:{ captainChance:-1 }, tag:'The hall under lock' },
        { text:'→ Draw more. Test the limit', tags:['kha','zna'], buff:{ lordDmg:3, heroThreatPct:1 }, tag:'Old power stirs' },
      ] },

    { id:'act3_archivist', trigger:'wave_start', minLevel:30, maxLevel:37, minRound:2, weight:3, story:true,
      badge:'PRISONER', title:'The Archivist Knows',
      text:'The captive archivist doesn\'t beg. He stares straight at you: "I know who you are, Varan. Fifty seals. Want me to tell you where the rest of the truth lies?" The Abyss stays silent. Too diligently.',
      choices:[
        { text:'→ Listen. Every word', tags:['zna'], buff:{ heroThreatPct:0.5 }, tag:'Truth heavier than armor' },
        { text:'→ Execute him mid-sentence', tags:['pom','vyj'], buff:{ soulBonus:2 }, tag:'The name buried with him' },
        { text:'→ Imprison him. Silence, for now', tags:['per'], buff:{}, tag:'' },
      ] },

    { id:'act3_archive', trigger:'wave_end', minLevel:31, maxLevel:38, minRound:1, weight:3, story:true,
      requires:{ id:'act3_archivist', choice:0 },
      badge:'WHISPER OF THE ABYSS', title:'The Archive Order',
      text:'He didn\'t lie: in the catacombs, an archive — your signature on every tome. For the first time the Abyss doesn\'t whisper, she commands: "Burn it. Now. It is poison." Her voice trembles. With rage, surely.',
      choices:[
        { text:'→ Obey. Let servants burn it', tags:['vyj','dom'], buff:{ lordDmg:3 }, tag:'Payment for obedience' },
        { text:'→ Hide the archive in the vault', tags:['kha','zna'], buff:{ heroThreatPct:1 }, tag:'The Abyss grows suspicious' },
        { text:'→ Burn it yourself. Reading slowly', tags:['zna','per'], buff:{ heroThreatPct:0.5, soulBonus:1 }, tag:'Ashes, but read' },
      ] },

    { id:'act4_pact', trigger:'wave_start', minLevel:39, maxLevel:46, minRound:1, weight:3, story:true,
      requires:{ id:'act2_ransom', choice:0 },
      badge:'ENVOY', title:'The Pact of Seals',
      text:'An envoy of the last cities, unguarded. "You took ransom for Vellas — so you can bargain. Spare the final seals, and we will tell you what it is you sealed away." The Abyss screams. For the first time.',
      choices:[
        { text:'→ Hear the terms to the end', tags:['zna','vyj'], buff:{ heroThreatPct:-1, eliteChance:-1 }, tag:'Swords lowered, for now' },
        { text:'→ Refuse. Pacts are for the weak', tags:['dom'], buff:{ lordDmg:4, heroThreatPct:1 }, tag:'War to the final seal' },
        { text:'→ Say nothing. Let the Abyss scream', tags:['kha','per'], buff:{}, tag:'' },
      ] },

    { id:'act4_merge', trigger:'wave_end', minLevel:41, maxLevel:48, minRound:2, weight:3, story:true,
      badge:'WHISPER OF THE ABYSS', title:'The Offer of Union',
      text:'"Become me," the Abyss whispers, and for the first time it sounds like begging. "No names, no Varan, no pain. One will. Ours." She is afraid. You hear it as clearly as you once heard her certainty.',
      choices:[
        { text:'→ Take the power. Names are a burden', tags:['dom','kha'], buff:{ lordDmg:6, heroThreatPct:2 }, tag:'The borders blur' },
        { text:'→ Refuse. The name stays mine', tags:['per','vyj'], buff:{ heroThreatPct:-1 }, tag:'Varan holds the line' },
        { text:'→ Ask her: what are you afraid of?', tags:['zna'], buff:{}, tag:'' },
      ] },

    { id:'act4_soldier', trigger:'wave_start', minLevel:42, maxLevel:49, minRound:2, weight:2, story:true,
      requires:{ id:'act1_census', choice:0 },
      badge:'VISITOR', title:'The Old Soldier',
      text:'A grey-haired man at the gate. You once released him from captivity — "fewer mouths". He lived those years, raised grandchildren, and came to ask one thing: "Was it worth it, Lord?" He carries no weapon.',
      choices:[
        { text:'→ Answer honestly: I don\'t know', tags:['zna','vyj'], buff:{ heroThreatPct:-0.5 }, tag:'Honesty ripples outward' },
        { text:'→ Turn him away. Lords don\'t answer', tags:['dom'], buff:{ soulBonus:1, heroThreatPct:0.5 }, tag:'The door shuts forever' },
        { text:'→ Invite him to the table. Let him talk', tags:['zna','per'], buff:{}, tag:'' },
      ] },

    { id:'act4_citadel', trigger:'wave_start', minLevel:46, maxLevel:50, minRound:1, weight:3, story:true,
      badge:'NIGHT BEFORE THE SIEGE', title:'The First Citadel',
      text:'Beyond the pass: the First Citadel, the last seal-city. You laid its cornerstone yourself. The Abyss is silent — everything has been said. All that remains is to decide who meets the morning.',
      choices:[
        { text:'→ As the weapon. Finish the job', tags:['dom','pom'], buff:{ lordDmg:6, heroThreatPct:1.5 }, tag:'The Abyss at the threshold' },
        { text:'→ As Varan. Memory against power', tags:['per','zna'], buff:{ heroThreatPct:-1.5, eliteChance:2 }, tag:'The seal knows its maker' },
        { text:'→ As something third. Neither theirs nor hers', tags:['kha'], buff:{ soulBonus:2, captainChance:2 }, tag:'No one knows the rules' },
      ] },

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

// ── 50 cities story data ──────────────────────────────────────────────────────
const _STORY_LEVELS = [
// Act I (1–12): Наказ
{city:'Попільне',act:1,beat:'Перший крок. Попіл ще теплий.',special:false},
{city:'Береговий Кряж',act:1,beat:'Місто без стін. Довіряли морю.',special:false},
{city:'Солонець',act:1,beat:'Сіль і кров. Схожа консистенція.',special:false},
{city:'Бурявець',act:1,beat:'Вони думали буря захистить. Ні.',special:false},
{city:'Мурований Яр',act:1,beat:'Гарні стіни. Погані монстри.',special:false},
{city:'Ржавець',act:1,beat:'Залізо іржавіє. Підземелля — ні.',special:false},
{city:'Чорнолісся',act:1,beat:'Ліс не зупинив. Ніщо не зупинить.',special:false},
{city:'Вовкогрів',act:1,beat:'Герой перед смертю: «Ти не знаєш що робиш.» Можливо.',special:true},
{city:'Кістяне Плоскогір\'я',act:1,beat:'Кістки були тут до нас. Стане більше.',special:false},
{city:'Залізний Брід',act:1,beat:'Десяте місто. Безодня задоволена. Я — нейтральний.',special:false},
{city:'Срібна Пуща',act:1,beat:'Срібло не допомагає проти монстрів. Тільки у казках.',special:false},
{city:'Димна Твердь',act:1,beat:'Перше справжнє місто. Вперше чув як воно кричало. Не зупинився.',special:false},
// Act II (13–25): Тріщини
{city:'Золоторіг',act:2,beat:'Золото. Тепер нікому не потрібне.',special:false},
{city:'Фортеця Тихого Ока',act:2,beat:'Вони називали себе нейтральними. Печатки нейтральних немає.',special:false},
{city:'Багряний Посад',act:2,beat:'Торговці. Думали можна купити мир.',special:false},
{city:'Залізні Зубці',act:2,beat:'Найбільш укріплене місто до цього рівня. Впало за хвилю.',special:false},
{city:'Вогняна Переправа',act:2,beat:'Вони спалили міст. Монстри плавають.',special:false},
{city:'Сталева Корона',act:2,beat:'Королівство з традиціями. Традиція закінчилась.',special:false},
{city:'Місяць-Камінь',act:2,beat:'Жерці молились. Безодня не молиться.',special:false},
{city:'Темна Орель',act:2,beat:'Двадцять міст. Лічення стає важким.',special:false},
{city:'Кривавий Поріг',act:2,beat:'Лицар Селена назвала тебе «Варан». Звідки вона знає це ім\'я?',special:true},
{city:'Осколок Неба',act:2,beat:'Безодня каже забути Селену. Чому вона хвилюється?',special:false},
{city:'Сонцева Цитадель',act:2,beat:'Найяскравіше місто. Тепер найтемніше.',special:false},
{city:'Вічний Порт',act:2,beat:'«Вічний» — перебільшення.',special:false},
{city:'Серце Степу',act:2,beat:'Половина шляху. Безодня мовчить на питання «навіщо». Вперше.',special:true},
// Act III (26–38): Розлам
{city:'Зоряний Маяк',act:3,beat:'Символи на стінах — невідомі. Але рука сама відтворює їх.',special:false},
{city:'Плач Гір',act:3,beat:'Гори пам\'ятають більше ніж люди.',special:false},
{city:'Сплячий Гігант',act:3,beat:'Якась частина тебе теж спала. Прокидається.',special:false},
{city:'Схованка Дракона',act:3,beat:'Дракон захищав місто 300 років. Назвав тебе «братом».',special:false},
{city:'Брама Тіней',act:3,beat:'Рукопис. Твій підпис. 500 років тому. Безодня замовчала.',special:true},
{city:'Перекип Безодні',act:3,beat:'Це місто збудували НАД входом у Безодню. Хто знав?',special:false},
{city:'Осінній Трон',act:3,beat:'Король знав твоє минуле. Помер не сказавши все.',special:false},
{city:'Крижане Горло',act:3,beat:'Жрець кричав: «Ти будуєш пастку для всього сущого!» Безодня: «Він бреше.»',special:false},
{city:'Рубіновий Шлях',act:3,beat:'Дорога веде кудись. Ти починаєш підозрювати — куди.',special:false},
{city:'Залишок Первісного',act:3,beat:'Тут спало щось давніше. Тепер прокинулось.',special:false},
{city:'Переддвер\'я',act:3,beat:'Чотири міста до правди. Безодня стає настирливою.',special:false},
{city:'Дзеркальне Болото',act:3,beat:'Побачив відображення. Не своє.',special:false},
{city:'Забута Столиця',act:3,beat:'Я будував ці стіни. П\'ятсот років тому. Тепер руйную. Безодня мовчить від страху.',special:true},
// Act IV (39–50): Вибір
{city:'Перша Печать',act:4,beat:'Безодня: «Лише 11 залишилось.» Я: «Навіщо?» Безодня: «Щоб усе закінчилось.»',special:false},
{city:'Кривавий Договір',act:4,beat:'Договір підписано давно. Я не пам\'ятаю коли.',special:false},
{city:'Попіл Богів',act:4,beat:'Боги теж мали свій план. Теж помилилися.',special:false},
{city:'Зламана Присяга',act:4,beat:'Чия присяга? Моя. Дана собі. 500 років тому.',special:false},
{city:'Порожнеча Між',act:4,beat:'Між двома виборами — є третій. Я його ще не бачу.',special:false},
{city:'Остання Надія',act:4,beat:'Герой Андрій прийшов говорити, не воювати. Я вибираю.',special:true},
{city:'Нічна Корона',act:4,beat:'П\'ять міст. Безодня відчуває мої сумніви. Злиться.',special:false},
{city:'Серце Печаті',act:4,beat:'Тут б\'ється щось. Не місто — я. Частина мене.',special:false},
{city:'Безмовне Небо',act:4,beat:'Небо справді замовкло. Навіть вітер не сміє.',special:false},
{city:'Вічна Тиша',act:4,beat:'Безодня: «Зупинись. Стань частиною мене.» Перша пряма пропозиція.',special:false},
{city:'Кінець Карти',act:4,beat:'Безодня: «Одне місто і все закінчиться.» Я: «Що — все?» Мовчить. Але я вже знаю.',special:true},
{city:'Перша Цитадель',act:4,beat:'Місто де народився Варан. Місто де народився я.',special:true},
];

const _STORY_LEVELS_EN = [
// Act I (1–12): The Command
{city:'Ashfields',act:1,beat:'First step. The ash is still warm.',special:false},
{city:'Coastal Ridge',act:1,beat:'A city with no walls. They trusted the sea.',special:false},
{city:'Saltmarsh',act:1,beat:'Salt and blood. Similar consistency.',special:false},
{city:'Stormhaven',act:1,beat:'They thought the storm would protect them. No.',special:false},
{city:'Stonevale',act:1,beat:'Nice walls. Bad monsters.',special:false},
{city:'Rustpeak',act:1,beat:'Iron rusts. The dungeon doesn\'t.',special:false},
{city:'Blackwood',act:1,beat:'The forest didn\'t stop them. Nothing will.',special:false},
{city:'Wolfgrave',act:1,beat:'A hero shouted before dying: «You don\'t know what you\'re doing.» Perhaps.',special:true},
{city:'Boneflat',act:1,beat:'There were bones here before us. There will be more.',special:false},
{city:'Iron Ford',act:1,beat:'The tenth city. The Abyss is satisfied. I am neutral.',special:false},
{city:'Silver Thicket',act:1,beat:'Silver doesn\'t help against monsters. Only in fairy tales.',special:false},
{city:'Smokehold',act:1,beat:'The first real city. I heard it scream. Didn\'t stop.',special:false},
// Act II (13–25): Cracks
{city:'Goldhorn',act:2,beat:'Gold. Useless now.',special:false},
{city:'Fort Stillwatch',act:2,beat:'They called themselves neutral. There\'s no seal for the neutral.',special:false},
{city:'Crimson Quarter',act:2,beat:'Merchants. They thought peace could be purchased.',special:false},
{city:'Iron Fangs',act:2,beat:'Most fortified city so far. Fell in one wave.',special:false},
{city:'Fireford',act:2,beat:'They burned the bridge. Monsters swim.',special:false},
{city:'Steel Crown',act:2,beat:'A kingdom with traditions. The tradition ended.',special:false},
{city:'Moonstone',act:2,beat:'Priests prayed. The Abyss doesn\'t pray.',special:false},
{city:'Dark Eagle',act:2,beat:'Twenty cities. Counting becomes hard.',special:false},
{city:'Bloodthreshold',act:2,beat:'Knight Selena called me «Varan». Where does she know that name?',special:true},
{city:'Sky Shard',act:2,beat:'The Abyss says to forget Selena. Why does it care?',special:false},
{city:'Sun Citadel',act:2,beat:'Brightest city. Now the darkest.',special:false},
{city:'Eternal Port',act:2,beat:'«Eternal» is an overstatement.',special:false},
{city:'Heart of the Steppe',act:2,beat:'Halfway. The Abyss stays silent when I ask why. For the first time.',special:true},
// Act III (26–38): Fracture
{city:'Star Beacon',act:3,beat:'Unknown symbols on the walls. But my hand traces them by itself.',special:false},
{city:'Mountain Lament',act:3,beat:'Mountains remember more than people.',special:false},
{city:'Sleeping Giant',act:3,beat:'Part of me was sleeping too. It\'s waking.',special:false},
{city:'Dragon\'s Cache',act:3,beat:'The dragon guarded this city 300 years. Called me «brother».',special:false},
{city:'Shadow Gate',act:3,beat:'A manuscript. My signature. 500 years ago. The Abyss fell silent.',special:true},
{city:'Abyss Overflow',act:3,beat:'This city was built ABOVE the entrance to the Abyss. Who knew?',special:false},
{city:'Autumn Throne',act:3,beat:'The king knew my past. Died without saying everything.',special:false},
{city:'Ice Throat',act:3,beat:'A priest screamed: «You\'re building a trap for all existence!» The Abyss: «He lies.»',special:false},
{city:'Ruby Path',act:3,beat:'The road leads somewhere. I\'m beginning to suspect — where.',special:false},
{city:'Ancient Remnant',act:3,beat:'Something ancient slept here. Now it\'s awake.',special:false},
{city:'The Threshold',act:3,beat:'Four cities to the truth. The Abyss grows insistent.',special:false},
{city:'Mirror Marsh',act:3,beat:'Saw a reflection. Not mine.',special:false},
{city:'The Forgotten Capital',act:3,beat:'I built these walls. Five hundred years ago. Now I\'m tearing them down. The Abyss falls silent from fear.',special:true},
// Act IV (39–50): Choice
{city:'First Seal',act:4,beat:'The Abyss: «Only 11 left.» Me: «What for?» The Abyss: «For everything to end.»',special:false},
{city:'Bloody Pact',act:4,beat:'The pact was signed long ago. I don\'t remember when.',special:false},
{city:'Ash of Gods',act:4,beat:'The gods had their plan too. They were wrong too.',special:false},
{city:'Broken Oath',act:4,beat:'Whose oath? Mine. Made to myself. Five hundred years ago.',special:false},
{city:'The Void Between',act:4,beat:'Between two choices — there\'s always a third. I don\'t see it yet.',special:false},
{city:'Last Hope',act:4,beat:'Hero Andrii came to talk, not fight. I choose.',special:true},
{city:'Night Crown',act:4,beat:'Five cities. The Abyss feels my doubt. It\'s angry.',special:false},
{city:'Heart of the Seal',act:4,beat:'Something beats here. Not the city — me. Part of me.',special:false},
{city:'Silent Sky',act:4,beat:'The sky truly fell silent. Even the wind doesn\'t dare.',special:false},
{city:'Eternal Silence',act:4,beat:'The Abyss: «Stop. Become part of me.» The first direct offer.',special:false},
{city:'Edge of the Map',act:4,beat:'The Abyss: «One city and everything ends.» Me: «What — everything?» Silence. But I already know.',special:true},
{city:'The First Citadel',act:4,beat:'The city where Varan was born. The city where I was born.',special:true},
];

// ── Level 50 narrative endings (6 × stratKey) ─────────────────────────────────
const _STORY_ENDINGS_L50 = {
    syla:      'Ти взяв усе. Безодня мертва — бо стала тобою. Ти перший. Ти останній. Ти — усе. І це тихіше ніж ти думав.',
    lehion:    'Твоя армія стала новим порядком. Ти не завоював світ — ти ним замінив. Десь у глибині Варан пам\'ятає як це називалось. Самотність.',
    fortress:  'Ти не вийшов. Світ прийшов до тебе і впав. Підземелля стоїть. Може це і було метою — просто стояти.',
    trap:      'Кожен ворог пішов туди куди ти хотів. Навіть Безодня. Особливо Безодня. Ти єдиний хто знає що справді сталось.',
    rivnovaha: 'Ти знайшов те що шукав 500 років — не перемогу. Рівновагу між тим хто ти був і тим ким став. Варан і Лорд. Одне ціле.',
    skarb:     'Ти зберіг усе. Не витратив. Печатки не зламані — лише ти знаєш де вони. Безодня чекає. Ти теж чекаєш. Вічність — добре слово для цього.',
};

const _STORY_ENDINGS_L50_EN = {
    syla:      'You took everything. The Abyss is dead — because it became you. You are first. You are last. You are all. It\'s quieter than you expected.',
    lehion:    'Your army became the new order. You didn\'t conquer the world — you replaced it. Somewhere deep inside, Varan remembers what this was called. Loneliness.',
    fortress:  'You didn\'t leave. The world came to you and fell. The dungeon stands. Perhaps that was the goal all along — to simply stand.',
    trap:      'Every enemy went exactly where you wanted. Even the Abyss. Especially the Abyss. You\'re the only one who knows what truly happened.',
    rivnovaha: 'You found what you sought for 500 years — not victory. Balance between who you were and who you became. Varan and the Lord. One whole.',
    skarb:     'You kept everything. Spent nothing. The seals aren\'t broken — only you know where they are. The Abyss waits. You wait too. Eternity is a good word for this.',
};

// ── Getters for language-sensitive arrays ─────────────────────────────────────
function _getDecisionEvents() {
    return (_lang === 'en') ? _DECISION_EVENTS_EN : _DECISION_EVENTS;
}

function _getPsyDesc() {
    return (_lang === 'en') ? _PSY_DESC_EN : _PSY_DESC;
}

function _getStoryLevels()     { return (_lang === 'en') ? _STORY_LEVELS_EN     : _STORY_LEVELS; }
function _getStoryEndingsL50() { return (_lang === 'en') ? _STORY_ENDINGS_L50_EN : _STORY_ENDINGS_L50; }
