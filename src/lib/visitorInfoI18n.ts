/**
 * visitorInfo 다국어 번역 유틸
 * DB에 한국어로 저장된 라벨/값을 13개 locale로 번역
 */

// ── Label translations (입장료, 운영시간, 위치, 교통, 관람시간) ──
const LABEL_MAP: Record<string, Record<string, string>> = {
    '입장료': { en: 'Admission', ja: '入場料', de: 'Eintritt', fr: 'Tarif', es: 'Entrada', pt: 'Ingresso', 'zh-CN': '门票', 'zh-TW': '門票', da: 'Entré', fi: 'Sisäänpääsy', sv: 'Entré', et: 'Piletihind' },
    '운영시간': { en: 'Hours', ja: '開館時間', de: 'Öffnungszeiten', fr: 'Horaires', es: 'Horario', pt: 'Horário', 'zh-CN': '开放时间', 'zh-TW': '開放時間', da: 'Åbningstider', fi: 'Aukioloajat', sv: 'Öppettider', et: 'Lahtiolekud' },
    '위치': { en: 'Location', ja: '所在地', de: 'Standort', fr: 'Adresse', es: 'Ubicación', pt: 'Localização', 'zh-CN': '位置', 'zh-TW': '位置', da: 'Beliggenhed', fi: 'Sijainti', sv: 'Plats', et: 'Asukoht' },
    '교통': { en: 'Getting There', ja: 'アクセス', de: 'Anfahrt', fr: 'Accès', es: 'Cómo llegar', pt: 'Como chegar', 'zh-CN': '交通', 'zh-TW': '交通', da: 'Transport', fi: 'Kulkuyhteydet', sv: 'Transport', et: 'Transport' },
    '관람시간': { en: 'Estimated Visit', ja: '所要時間', de: 'Besuchsdauer', fr: 'Durée de visite', es: 'Duración', pt: 'Duração da visita', 'zh-CN': '参观时长', 'zh-TW': '參觀時長', da: 'Besøgstid', fi: 'Vierailuaika', sv: 'Besökstid', et: 'Külastusaeg' },
    '가는 길': { en: 'Getting There', ja: 'アクセス', de: 'Anfahrt', fr: 'Accès', es: 'Cómo llegar', pt: 'Como chegar', 'zh-CN': '交通', 'zh-TW': '交通', da: 'Transport', fi: 'Kulkuyhteydet', sv: 'Transport', et: 'Transport' },
};

// ── Website section translations ──
const WEBSITE_LABELS: Record<string, { label: string; cta: string }> = {
    ko: { label: '웹사이트', cta: '공식 웹사이트 바로가기' },
    en: { label: 'Website', cta: 'Visit official website' },
    ja: { label: 'ウェブサイト', cta: '公式サイトへ' },
    de: { label: 'Webseite', cta: 'Offizielle Website besuchen' },
    fr: { label: 'Site web', cta: 'Visiter le site officiel' },
    es: { label: 'Sitio web', cta: 'Visitar sitio oficial' },
    pt: { label: 'Website', cta: 'Visitar site oficial' },
    'zh-CN': { label: '官网', cta: '访问官方网站' },
    'zh-TW': { label: '官網', cta: '前往官方網站' },
    da: { label: 'Hjemmeside', cta: 'Besøg officiel hjemmeside' },
    fi: { label: 'Verkkosivu', cta: 'Vieraile virallisella sivustolla' },
    sv: { label: 'Webbplats', cta: 'Besök officiell webbplats' },
    et: { label: 'Veebileht', cta: 'Külasta ametlikku veebilehte' },
};

// ── Featured Works title ──
const FEATURED_WORKS: Record<string, string> = {
    ko: '대표 작품', en: 'Featured Works', ja: '代表作品', de: 'Hauptwerke', fr: 'Œuvres phares',
    es: 'Obras destacadas', pt: 'Obras em destaque', 'zh-CN': '代表作品', 'zh-TW': '代表作品',
    da: 'Udvalgte værker', fi: 'Pääteokset', sv: 'Utvalda verk', et: 'Esindatud teosed',
};

// ── Report info request ──
const REPORT_LABELS: Record<string, { button: string; thanks: string; thanksDesc: string }> = {
    ko: { button: '정보 수정 요청', thanks: '감사합니다!', thanksDesc: '수정 요청이 접수되었어요. 빠르게 반영하겠습니다 🙏' },
    en: { button: 'Request info update', thanks: 'Thank you!', thanksDesc: 'Your request has been received. We will review it shortly 🙏' },
    ja: { button: '情報修正リクエスト', thanks: 'ありがとうございます！', thanksDesc: 'リクエストを受け付けました。迅速に対応いたします 🙏' },
    de: { button: 'Information korrigieren', thanks: 'Vielen Dank!', thanksDesc: 'Ihre Anfrage wurde erhalten. Wir prüfen sie zeitnah 🙏' },
    fr: { button: 'Demander une correction', thanks: 'Merci !', thanksDesc: 'Votre demande a été reçue. Nous la traiterons rapidement 🙏' },
    es: { button: 'Solicitar corrección', thanks: '¡Gracias!', thanksDesc: 'Su solicitud ha sido recibida. La revisaremos pronto 🙏' },
    pt: { button: 'Solicitar correção', thanks: 'Obrigado!', thanksDesc: 'Sua solicitação foi recebida. Revisaremos em breve 🙏' },
    'zh-CN': { button: '请求信息更正', thanks: '谢谢！', thanksDesc: '您的请求已收到。我们将尽快处理 🙏' },
    'zh-TW': { button: '請求資訊更正', thanks: '謝謝！', thanksDesc: '您的請求已收到。我們將盡快處理 🙏' },
    da: { button: 'Anmod om rettelse', thanks: 'Tak!', thanksDesc: 'Din anmodning er modtaget. Vi vil gennemgå den snarest 🙏' },
    fi: { button: 'Pyydä tietojen korjausta', thanks: 'Kiitos!', thanksDesc: 'Pyyntösi on vastaanotettu. Käsittelemme sen pian 🙏' },
    sv: { button: 'Begär korrigering', thanks: 'Tack!', thanksDesc: 'Din begäran har mottagits. Vi granskar den inom kort 🙏' },
    et: { button: 'Taotle parandust', thanks: 'Aitäh!', thanksDesc: 'Teie taotlus on vastu võetud. Vaatame selle üle peatselt 🙏' },
};

