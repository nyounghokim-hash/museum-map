const fs = require('fs');

let content = fs.readFileSync('src/lib/i18n.ts', 'utf-8');

// Add to TranslationKeys
content = content.replace(
    /'plans.saveError': string;/,
    `'plans.saveError': string;\n    'plans.createFromMyPick': string;\n    'plans.goToMyPick': string;`
);

// Add to en
content = content.replace(
    /'plans.emptyDesc': 'Save museums from the map, then create an AutoRoute plan!',/,
    `'plans.emptyDesc': 'Save museums from the map, then create an AutoRoute plan!',\n        'plans.createFromMyPick': 'New plans can be created from the "My Pick" menu.',\n        'plans.goToMyPick': 'Go to My Pick →',`
);

// Add to ko
content = content.replace(
    /'plans.emptyDesc': '지도에서 박물관을 저장하고 오토루트 일정을 만들어보세요!',/,
    `'plans.emptyDesc': '지도에서 박물관을 저장하고 오토루트 일정을 만들어보세요!',\n        'plans.createFromMyPick': '새로운 여행은 "마이 픽" 메뉴에서 생성할 수 있습니다.',\n        'plans.goToMyPick': '마이 픽 가기 →',`
);

// Add to others globally via regex on 'plans.emptyDesc'
// Except en and ko which we already did? Oh wait, en and ko will be replaced if we do a global replace carefully, or if we ensure they aren't double-replaced.
// Let's just do a blanket replace for all other languages that have 'plans.emptyDesc'

const emptyDescMatches = [...content.matchAll(/'plans\.emptyDesc':\n?(.+),/g)];

for (const match of emptyDescMatches) {
    if (!content.includes("'plans.createFromMyPick'")) continue; // We need to be careful.
}

fs.writeFileSync('src/lib/i18n.ts', content);
