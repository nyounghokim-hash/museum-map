const fs = require('fs');
const file = './src/lib/i18n.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    "'collections.newCollection': string;",
    "'collections.newCollection': string;\n    'collections.share': string;\n    'collections.shareSuccess': string;\n    'collections.planTrip': string;\n    'collections.autoRouteDesc': string;\n    'collections.generateAutoRoute': string;\n    'collections.curatedBy': string;"
);

const newKeys = {
    en: {
        'collections.share': 'Share Collection',
        'collections.shareSuccess': 'Collection link copied to clipboard!',
        'collections.planTrip': 'Planning a Trip?',
        'collections.autoRouteDesc': 'Create an optimized travel route (AutoRoute) for the museums in this list.',
        'collections.generateAutoRoute': 'Generate AutoRoute',
        'collections.curatedBy': 'Curated by'
    },
    ko: {
        'collections.share': '컬렉션 공유하기',
        'collections.shareSuccess': '컬렉션 링크가 클립보드에 복사되었습니다!',
        'collections.planTrip': '여행을 계획 중이신가요?',
        'collections.autoRouteDesc': '이 목록의 미술관들을 위한 최적화된 여행 경로(AutoRoute)를 만듭니다.',
        'collections.generateAutoRoute': 'AutoRoute 생성하기',
        'collections.curatedBy': '큐레이터'
    },
    ja: {
        'collections.share': 'コレクションを共有',
        'collections.shareSuccess': 'リンクをクリップボードにコピーしました！',
        'collections.planTrip': '旅行を計画中ですか？',
        'collections.autoRouteDesc': 'このリストの美術館のための最適な旅行ルート（AutoRoute）を作成します。',
        'collections.generateAutoRoute': 'AutoRouteを生成',
        'collections.curatedBy': 'キュレーター'
    },
    de: {
        'collections.share': 'Sammlung teilen',
        'collections.shareSuccess': 'Link in die Zwischenablage kopiert!',
        'collections.planTrip': 'Planen Sie eine Reise?',
        'collections.autoRouteDesc': 'Erstellen Sie eine optimierte Reiseroute (AutoRoute) für diese Liste.',
        'collections.generateAutoRoute': 'AutoRoute generieren',
        'collections.curatedBy': 'Kuratiert von'
    },
    fr: {
        'collections.share': 'Partager la collection',
        'collections.shareSuccess': 'Lien copié dans le presse-papiers!',
        'collections.planTrip': 'Vous planifiez un voyage ?',
        'collections.autoRouteDesc': 'Créez un itinéraire de voyage optimisé (AutoRoute) pour cette liste.',
        'collections.generateAutoRoute': 'Générer AutoRoute',
        'collections.curatedBy': 'Sélectionné par'
    },
    es: {
        'collections.share': 'Compartir Colección',
        'collections.shareSuccess': '¡Enlace copiado al portapapeles!',
        'collections.planTrip': '¿Planeando un viaje?',
        'collections.autoRouteDesc': 'Crea una ruta de viaje optimizada (AutoRoute) para esta lista.',
        'collections.generateAutoRoute': 'Generar AutoRoute',
        'collections.curatedBy': 'Curado por'
    },
    pt: {
        'collections.share': 'Compartilhar Coleção',
        'collections.shareSuccess': 'Link copiado para a área de transferência!',
        'collections.planTrip': 'Planejando uma viagem?',
        'collections.autoRouteDesc': 'Crie uma rota de viagem otimizada (AutoRoute) para esta lista.',
        'collections.generateAutoRoute': 'Gerar AutoRoute',
        'collections.curatedBy': 'Curadoria de'
    },
    'zh-CN': {
        'collections.share': '分享收藏夹',
        'collections.shareSuccess': '链接已复制到剪贴板！',
        'collections.planTrip': '正在计划旅行？',
        'collections.autoRouteDesc': '为该列表中的博物馆创建优化的旅行路线（AutoRoute）。',
        'collections.generateAutoRoute': '生成 AutoRoute',
        'collections.curatedBy': '策展人'
    },
    'zh-TW': {
        'collections.share': '分享收藏夾',
        'collections.shareSuccess': '連結已複製到剪貼簿！',
        'collections.planTrip': '正在計畫旅行？',
        'collections.autoRouteDesc': '為該列表中的博物館建立最佳化的旅行路線（AutoRoute）。',
        'collections.generateAutoRoute': '生成 AutoRoute',
        'collections.curatedBy': '策展人'
    }
};

for (const lang of Object.keys(newKeys)) {
    const section = newKeys[lang];
    const injectStr = Object.entries(section).map(([k, v]) => `        '${k}': '${v.replace(/'/g, "\\'")}',`).join('\n');
    
    const regex = new RegExp(`'collections\\.newCollection': '[^']*',`);
    content = content.replace(regex, (match) => `${match}\n${injectStr}`);
}

fs.writeFileSync(file, content);
console.log('Done mapping collection detail keys.');