// ── Value word translations (Korean → target language) ──
// IMPORTANT: Multi-char day ranges (화~일, 월~금 etc.) MUST come before single-char days (월, 화 etc.)
// to avoid partial replacements
type WordMap = [RegExp, string][];

const VALUE_WORDS: Record<string, WordMap> = {
    en: [
        [/무료/g, 'Free'], [/성인/g, 'Adult'], [/어린이/g, 'Child'], [/학생/g, 'Student'],
        [/매일/g, 'Daily'], [/예약제/g, 'By appointment'], [/예약 필수/g, 'Reservation required'],
        [/예약/g, 'reservation'], [/기부 환영/g, 'Donations welcome'],
        [/월·화 휴관/g, 'Closed Mon-Tue'], [/일·월 휴관/g, 'Closed Sun-Mon'],
        [/월 휴관/g, 'Closed Mon'], [/화 휴관/g, 'Closed Tue'], [/수 휴관/g, 'Closed Wed'],
        [/목 휴관/g, 'Closed Thu'], [/금 휴관/g, 'Closed Fri'], [/토 휴관/g, 'Closed Sat'], [/일 휴관/g, 'Closed Sun'],
        [/화~일/g, 'Tue-Sun'], [/화~금/g, 'Tue-Fri'], [/화~토/g, 'Tue-Sat'],
        [/월~금/g, 'Mon-Fri'], [/월~토/g, 'Mon-Sat'], [/월·수~금/g, 'Mon,Wed-Fri'],
        [/수~월/g, 'Wed-Mon'], [/수~일/g, 'Wed-Sun'], [/목~월/g, 'Thu-Mon'], [/목~화/g, 'Thu-Tue'],
        [/금~일/g, 'Fri-Sun'], [/토~목/g, 'Sat-Thu'], [/일~목/g, 'Sun-Thu'], [/일~금/g, 'Sun-Fri'],
        [/월/g, 'Mon'], [/화/g, 'Tue'], [/수/g, 'Wed'], [/목/g, 'Thu'], [/금/g, 'Fri'], [/토/g, 'Sat'], [/일/g, 'Sun'],
        [/항시 개방/g, 'Always open'], [/야외/g, 'Outdoor'], [/동절기/g, 'Winter'], [/하계/g, 'Summer'],
        [/도보/g, 'walk'], [/차량/g, 'by car'], [/시내/g, 'city center'], [/인근/g, 'nearby'],
        [/에서/g, ' from'], [/매월/g, 'monthly'], [/첫째/g, '1st'], [/둘째/g, '2nd'], [/셋째/g, '3rd'],
        [/시간/g, 'hr'], [/분/g, 'min'], [/전시별 상이/g, 'Varies by exhibition'],
        [/현재 문의 필요/g, 'Contact for info'], [/가이드 투어/g, 'Guided tour'],
        [/사전 예약/g, 'Advance booking'], [/군사기지/g, 'Military base'],
        [/연구기지/g, 'Research station'], [/방문 허가 필요/g, 'Visit permit required'],
        [/또는/g, 'or'], [/이후/g, 'after'], [/기획전 유료/g, 'Special exhibitions paid'],
        [/무료 또는 소액/g, 'Free or nominal'], [/무료 또는 기획전 유료/g, 'Free or paid for special exhibitions'],
        [/특별전 별도/g, 'Special exhibitions extra'], [/자율 기부/g, 'Pay what you wish'],
        [/이하 무료/g, 'and under free'], [/세 이상/g, 'and over'],
        [/할인/g, 'discount'], [/경로/g, 'senior'], [/장애인/g, 'disabled'],
        [/추수감사절/g, 'Thanksgiving'], [/크리스마스/g, 'Christmas'], [/설날/g, 'New Year'],
        [/공휴일/g, 'holidays'], [/휴관/g, 'closed'], [/자율 기부 입장/g, 'Pay-what-you-wish admission'],
        [/역/g, 'Stn'],
        [/지하철/g, 'Subway'], [/호선/g, ' Line'], [/출구/g, 'Exit'], [/번 출구/g, 'Exit No.'],
        [/버스/g, 'Bus'], [/택시/g, 'Taxi'], [/공항/g, 'Airport'], [/터미널/g, 'Terminal'],
        [/정류장/g, 'Stop'], [/환승/g, 'Transfer'], [/직행/g, 'Direct'], [/건축/g, 'Architecture'],
    ],
    ja: [
        [/무료/g, '無料'], [/성인/g, '大人'], [/어린이/g, '子供'], [/학생/g, '学生'],
        [/매일/g, '毎日'], [/예약제/g, '予約制'], [/예약 필수/g, '要予約'],
        [/예약/g, '予約'], [/기부 환영/g, '寄付歓迎'],
        [/월·화 휴관/g, '月・火休館'], [/일·월 휴관/g, '日・月休館'],
        [/월 휴관/g, '月曜休館'], [/화 휴관/g, '火曜休館'], [/수 휴관/g, '水曜休館'],
        [/목 휴관/g, '木曜休館'], [/금 휴관/g, '金曜休館'], [/토 휴관/g, '土曜休館'], [/일 휴관/g, '日曜休館'],
        // Day ranges (MUST come before standalone days)
        [/화~일/g, '火〜日'], [/화~금/g, '火〜金'], [/화~토/g, '火〜土'],
        [/월~금/g, '月〜金'], [/월~토/g, '月〜土'], [/월·수~금/g, '月・水〜金'],
        [/수~월/g, '水〜月'], [/수~일/g, '水〜日'], [/목~월/g, '木〜月'], [/목~화/g, '木〜火'],
        [/금~일/g, '金〜日'], [/토~목/g, '土〜木'], [/일~목/g, '日〜木'], [/일~금/g, '日〜金'],
        // Standalone days
        [/월/g, '月'], [/화/g, '火'], [/수/g, '水'], [/목/g, '木'], [/금/g, '金'], [/토/g, '土'], [/일/g, '日'],
        [/항시 개방/g, '常時開放'], [/야외/g, '屋外'], [/동절기/g, '冬季'], [/하계/g, '夏季'],
        [/도보/g, '徒歩'], [/차량/g, '車'], [/시내/g, '市内'], [/인근/g, '付近'],
        [/에서/g, 'から'], [/매월/g, '毎月'], [/첫째/g, '第1'], [/둘째/g, '第2'], [/셋째/g, '第3'],
        [/시간/g, '時間'], [/분/g, '分'], [/전시별 상이/g, '展示により異なる'],
        [/가이드 투어/g, 'ガイドツアー'], [/사전 예약/g, '事前予約'],
        [/또는/g, 'または'], [/이후/g, '以降'], [/기획전 유료/g, '企画展有料'],
        [/특별전 별도/g, '特別展別途'], [/자율 기부/g, '任意寄付'],
        [/이하 무료/g, '以下無料'], [/세 이상/g, '歳以上'],
        [/할인/g, '割引'], [/경로/g, 'シニア'], [/장애인/g, '障がい者'],
        [/추수감사절/g, '感謝祭'], [/크리스마스/g, 'クリスマス'], [/설날/g, '正月'],
        [/공휴일/g, '祝日'], [/휴관/g, '休館'], [/자율 기부 입장/g, '任意寄付入場'],
        [/역/g, '駅'],
        [/지하철/g, '地下鉄'], [/호선/g, '号線'], [/출구/g, '出口'], [/번 출구/g, '番出口'],
        [/버스/g, 'バス'], [/택시/g, 'タクシー'], [/공항/g, '空港'], [/터미널/g, 'ターミナル'],
        [/정류장/g, '停留所'], [/환승/g, '乗換'], [/직행/g, '直行'], [/건축/g, '建築'],
    ],
    de: [
        [/무료/g, 'Kostenlos'], [/성인/g, 'Erwachsene'], [/어린이/g, 'Kinder'], [/학생/g, 'Studenten'],
        [/매일/g, 'Täglich'], [/예약제/g, 'Nach Vereinbarung'], [/예약 필수/g, 'Reservierung erforderlich'],
        [/기부 환영/g, 'Spenden willkommen'],
        [/월·화 휴관/g, 'Mo-Di geschlossen'], [/일·월 휴관/g, 'So-Mo geschlossen'],
        [/월 휴관/g, 'Mo geschlossen'], [/화 휴관/g, 'Di geschlossen'], [/수 휴관/g, 'Mi geschlossen'],
        [/목 휴관/g, 'Do geschlossen'], [/금 휴관/g, 'Fr geschlossen'], [/토 휴관/g, 'Sa geschlossen'], [/일 휴관/g, 'So geschlossen'],
        // Day ranges
        [/화~일/g, 'Di-So'], [/화~금/g, 'Di-Fr'], [/화~토/g, 'Di-Sa'],
        [/월~금/g, 'Mo-Fr'], [/월~토/g, 'Mo-Sa'], [/월·수~금/g, 'Mo,Mi-Fr'],
        [/수~월/g, 'Mi-Mo'], [/수~일/g, 'Mi-So'], [/목~월/g, 'Do-Mo'], [/목~화/g, 'Do-Di'],
        [/금~일/g, 'Fr-So'], [/토~목/g, 'Sa-Do'], [/일~목/g, 'So-Do'], [/일~금/g, 'So-Fr'],
        [/월/g, 'Mo'], [/화/g, 'Di'], [/수/g, 'Mi'], [/목/g, 'Do'], [/금/g, 'Fr'], [/토/g, 'Sa'], [/일/g, 'So'],
        [/항시 개방/g, 'Immer geöffnet'], [/야외/g, 'Außen'], [/동절기/g, 'Winter'], [/하계/g, 'Sommer'],
        [/도보/g, 'zu Fuß'], [/차량/g, 'mit dem Auto'], [/시내/g, 'Stadtzentrum'], [/인근/g, 'in der Nähe'],
        [/에서/g, ' von'], [/시간/g, 'Std'], [/분/g, 'Min'],
        [/또는/g, 'oder'], [/이후/g, 'nach'], [/기획전 유료/g, 'Sonderausstellungen kostenpflichtig'],
        [/특별전 별도/g, 'Sonderausstellungen extra'], [/자율 기부/g, 'Spende nach Belieben'],
        [/이하 무료/g, 'und jünger frei'], [/할인/g, 'Ermäßigung'],
        [/추수감사절/g, 'Erntedankfest'], [/크리스마스/g, 'Weihnachten'],
        [/공휴일/g, 'Feiertage'], [/휴관/g, 'geschlossen'],
        [/역/g, 'Bhf'],
        [/지하철/g, 'U-Bahn'], [/호선/g, ' Linie'], [/출구/g, 'Ausgang'], [/번 출구/g, 'Ausgang Nr.'],
        [/버스/g, 'Bus'], [/택시/g, 'Taxi'], [/공항/g, 'Flughafen'], [/터미널/g, 'Terminal'],
        [/정류장/g, 'Haltestelle'], [/환승/g, 'Umsteigen'], [/직행/g, 'Direkt'], [/건축/g, 'Architektur'],
    ],
    fr: [
        [/무료/g, 'Gratuit'], [/성인/g, 'Adulte'], [/어린이/g, 'Enfant'], [/학생/g, 'Étudiant'],
        [/매일/g, 'Tous les jours'], [/예약제/g, 'Sur réservation'], [/예약 필수/g, 'Réservation obligatoire'],
        [/기부 환영/g, 'Dons bienvenus'],
        [/월·화 휴관/g, 'Fermé lun-mar'], [/일·월 휴관/g, 'Fermé dim-lun'],
        [/월 휴관/g, 'Fermé lun'], [/화 휴관/g, 'Fermé mar'], [/수 휴관/g, 'Fermé mer'],
        [/목 휴관/g, 'Fermé jeu'], [/금 휴관/g, 'Fermé ven'], [/토 휴관/g, 'Fermé sam'], [/일 휴관/g, 'Fermé dim'],
        // Day ranges
        [/화~일/g, 'mar-dim'], [/화~금/g, 'mar-ven'], [/화~토/g, 'mar-sam'],
        [/월~금/g, 'lun-ven'], [/월~토/g, 'lun-sam'], [/월·수~금/g, 'lun,mer-ven'],
        [/수~월/g, 'mer-lun'], [/수~일/g, 'mer-dim'], [/목~월/g, 'jeu-lun'], [/목~화/g, 'jeu-mar'],
        [/금~일/g, 'ven-dim'], [/토~목/g, 'sam-jeu'], [/일~목/g, 'dim-jeu'], [/일~금/g, 'dim-ven'],
        [/월/g, 'lun'], [/화/g, 'mar'], [/수/g, 'mer'], [/목/g, 'jeu'], [/금/g, 'ven'], [/토/g, 'sam'], [/일/g, 'dim'],
        [/항시 개방/g, 'Toujours ouvert'], [/야외/g, 'Extérieur'], [/동절기/g, 'Hiver'], [/하계/g, 'Été'],
        [/도보/g, 'à pied'], [/차량/g, 'en voiture'], [/시내/g, 'centre-ville'], [/인근/g, 'à proximité'],
        [/에서/g, ' depuis'], [/시간/g, 'h'], [/분/g, 'min'],
        [/또는/g, 'ou'], [/이후/g, 'après'],
        [/특별전 별도/g, 'Expositions spéciales en sus'], [/자율 기부/g, 'Entrée libre'],
        [/이하 무료/g, 'et moins gratuit'], [/할인/g, 'réduction'],
        [/추수감사절/g, 'Thanksgiving'], [/크리스마스/g, 'Noël'],
        [/공휴일/g, 'jours fériés'], [/휴관/g, 'fermé'],
        [/역/g, 'gare'],
        [/지하철/g, 'Métro'], [/호선/g, ' ligne'], [/출구/g, 'sortie'], [/번 출구/g, 'sortie n°'],
        [/버스/g, 'Bus'], [/택시/g, 'Taxi'], [/공항/g, 'Aéroport'], [/터미널/g, 'Terminal'],
        [/정류장/g, 'Arrêt'], [/환승/g, 'Correspondance'], [/직행/g, 'Direct'], [/건축/g, 'Architecture'],
    ],
    es: [
        [/무료/g, 'Gratis'], [/성인/g, 'Adulto'], [/어린이/g, 'Niño'], [/학생/g, 'Estudiante'],
        [/매일/g, 'Todos los días'], [/예약제/g, 'Con reserva'], [/예약 필수/g, 'Reserva obligatoria'],
        [/기부 환영/g, 'Donaciones bienvenidas'],
        [/월·화 휴관/g, 'Cerrado lun-mar'], [/일·월 휴관/g, 'Cerrado dom-lun'],
        [/월 휴관/g, 'Cerrado lun'], [/화 휴관/g, 'Cerrado mar'], [/수 휴관/g, 'Cerrado mié'],
        [/목 휴관/g, 'Cerrado jue'], [/금 휴관/g, 'Cerrado vie'], [/토 휴관/g, 'Cerrado sáb'], [/일 휴관/g, 'Cerrado dom'],
        // Day ranges
        [/화~일/g, 'mar-dom'], [/화~금/g, 'mar-vie'], [/화~토/g, 'mar-sáb'],
        [/월~금/g, 'lun-vie'], [/월~토/g, 'lun-sáb'], [/월·수~금/g, 'lun,mié-vie'],
        [/수~월/g, 'mié-lun'], [/수~일/g, 'mié-dom'], [/목~월/g, 'jue-lun'], [/목~화/g, 'jue-mar'],
        [/금~일/g, 'vie-dom'], [/토~목/g, 'sáb-jue'], [/일~목/g, 'dom-jue'], [/일~금/g, 'dom-vie'],
        [/월/g, 'lun'], [/화/g, 'mar'], [/수/g, 'mié'], [/목/g, 'jue'], [/금/g, 'vie'], [/토/g, 'sáb'], [/일/g, 'dom'],
        [/항시 개방/g, 'Siempre abierto'], [/야외/g, 'Exterior'], [/동절기/g, 'Invierno'], [/하계/g, 'Verano'],
        [/도보/g, 'a pie'], [/차량/g, 'en coche'], [/시내/g, 'centro'], [/인근/g, 'cerca'],
        [/에서/g, ' desde'], [/시간/g, 'h'], [/분/g, 'min'],
        [/또는/g, 'o'], [/이후/g, 'después'],
        [/특별전 별도/g, 'Exposiciones especiales aparte'], [/자율 기부/g, 'Entrada libre'],
        [/이하 무료/g, 'y menores gratis'], [/할인/g, 'descuento'],
        [/추수감사절/g, 'Acción de Gracias'], [/크리스마스/g, 'Navidad'],
        [/공휴일/g, 'festivos'], [/휴관/g, 'cerrado'],
        [/역/g, 'est.'],
        [/지하철/g, 'Metro'], [/호선/g, ' línea'], [/출구/g, 'salida'], [/번 출구/g, 'salida n.º'],
        [/버스/g, 'Autobús'], [/택시/g, 'Taxi'], [/공항/g, 'Aeropuerto'], [/터미널/g, 'Terminal'],
        [/정류장/g, 'Parada'], [/환승/g, 'Transbordo'], [/직행/g, 'Directo'], [/건축/g, 'Arquitectura'],
    ],
    pt: [
        [/무료/g, 'Gratuito'], [/성인/g, 'Adulto'], [/어린이/g, 'Criança'], [/학생/g, 'Estudante'],
        [/매일/g, 'Todos os dias'], [/예약제/g, 'Com agendamento'], [/예약 필수/g, 'Reserva obrigatória'],
        [/기부 환영/g, 'Doações bem-vindas'],
        [/월·화 휴관/g, 'Fechado seg-ter'], [/일·월 휴관/g, 'Fechado dom-seg'],
        [/월 휴관/g, 'Fechado seg'], [/화 휴관/g, 'Fechado ter'], [/수 휴관/g, 'Fechado qua'],
        [/목 휴관/g, 'Fechado qui'], [/금 휴관/g, 'Fechado sex'], [/토 휴관/g, 'Fechado sáb'], [/일 휴관/g, 'Fechado dom'],
        // Day ranges
        [/화~일/g, 'ter-dom'], [/화~금/g, 'ter-sex'], [/화~토/g, 'ter-sáb'],
        [/월~금/g, 'seg-sex'], [/월~토/g, 'seg-sáb'], [/월·수~금/g, 'seg,qua-sex'],
        [/수~월/g, 'qua-seg'], [/수~일/g, 'qua-dom'], [/목~월/g, 'qui-seg'], [/목~화/g, 'qui-ter'],
        [/금~일/g, 'sex-dom'], [/토~목/g, 'sáb-qui'], [/일~목/g, 'dom-qui'], [/일~금/g, 'dom-sex'],
        [/월/g, 'seg'], [/화/g, 'ter'], [/수/g, 'qua'], [/목/g, 'qui'], [/금/g, 'sex'], [/토/g, 'sáb'], [/일/g, 'dom'],
        [/항시 개방/g, 'Sempre aberto'], [/야외/g, 'Exterior'], [/동절기/g, 'Inverno'], [/하계/g, 'Verão'],
        [/도보/g, 'a pé'], [/차량/g, 'de carro'], [/시내/g, 'centro'], [/인근/g, 'próximo'],
        [/에서/g, ' de'], [/시간/g, 'h'], [/분/g, 'min'],
        [/또는/g, 'ou'], [/이후/g, 'depois'],
        [/특별전 별도/g, 'Exposições especiais à parte'], [/자율 기부/g, 'Entrada livre'],
        [/이하 무료/g, 'e menores grátis'], [/할인/g, 'desconto'],
        [/추수감사절/g, 'Ação de Graças'], [/크리스마스/g, 'Natal'],
        [/공휴일/g, 'feriados'], [/휴관/g, 'fechado'],
        [/역/g, 'est.'],
        [/지하철/g, 'Metrô'], [/호선/g, ' linha'], [/출구/g, 'saída'], [/번 출구/g, 'saída n.º'],
        [/버스/g, 'Ônibus'], [/택시/g, 'Táxi'], [/공항/g, 'Aeroporto'], [/터미널/g, 'Terminal'],
        [/정류장/g, 'Parada'], [/환승/g, 'Baldeação'], [/직행/g, 'Direto'], [/건축/g, 'Arquitetura'],
    ],
    'zh-CN': [
        [/무료/g, '免费'], [/성인/g, '成人'], [/어린이/g, '儿童'], [/학생/g, '学生'],
        [/매일/g, '每天'], [/예약제/g, '预约制'], [/예약 필수/g, '需提前预约'],
        [/기부 환영/g, '欢迎捐赠'],
        [/월·화 휴관/g, '周一·周二闭馆'], [/일·월 휴관/g, '周日·周一闭馆'],
        [/월 휴관/g, '周一闭馆'], [/화 휴관/g, '周二闭馆'], [/수 휴관/g, '周三闭馆'],
        [/목 휴관/g, '周四闭馆'], [/금 휴관/g, '周五闭馆'], [/토 휴관/g, '周六闭馆'], [/일 휴관/g, '周日闭馆'],
        // Day ranges
        [/화~일/g, '周二至周日'], [/화~금/g, '周二至周五'], [/화~토/g, '周二至周六'],
        [/월~금/g, '周一至周五'], [/월~토/g, '周一至周六'], [/월·수~금/g, '周一·周三至周五'],
        [/수~월/g, '周三至周一'], [/수~일/g, '周三至周日'], [/목~월/g, '周四至周一'], [/목~화/g, '周四至周二'],
        [/금~일/g, '周五至周日'], [/토~목/g, '周六至周四'], [/일~목/g, '周日至周四'], [/일~금/g, '周日至周五'],
        [/월/g, '周一'], [/화/g, '周二'], [/수/g, '周三'], [/목/g, '周四'], [/금/g, '周五'], [/토/g, '周六'], [/일/g, '周日'],
        [/항시 개방/g, '全天开放'], [/야외/g, '户外'], [/동절기/g, '冬季'], [/하계/g, '夏季'],
        [/도보/g, '步行'], [/차량/g, '驾车'], [/시내/g, '市中心'], [/인근/g, '附近'],
        [/에서/g, '从'], [/시간/g, '小时'], [/분/g, '分钟'],
        [/또는/g, '或'], [/이후/g, '之后'],
        [/특별전 별도/g, '特展另计'], [/자율 기부/g, '自愿捐赠'],
        [/이하 무료/g, '以下免费'], [/할인/g, '优惠'],
        [/추수감사절/g, '感恩节'], [/크리스마스/g, '圣诞节'],
        [/공휴일/g, '公休日'], [/휴관/g, '闭馆'],
        [/역/g, '站'],
        [/지하철/g, '地铁'], [/호선/g, '号线'], [/출구/g, '出口'], [/번 출구/g, '号出口'],
        [/버스/g, '公交'], [/택시/g, '出租车'], [/공항/g, '机场'], [/터미널/g, '航站楼'],
        [/정류장/g, '站台'], [/환승/g, '换乘'], [/직행/g, '直达'], [/건축/g, '建筑'],
    ],
    'zh-TW': [
        [/무료/g, '免費'], [/성인/g, '成人'], [/어린이/g, '兒童'], [/학생/g, '學生'],
        [/매일/g, '每天'], [/예약제/g, '預約制'], [/예약 필수/g, '需提前預約'],
        [/기부 환영/g, '歡迎捐贈'],
        [/월·화 휴관/g, '週一·週二休館'], [/일·월 휴관/g, '週日·週一休館'],
        [/월 휴관/g, '週一休館'], [/화 휴관/g, '週二休館'], [/수 휴관/g, '週三休館'],
        [/목 휴관/g, '週四休館'], [/금 휴관/g, '週五休館'], [/토 휴관/g, '週六休館'], [/일 휴관/g, '週日休館'],
        // Day ranges
        [/화~일/g, '週二至週日'], [/화~금/g, '週二至週五'], [/화~토/g, '週二至週六'],
        [/월~금/g, '週一至週五'], [/월~토/g, '週一至週六'], [/월·수~금/g, '週一·週三至週五'],
        [/수~월/g, '週三至週一'], [/수~일/g, '週三至週日'], [/목~월/g, '週四至週一'], [/목~화/g, '週四至週二'],
        [/금~일/g, '週五至週日'], [/토~목/g, '週六至週四'], [/일~목/g, '週日至週四'], [/일~금/g, '週日至週五'],
        [/월/g, '週一'], [/화/g, '週二'], [/수/g, '週三'], [/목/g, '週四'], [/금/g, '週五'], [/토/g, '週六'], [/일/g, '週日'],
        [/항시 개방/g, '全天開放'], [/야외/g, '戶外'], [/동절기/g, '冬季'], [/하계/g, '夏季'],
        [/도보/g, '步行'], [/차량/g, '開車'], [/시내/g, '市中心'], [/인근/g, '附近'],
        [/에서/g, '從'], [/시간/g, '小時'], [/분/g, '分鐘'],
        [/또는/g, '或'], [/이후/g, '之後'],
        [/특별전 별도/g, '特展另計'], [/자율 기부/g, '自願捐贈'],
        [/이하 무료/g, '以下免費'], [/할인/g, '優惠'],
        [/추수감사절/g, '感恩節'], [/크리스마스/g, '聖誕節'],
        [/공휴일/g, '公休日'], [/휴관/g, '休館'],
        [/역/g, '站'],
        [/지하철/g, '地鐵'], [/호선/g, '號線'], [/출구/g, '出口'], [/번 출구/g, '號出口'],
        [/버스/g, '公車'], [/택시/g, '計程車'], [/공항/g, '機場'], [/터미널/g, '航廈'],
        [/정류장/g, '站'], [/환승/g, '轉乘'], [/직행/g, '直達'], [/건축/g, '建築'],
    ],
    da: [
        [/무료/g, 'Gratis'], [/성인/g, 'Voksen'], [/어린이/g, 'Barn'], [/학생/g, 'Studerende'],
        [/매일/g, 'Dagligt'], [/예약제/g, 'Efter aftale'], [/예약 필수/g, 'Reservation påkrævet'],
        [/기부 환영/g, 'Donationer velkomne'],
        [/월·화 휴관/g, 'Lukket man-tir'], [/일·월 휴관/g, 'Lukket søn-man'],
        [/월 휴관/g, 'Lukket man'], [/화 휴관/g, 'Lukket tir'], [/수 휴관/g, 'Lukket ons'],
        [/목 휴관/g, 'Lukket tor'], [/금 휴관/g, 'Lukket fre'], [/토 휴관/g, 'Lukket lør'], [/일 휴관/g, 'Lukket søn'],
        // Day ranges
        [/화~일/g, 'tir-søn'], [/화~금/g, 'tir-fre'], [/화~토/g, 'tir-lør'],
        [/월~금/g, 'man-fre'], [/월~토/g, 'man-lør'], [/월·수~금/g, 'man,ons-fre'],
        [/수~월/g, 'ons-man'], [/수~일/g, 'ons-søn'], [/목~월/g, 'tor-man'], [/목~화/g, 'tor-tir'],
        [/금~일/g, 'fre-søn'], [/토~목/g, 'lør-tor'], [/일~목/g, 'søn-tor'], [/일~금/g, 'søn-fre'],
        [/월/g, 'man'], [/화/g, 'tir'], [/수/g, 'ons'], [/목/g, 'tor'], [/금/g, 'fre'], [/토/g, 'lør'], [/일/g, 'søn'],
        [/항시 개방/g, 'Altid åbent'], [/야외/g, 'Udendørs'], [/동절기/g, 'Vinter'], [/하계/g, 'Sommer'],
        [/도보/g, 'til fods'], [/차량/g, 'med bil'], [/시내/g, 'centrum'], [/인근/g, 'i nærheden'],
        [/에서/g, ' fra'], [/시간/g, 't'], [/분/g, 'min'],
        [/또는/g, 'eller'], [/이후/g, 'efter'],
        [/특별전 별도/g, 'Særudstillinger ekstra'], [/자율 기부/g, 'Frivillig donation'],
        [/이하 무료/g, 'og yngre gratis'], [/할인/g, 'rabat'],
        [/추수감사절/g, 'Thanksgiving'], [/크리스마스/g, 'Jul'],
        [/공휴일/g, 'helligdage'], [/휴관/g, 'lukket'],
        [/역/g, 'st.'],
        [/지하철/g, 'Metro'], [/호선/g, ' linje'], [/출구/g, 'udgang'], [/번 출구/g, 'udgang nr.'],
        [/버스/g, 'Bus'], [/택시/g, 'Taxa'], [/공항/g, 'Lufthavn'], [/터미널/g, 'Terminal'],
        [/정류장/g, 'Stoppested'], [/환승/g, 'Skift'], [/직행/g, 'Direkte'], [/건축/g, 'Arkitektur'],
    ],
    fi: [
        [/무료/g, 'Ilmainen'], [/성인/g, 'Aikuinen'], [/어린이/g, 'Lapsi'], [/학생/g, 'Opiskelija'],
        [/매일/g, 'Päivittäin'], [/예약제/g, 'Varauksella'], [/예약 필수/g, 'Varaus vaaditaan'],
        [/기부 환영/g, 'Lahjoitukset tervetulleita'],
        [/월·화 휴관/g, 'Suljettu ma-ti'], [/일·월 휴관/g, 'Suljettu su-ma'],
        [/월 휴관/g, 'Suljettu ma'], [/화 휴관/g, 'Suljettu ti'], [/수 휴관/g, 'Suljettu ke'],
        [/목 휴관/g, 'Suljettu to'], [/금 휴관/g, 'Suljettu pe'], [/토 휴관/g, 'Suljettu la'], [/일 휴관/g, 'Suljettu su'],
        // Day ranges
        [/화~일/g, 'ti-su'], [/화~금/g, 'ti-pe'], [/화~토/g, 'ti-la'],
        [/월~금/g, 'ma-pe'], [/월~토/g, 'ma-la'], [/월·수~금/g, 'ma,ke-pe'],
        [/수~월/g, 'ke-ma'], [/수~일/g, 'ke-su'], [/목~월/g, 'to-ma'], [/목~화/g, 'to-ti'],
        [/금~일/g, 'pe-su'], [/토~목/g, 'la-to'], [/일~목/g, 'su-to'], [/일~금/g, 'su-pe'],
        [/월/g, 'ma'], [/화/g, 'ti'], [/수/g, 'ke'], [/목/g, 'to'], [/금/g, 'pe'], [/토/g, 'la'], [/일/g, 'su'],
        [/항시 개방/g, 'Aina avoinna'], [/야외/g, 'Ulkona'], [/동절기/g, 'Talvi'], [/하계/g, 'Kesä'],
        [/도보/g, 'kävellen'], [/차량/g, 'autolla'], [/시내/g, 'keskusta'], [/인근/g, 'lähellä'],
        [/에서/g, ':sta'], [/시간/g, 't'], [/분/g, 'min'],
        [/또는/g, 'tai'], [/이후/g, 'jälkeen'],
        [/특별전 별도/g, 'Erikoisnäyttelyt lisämaksu'], [/자율 기부/g, 'Vapaaehtoinen lahjoitus'],
        [/이하 무료/g, 'ja nuoremmat ilmaiseksi'], [/할인/g, 'alennus'],
        [/추수감사절/g, 'Kiitospäivä'], [/크리스마스/g, 'Joulu'],
        [/공휴일/g, 'pyhäpäivät'], [/휴관/g, 'suljettu'],
        [/역/g, 'as.'],
        [/지하철/g, 'Metro'], [/호선/g, ' linja'], [/출구/g, 'uloskäynti'], [/번 출구/g, 'uloskäynti nro'],
        [/버스/g, 'Bussi'], [/택시/g, 'Taksi'], [/공항/g, 'Lentokenttä'], [/터미널/g, 'Terminaali'],
        [/정류장/g, 'Pysäkki'], [/환승/g, 'Vaihto'], [/직행/g, 'Suora'], [/건축/g, 'Arkkitehtuuri'],
    ],
    sv: [
        [/무료/g, 'Gratis'], [/성인/g, 'Vuxen'], [/어린이/g, 'Barn'], [/학생/g, 'Student'],
        [/매일/g, 'Dagligen'], [/예약제/g, 'Bokning krävs'], [/예약 필수/g, 'Bokning krävs'],
        [/기부 환영/g, 'Donationer välkomna'],
        [/월·화 휴관/g, 'Stängt mån-tis'], [/일·월 휴관/g, 'Stängt sön-mån'],
        [/월 휴관/g, 'Stängt mån'], [/화 휴관/g, 'Stängt tis'], [/수 휴관/g, 'Stängt ons'],
        [/목 휴관/g, 'Stängt tor'], [/금 휴관/g, 'Stängt fre'], [/토 휴관/g, 'Stängt lör'], [/일 휴관/g, 'Stängt sön'],
        // Day ranges
        [/화~일/g, 'tis-sön'], [/화~금/g, 'tis-fre'], [/화~토/g, 'tis-lör'],
        [/월~금/g, 'mån-fre'], [/월~토/g, 'mån-lör'], [/월·수~금/g, 'mån,ons-fre'],
        [/수~월/g, 'ons-mån'], [/수~일/g, 'ons-sön'], [/목~월/g, 'tor-mån'], [/목~화/g, 'tor-tis'],
        [/금~일/g, 'fre-sön'], [/토~목/g, 'lör-tor'], [/일~목/g, 'sön-tor'], [/일~금/g, 'sön-fre'],
        [/월/g, 'mån'], [/화/g, 'tis'], [/수/g, 'ons'], [/목/g, 'tor'], [/금/g, 'fre'], [/토/g, 'lör'], [/일/g, 'sön'],
        [/항시 개방/g, 'Alltid öppet'], [/야외/g, 'Utomhus'], [/동절기/g, 'Vinter'], [/하계/g, 'Sommar'],
        [/도보/g, 'till fots'], [/차량/g, 'med bil'], [/시내/g, 'centrum'], [/인근/g, 'i närheten'],
        [/에서/g, ' från'], [/시간/g, 't'], [/분/g, 'min'],
        [/또는/g, 'eller'], [/이후/g, 'efter'],
        [/특별전 별도/g, 'Specialutställningar extra'], [/자율 기부/g, 'Frivillig donation'],
        [/이하 무료/g, 'och yngre gratis'], [/할인/g, 'rabatt'],
        [/추수감사절/g, 'Thanksgiving'], [/크리스마스/g, 'Jul'],
        [/공휴일/g, 'helgdagar'], [/휴관/g, 'stängt'],
        [/역/g, 'st.'],
        [/지하철/g, 'Tunnelbana'], [/호선/g, ' linje'], [/출구/g, 'utgång'], [/번 출구/g, 'utgång nr'],
        [/버스/g, 'Buss'], [/택시/g, 'Taxi'], [/공항/g, 'Flygplats'], [/터미널/g, 'Terminal'],
        [/정류장/g, 'Hållplats'], [/환승/g, 'Byte'], [/직행/g, 'Direkt'], [/건축/g, 'Arkitektur'],
    ],
    et: [
        [/무료/g, 'Tasuta'], [/성인/g, 'Täiskasvanu'], [/어린이/g, 'Laps'], [/학생/g, 'Üliõpilane'],
        [/매일/g, 'Iga päev'], [/예약제/g, 'Ettetellimisel'], [/예약 필수/g, 'Broneering vajalik'],
        [/기부 환영/g, 'Annetused teretulnud'],
        [/월·화 휴관/g, 'Suletud E-T'], [/일·월 휴관/g, 'Suletud P-E'],
        [/월 휴관/g, 'Suletud E'], [/화 휴관/g, 'Suletud T'], [/수 휴관/g, 'Suletud K'],
        [/목 휴관/g, 'Suletud N'], [/금 휴관/g, 'Suletud R'], [/토 휴관/g, 'Suletud L'], [/일 휴관/g, 'Suletud P'],
        // Day ranges
        [/화~일/g, 'T-P'], [/화~금/g, 'T-R'], [/화~토/g, 'T-L'],
        [/월~금/g, 'E-R'], [/월~토/g, 'E-L'], [/월·수~금/g, 'E,K-R'],
        [/수~월/g, 'K-E'], [/수~일/g, 'K-P'], [/목~월/g, 'N-E'], [/목~화/g, 'N-T'],
        [/금~일/g, 'R-P'], [/토~목/g, 'L-N'], [/일~목/g, 'P-N'], [/일~금/g, 'P-R'],
        [/월/g, 'E'], [/화/g, 'T'], [/수/g, 'K'], [/목/g, 'N'], [/금/g, 'R'], [/토/g, 'L'], [/일/g, 'P'],
        [/항시 개방/g, 'Alati avatud'], [/야외/g, 'Väljas'], [/동절기/g, 'Talv'], [/하계/g, 'Suvi'],
        [/도보/g, 'jalgsi'], [/차량/g, 'autoga'], [/시내/g, 'kesklinn'], [/인근/g, 'lähedal'],
        [/에서/g, '-st'], [/시간/g, 't'], [/분/g, 'min'],
        [/또는/g, 'või'], [/이후/g, 'pärast'],
        [/특별전 별도/g, 'Erinäitused lisatasu'], [/자율 기부/g, 'Vabatahtlik annetus'],
        [/이하 무료/g, 'ja nooremad tasuta'], [/할인/g, 'soodustus'],
        [/추수감사절/g, 'Tänupüha'], [/크리스마스/g, 'Jõulud'],
        [/공휴일/g, 'pühad'], [/휴관/g, 'suletud'],
        [/역/g, 'jaam'],
        [/지하철/g, 'Metroo'], [/호선/g, ' liin'], [/출구/g, 'väljapääs'], [/번 출구/g, 'väljapääs nr'],
        [/버스/g, 'Buss'], [/택시/g, 'Takso'], [/공항/g, 'Lennujaam'], [/터미널/g, 'Terminal'],
        [/정류장/g, 'Peatus'], [/환승/g, 'Ümberistumine'], [/직행/g, 'Otse'], [/건축/g, 'Arhitektuur'],
    ],
};

