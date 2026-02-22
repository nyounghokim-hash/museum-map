import * as fs from 'fs';

let content = fs.readFileSync('src/lib/i18n.ts', 'utf-8');

// Add to TranslationKeys
content = content.replace(
    /'plans\.saveError': string;/,
    `'plans.saveError': string;\n    'plans.createFromMyPick': string;\n    'plans.goToMyPick': string;`
);

// Add to all languages
const emptyDescRegex = /'plans\.emptyDesc':\n?(.+),/g;
content = content.replace(emptyDescRegex, (match, p1) => {
    return `'plans.emptyDesc': ${p1},\n        'plans.createFromMyPick': 'plans.createFromMyPick',\n        'plans.goToMyPick': 'plans.goToMyPick',`;
});

// Fix English specific
content = content.replace(
    /'plans\.emptyDesc': 'Save museums from the map, then create an AutoRoute plan!',\n        'plans\.createFromMyPick': 'plans\.createFromMyPick',\n        'plans\.goToMyPick': 'plans\.goToMyPick',/,
    `'plans.emptyDesc': 'Save museums from the map, then create an AutoRoute plan!',\n        'plans.createFromMyPick': 'New plans can be created from the "My Pick" menu.',\n        'plans.goToMyPick': 'Go to My Pick →',`
);

// Fix Korean specific
content = content.replace(
    /'plans\.emptyDesc': '지도에서 박물관을 저장하고 오토루트 일정을 만들어보세요!',\n        'plans\.createFromMyPick': 'plans\.createFromMyPick',\n        'plans\.goToMyPick': 'plans\.goToMyPick',/,
    `'plans.emptyDesc': '지도에서 박물관을 저장하고 오토루트 일정을 만들어보세요!',\n        'plans.createFromMyPick': '새로운 여행은 "마이 픽" 메뉴에서 생성할 수 있습니다.',\n        'plans.goToMyPick': '마이 픽 가기 →',`
);

fs.writeFileSync('src/lib/i18n.ts', content);
console.log("i18n.ts updated");
