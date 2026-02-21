const fs = require('fs');
const file = './src/lib/i18n.ts';
let content = fs.readFileSync(file, 'utf8');

// Insert new keys into TranslationKeys interface
content = content.replace(
    "'plans.viewActiveRoute': string;",
    "'plans.viewActiveRoute': string;\n    'plans.reviewAutoRoute': string;\n    'plans.reviewAutoRouteDesc': string;\n    'plans.tripTitle': string;\n    'plans.tripTitlePlaceholder': string;\n    'plans.startingDate': string;\n    'plans.confirmSave': string;\n    'plans.saving': string;\n    'plans.routeItinerary': string;\n    'plans.generating': string;\n    'plans.est': string;\n    'plans.noStops': string;\n    'plans.dragReorder': string;\n    'plans.saveButton': string;\n    'plans.startTripButton': string;\n    'plans.noRouteData': string;"
);

// Map of translations to add
const newKeys = {
    en: {
        'plans.reviewAutoRoute': 'Review AutoRoute',
        'plans.reviewAutoRouteDesc': "We've sorted your selected museums geographically. Give your plan a name and date.",
        'plans.tripTitle': 'Trip Title',
        'plans.tripTitlePlaceholder': 'e.g. My Paris Art Tour',
        'plans.startingDate': 'Starting Date',
        'plans.confirmSave': 'Confirm & Save Plan',
        'plans.saving': 'Saving...',
        'plans.routeItinerary': 'Route Itinerary',
        'plans.generating': 'Generating optimally organized route...',
        'plans.est': 'Est.',
        'plans.noStops': 'No stops in this plan.',
        'plans.dragReorder': 'Drag to reorder → tap to place',
        'plans.saveButton': '💾 Save',
        'plans.startTripButton': '🚀 Start Trip',
        'plans.noRouteData': 'No route data available'
    },
    ko: {
        'plans.reviewAutoRoute': '추천 경로 확인',
        'plans.reviewAutoRouteDesc': '선택하신 미술관들을 지리적으로 정렬했습니다. 여행 이름과 날짜를 지정해주세요.',
        'plans.tripTitle': '여행 제목',
        'plans.tripTitlePlaceholder': '예: 파리 아트 투어',
        'plans.startingDate': '출발일',
        'plans.confirmSave': '확인 및 저장',
        'plans.saving': '저장 중...',
        'plans.routeItinerary': '여행 일정',
        'plans.generating': '최적의 경로를 생성하는 중...',
        'plans.est': '예상',
        'plans.noStops': '추가된 정류장이 없습니다.',
        'plans.dragReorder': '드래그하여 순서 변경 → 탭하여 배치',
        'plans.saveButton': '💾 저장하기',
        'plans.startTripButton': '🚀 여행 시작하기',
        'plans.noRouteData': '경로 정보가 없습니다'
    },
    ja: {
        'plans.reviewAutoRoute': 'おすすめルートの確認',
        'plans.reviewAutoRouteDesc': '選択した美術館を地理的に並べ替えました。旅行の名前と日付を指定してください。',
        'plans.tripTitle': '旅行タイトル',
        'plans.tripTitlePlaceholder': '例：パリの美術ツアー',
        'plans.startingDate': '出発日',
        'plans.confirmSave': '確認して保存',
        'plans.saving': '保存中...',
        'plans.routeItinerary': '旅行日程',
        'plans.generating': '最適なルートを作成中...',
        'plans.est': '予想',
        'plans.noStops': '追加されたストップはありません。',
        'plans.dragReorder': 'ドラッグして順序を変更 → タップして配置',
        'plans.saveButton': '💾 保存',
        'plans.startTripButton': '🚀 旅行を開始',
        'plans.noRouteData': 'ルート情報がありません'
    },
    de: {
        'plans.reviewAutoRoute': 'AutoRoute überprüfen',
        'plans.reviewAutoRouteDesc': 'Museen sortiert. Name und Datum eingeben.',
        'plans.tripTitle': 'Reisetitel',
        'plans.tripTitlePlaceholder': 'z.B. Paris Kunsttour',
        'plans.startingDate': 'Startdatum',
        'plans.confirmSave': 'Plan speichern',
        'plans.saving': 'Speichern...',
        'plans.routeItinerary': 'Reiseroute',
        'plans.generating': 'Route wird generiert...',
        'plans.est': 'Vorauss.',
        'plans.noStops': 'Keine Stopps.',
        'plans.dragReorder': 'Ziehen zum Sortieren',
        'plans.saveButton': '💾 Speichern',
        'plans.startTripButton': '🚀 Reise starten',
        'plans.noRouteData': 'Keine Route verfügbar'
    },
    fr: {
        'plans.reviewAutoRoute': 'Aperçu AutoRoute',
        'plans.reviewAutoRouteDesc': 'Musées triés géographiquement. Entrez nom et date.',
        'plans.tripTitle': 'Titre du voyage',
        'plans.tripTitlePlaceholder': 'ex: Visite d\'art à Paris',
        'plans.startingDate': 'Date de départ',
        'plans.confirmSave': 'Confirmer & Sauvegarder',
        'plans.saving': 'Sauvegarde...',
        'plans.routeItinerary': 'Itinéraire',
        'plans.generating': 'Génération...',
        'plans.est': 'Est.',
        'plans.noStops': 'Aucun arrêt.',
        'plans.dragReorder': 'Glissez pour réorganiser',
        'plans.saveButton': '💾 Sauvegarder',
        'plans.startTripButton': '🚀 Commencer',
        'plans.noRouteData': 'Aucun itinéraire'
    },
    es: {
        'plans.reviewAutoRoute': 'Revisar AutoRuta',
        'plans.reviewAutoRouteDesc': 'Museos ordenados. Introduce título y fecha.',
        'plans.tripTitle': 'Título del viaje',
        'plans.tripTitlePlaceholder': 'ej. Tour de arte París',
        'plans.startingDate': 'Fecha de inicio',
        'plans.confirmSave': 'Guardar Plan',
        'plans.saving': 'Guardando...',
        'plans.routeItinerary': 'Itinerario',
        'plans.generating': 'Generando ruta...',
        'plans.est': 'Est.',
        'plans.noStops': 'Sin paradas.',
        'plans.dragReorder': 'Arrastrar para reordenar',
        'plans.saveButton': '💾 Guardar',
        'plans.startTripButton': '🚀 Iniciar Viaje',
        'plans.noRouteData': 'Sin datos de ruta'
    },
    pt: {
        'plans.reviewAutoRoute': 'Revisar AutoRota',
        'plans.reviewAutoRouteDesc': 'Museus ordenados. Insira título e data.',
        'plans.tripTitle': 'Título da viagem',
        'plans.tripTitlePlaceholder': 'ex. Tour de Arte em Paris',
        'plans.startingDate': 'Data de início',
        'plans.confirmSave': 'Salvar Plano',
        'plans.saving': 'Salvando...',
        'plans.routeItinerary': 'Itinerário',
        'plans.generating': 'Gerando rota...',
        'plans.est': 'Est.',
        'plans.noStops': 'Sem paradas.',
        'plans.dragReorder': 'Arraste para reordenar',
        'plans.saveButton': '💾 Salvar',
        'plans.startTripButton': '🚀 Iniciar Viagem',
        'plans.noRouteData': 'Sem dados de rota'
    },
    'zh-CN': {
        'plans.reviewAutoRoute': '查看自动路线',
        'plans.reviewAutoRouteDesc': '博物馆已按地理位置排序。请输入旅行标题和日期。',
        'plans.tripTitle': '旅行标题',
        'plans.tripTitlePlaceholder': '例：巴黎艺术之旅',
        'plans.startingDate': '出发日期',
        'plans.confirmSave': '确认并保存',
        'plans.saving': '保存中...',
        'plans.routeItinerary': '行程',
        'plans.generating': '生成路线中...',
        'plans.est': '预计',
        'plans.noStops': '没有站。',
        'plans.dragReorder': '拖动排序',
        'plans.saveButton': '💾 保存',
        'plans.startTripButton': '🚀 开始旅行',
        'plans.noRouteData': '无路线数据'
    },
    'zh-TW': {
        'plans.reviewAutoRoute': '查看自動路線',
        'plans.reviewAutoRouteDesc': '博物館已按地理位置排序。請輸入旅行標題和日期。',
        'plans.tripTitle': '旅行標題',
        'plans.tripTitlePlaceholder': '例：巴黎藝術之旅',
        'plans.startingDate': '出發日',
        'plans.confirmSave': '確認並儲存',
        'plans.saving': '儲存中...',
        'plans.routeItinerary': '行程',
        'plans.generating': '生成路線中...',
        'plans.est': '預計',
        'plans.noStops': '沒有站。',
        'plans.dragReorder': '拖曳排序',
        'plans.saveButton': '💾 儲存',
        'plans.startTripButton': '🚀 開始旅行',
        'plans.noRouteData': '無路線資料'
    }
};

for (const lang of Object.keys(newKeys)) {
    const section = newKeys[lang];
    const injectStr = Object.entries(section).map(([k, v]) => `        '${k}': '${v.replace(/'/g, "\\'")}',`).join('\n');
    
    // Find where the locale block has "plans.viewActiveRoute"
    const regex = new RegExp(`'plans\\.viewActiveRoute': '[^']*',`);
    content = content.replace(regex, (match) => `${match}\n${injectStr}`);
}

fs.writeFileSync(file, content);
console.log('Done mapping keys.');