/**
 * Translate a visitorInfo label (입장료 → Admission etc.)
 */
export function translateViLabel(label: string, locale: string): string {
    if (locale === 'ko') return label;
    return LABEL_MAP[label]?.[locale] || LABEL_MAP[label]?.['en'] || label;
}

/**
 * Translate common Korean words in visitorInfo values.
 * For 교통 (transport/access) field: Korean place names are kept as English fallback
 * since they're transliterations not translatable by simple regex.
 */
export function translateViValue(value: string, locale: string): string {
    if (locale === 'ko') return value;
    const words = VALUE_WORDS[locale] || VALUE_WORDS['en'];
    if (!words) return value;
    let result = value;
    for (const [re, replacement] of words) {
        result = result.replace(re, replacement);
    }
    return result;
}

/**
 * Get website section labels
 */
export function getWebsiteLabels(locale: string) {
    return WEBSITE_LABELS[locale] || WEBSITE_LABELS['en'];
}

/**
 * Get Featured Works title
 */
export function getFeaturedWorksTitle(locale: string): string {
    return FEATURED_WORKS[locale] || FEATURED_WORKS['en'];
}

/**
 * Get report button labels
 */
export function getReportLabels(locale: string) {
    return REPORT_LABELS[locale] || REPORT_LABELS['en'];
}

