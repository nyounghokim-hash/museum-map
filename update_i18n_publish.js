const fs = require('fs');
const file = './src/lib/i18n.ts';
let content = fs.readFileSync(file, 'utf8');

// Insert new keys into TranslationKeys interface
content = content.replace(
    "'collections.curatedBy': string;",
    "'collections.curatedBy': string;\n    'collections.publishCollection': string;\n    'collections.collectionPublished': string;"
);

// Map of translations to add
const newKeys = {
    en: {
        'collections.publishCollection': 'Publish Collection',
        'collections.collectionPublished': 'Collection Published!'
    },
    ko: {
        'collections.publishCollection': '컬렉션 발행하기',
        'collections.collectionPublished': '컬렉션이 성공적으로 발행되었습니다!'
    },
    ja: {
        'collections.publishCollection': 'コレクションを公開する',
        'collections.collectionPublished': 'コレクションが公開されました！'
    },
    de: {
        'collections.publishCollection': 'Sammlung veröffentlichen',
        'collections.collectionPublished': 'Sammlung veröffentlicht!'
    },
    fr: {
        'collections.publishCollection': 'Publier la collection',
        'collections.collectionPublished': 'Collection publiée !'
    },
    es: {
        'collections.publishCollection': 'Publicar Colección',
        'collections.collectionPublished': '¡Colección publicada!'
    },
    pt: {
        'collections.publishCollection': 'Publicar Coleção',
        'collections.collectionPublished': 'Coleção publicada!'
    },
    'zh-CN': {
        'collections.publishCollection': '发布收藏夹',
        'collections.collectionPublished': '收藏夹已发布！'
    },
    'zh-TW': {
        'collections.publishCollection': '發佈收藏夾',
        'collections.collectionPublished': '收藏夾已發佈！'
    }
};

for (const lang of Object.keys(newKeys)) {
    const section = newKeys[lang];
    const injectStr = Object.entries(section).map(([k, v]) => `        '${k}': '${v.replace(/'/g, "\\'")}',`).join('\n');
    
    // Find where the locale block has "collections.curatedBy" and insert right after
    const regex = new RegExp(`'collections\\.curatedBy': '[^']*',`);
    content = content.replace(regex, (match) => `${match}\n${injectStr}`);
}

fs.writeFileSync(file, content);
console.log('Done mapping Publish keys.');
