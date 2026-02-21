const fs = require('fs');
const file = './src/lib/i18n.ts';
let content = fs.readFileSync(file, 'utf8');

// Insert new keys into TranslationKeys interface
content = content.replace(
    "'plans.tripStarted': string;",
    "'plans.tripStarted': string;\n    'plans.confirmEndTrip': string;\n    'plans.tripEnded': string;\n    'plans.endTrip': string;"
);

// Map of translations to add
const newKeys = {
    en: {
        'plans.confirmEndTrip': 'Are you sure you want to end this trip?',
        'plans.tripEnded': 'Trip has ended.',
        'plans.endTrip': 'End Trip'
    },
    ko: {
        'plans.confirmEndTrip': '정말로 투어를 종료하시겠습니까?',
        'plans.tripEnded': '투어가 종료되었습니다.',
        'plans.endTrip': '투어 종료'
    },
    ja: {
        'plans.confirmEndTrip': '旅行を終了してもよろしいですか？',
        'plans.tripEnded': '旅行が終了しました。',
        'plans.endTrip': '旅行を終了'
    },
    de: {
        'plans.confirmEndTrip': 'Möchten Sie diese Reise wirklich beenden?',
        'plans.tripEnded': 'Die Reise wurde beendet.',
        'plans.endTrip': 'Reise beenden'
    },
    fr: {
        'plans.confirmEndTrip': 'Voulez-vous vraiment terminer ce voyage ?',
        'plans.tripEnded': 'Le voyage est terminé.',
        'plans.endTrip': 'Terminer le voyage'
    },
    es: {
        'plans.confirmEndTrip': '¿Seguro que quieres finalizar este viaje?',
        'plans.tripEnded': 'El viaje ha terminado.',
        'plans.endTrip': 'Finalizar Viaje'
    },
    pt: {
        'plans.confirmEndTrip': 'Tem certeza que deseja encerrar esta viagem?',
        'plans.tripEnded': 'A viagem terminou.',
        'plans.endTrip': 'Encerrar Viagem'
    },
    'zh-CN': {
        'plans.confirmEndTrip': '您确定要结束这次旅行吗？',
        'plans.tripEnded': '旅行已结束。',
        'plans.endTrip': '结束旅行'
    },
    'zh-TW': {
        'plans.confirmEndTrip': '您確定要結束這次旅行嗎？',
        'plans.tripEnded': '旅行已結束。',
        'plans.endTrip': '結束旅行'
    }
};

for (const lang of Object.keys(newKeys)) {
    const section = newKeys[lang];
    const injectStr = Object.entries(section).map(([k, v]) => `        '${k}': '${v.replace(/'/g, "\\'")}',`).join('\n');
    
    // Find where the locale block has "plans.tripStarted" and insert right after
    const regex = new RegExp(`'plans\\.tripStarted': '[^']*',`);
    content = content.replace(regex, (match) => `${match}\n${injectStr}`);
}

fs.writeFileSync(file, content);
console.log('Done mapping EndTrip keys.');