// ── Copy toast translations ──
const COPY_TOAST: Record<string, string> = {
    ko: '주소가 복사되었습니다', en: 'Address copied', ja: 'アドレスをコピーしました',
    de: 'Adresse kopiert', fr: 'Adresse copiée', es: 'Dirección copiada',
    pt: 'Endereço copiado', 'zh-CN': '地址已复制', 'zh-TW': '地址已複製',
    da: 'Adresse kopieret', fi: 'Osoite kopioitu', sv: 'Adress kopierad', et: 'Aadress kopeeritud',
};

export function getCopyToast(locale: string): string {
    return COPY_TOAST[locale] || COPY_TOAST['en'];
}

// ── Tap to copy address hint ──
const TAP_COPY: Record<string, string> = {
    ko: '터치하여 주소 복사', en: 'Tap to copy address', ja: 'タップしてアドレスをコピー',
    de: 'Tippen zum Kopieren', fr: 'Appuyez pour copier', es: 'Toca para copiar',
    pt: 'Toque para copiar', 'zh-CN': '点击复制地址', 'zh-TW': '點擊複製地址',
    da: 'Tryk for at kopiere', fi: 'Kopioi napauttamalla', sv: 'Tryck för att kopiera', et: 'Puuduta kopeerimiseks',
};

export function getTapCopyHint(locale: string): string {
    return TAP_COPY[locale] || TAP_COPY['en'];
}

// ── Report modal translations ──
const REPORT_MODAL: Record<string, { title: string; placeholder: string; submit: string; sending: string; note: string }> = {
    ko: { title: '정보 수정 요청', placeholder: '어떤 정보가 실제와 다른가요?\n예: 입장료가 변경되었어요, 운영시간이 달라요 등', submit: '수정 요청 보내기', sending: '전송 중...', note: '보내주신 내용은 관리자가 확인 후 반영합니다' },
    en: { title: 'Request Info Update', placeholder: 'What information is inaccurate?\ne.g. Admission fee has changed, hours are different, etc.', submit: 'Submit Request', sending: 'Sending...', note: 'Your request will be reviewed by our team' },
    ja: { title: '情報修正リクエスト', placeholder: 'どの情報が異なりますか？\n例：入場料が変更された、営業時間が違う等', submit: 'リクエスト送信', sending: '送信中...', note: '送信内容は管理者が確認後反映します' },
    de: { title: 'Information korrigieren', placeholder: 'Welche Informationen sind ungenau?\nz.B. Eintrittspreis geändert, Öffnungszeiten anders usw.', submit: 'Anfrage senden', sending: 'Sende...', note: 'Ihre Anfrage wird von unserem Team geprüft' },
    fr: { title: 'Demander une correction', placeholder: 'Quelle information est inexacte ?\nex : Tarif modifié, horaires différents, etc.', submit: 'Envoyer la demande', sending: 'Envoi...', note: 'Votre demande sera examinée par notre équipe' },
    es: { title: 'Solicitar corrección', placeholder: '¿Qué información es incorrecta?\nej: Precio de entrada cambió, horarios diferentes, etc.', submit: 'Enviar solicitud', sending: 'Enviando...', note: 'Su solicitud será revisada por nuestro equipo' },
    pt: { title: 'Solicitar correção', placeholder: 'Qual informação está incorreta?\nex: Preço de entrada mudou, horários diferentes, etc.', submit: 'Enviar solicitação', sending: 'Enviando...', note: 'Sua solicitação será analisada pela nossa equipe' },
    'zh-CN': { title: '请求信息更正', placeholder: '哪些信息不准确？\n例如：门票价格已变更、开放时间不同等', submit: '提交请求', sending: '发送中...', note: '您的请求将由我们的团队审核' },
    'zh-TW': { title: '請求資訊更正', placeholder: '哪些資訊不準確？\n例如：門票價格已變更、開放時間不同等', submit: '提交請求', sending: '發送中...', note: '您的請求將由我們的團隊審核' },
    da: { title: 'Anmod om rettelse', placeholder: 'Hvilken information er forkert?\nf.eks.: Billetpris ændret, åbningstider anderledes osv.', submit: 'Send anmodning', sending: 'Sender...', note: 'Din anmodning vil blive gennemgået af vores team' },
    fi: { title: 'Pyydä tietojen korjausta', placeholder: 'Mikä tieto on virheellinen?\nesim: Pääsymaksu muuttunut, aukioloajat erilaiset jne.', submit: 'Lähetä pyyntö', sending: 'Lähetetään...', note: 'Pyyntösi tarkistetaan tiimimme toimesta' },
    sv: { title: 'Begär korrigering', placeholder: 'Vilken information stämmer inte?\nt.ex.: Biljettpris ändrat, öppettider annorlunda osv.', submit: 'Skicka begäran', sending: 'Skickar...', note: 'Din begäran granskas av vårt team' },
    et: { title: 'Taotle parandust', placeholder: 'Milline teave on ebatäpne?\nnt: Piletihind muutunud, lahtiolekud erinevad jne.', submit: 'Saada taotlus', sending: 'Saatmine...', note: 'Teie taotlust vaatab meie meeskond' },
};

export function getReportModalLabels(locale: string) {
    return REPORT_MODAL[locale] || REPORT_MODAL['en'];
}
