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
    ],
    ja: [
        [/무료/g, '無料'], [/성인/g, '大人'], [/어린이/g, '子供'], [/학생/g, '学生'],
        [/매일/g, '毎日'], [/예약제/g, '予約制'], [/예약 필수/g, '要予約'],
        [/예약/g, '予約'], [/기부 환영/g, '寄付歓迎'],
        [/월·화 휴관/g, '月・火休館'], [/일·월 휴관/g, '日・月休館'],
        [/월 휴관/g, '月曜休館'], [/화 휴관/g, '火曜休館'], [/수 휴관/g, '水曜休館'],
        [/목 휴관/g, '木曜休館'], [/금 휴관/g, '金曜休館'], [/토 휴관/g, '土曜休館'], [/일 휴관/g, '日曜休館'],
        [/항시 개방/g, '常時開放'], [/야외/g, '屋外'], [/동절기/g, '冬季'], [/하계/g, '夏季'],
        [/도보/g, '徒歩'], [/차량/g, '車'], [/시내/g, '市内'], [/인근/g, '付近'],
        [/에서/g, 'から'], [/매월/g, '毎月'], [/첫째/g, '第1'], [/둘째/g, '第2'], [/셋째/g, '第3'],
        [/시간/g, '時間'], [/분/g, '分'], [/전시별 상이/g, '展示により異なる'],
        [/가이드 투어/g, 'ガイドツアー'], [/사전 예약/g, '事前予約'],
    ],
    de: [
        [/무료/g, 'Kostenlos'], [/성인/g, 'Erwachsene'], [/어린이/g, 'Kinder'], [/학생/g, 'Studenten'],
        [/매일/g, 'Täglich'], [/예약제/g, 'Nach Vereinbarung'], [/예약 필수/g, 'Reservierung erforderlich'],
        [/기부 환영/g, 'Spenden willkommen'],
        [/월·화 휴관/g, 'Mo-Di geschlossen'], [/일·월 휴관/g, 'So-Mo geschlossen'],
        [/월 휴관/g, 'Mo geschlossen'], [/화 휴관/g, 'Di geschlossen'], [/수 휴관/g, 'Mi geschlossen'],
        [/목 휴관/g, 'Do geschlossen'], [/금 휴관/g, 'Fr geschlossen'], [/토 휴관/g, 'Sa geschlossen'], [/일 휴관/g, 'So geschlossen'],
        [/항시 개방/g, 'Immer geöffnet'], [/야외/g, 'Außen'], [/동절기/g, 'Winter'], [/하계/g, 'Sommer'],
        [/도보/g, 'zu Fuß'], [/차량/g, 'mit dem Auto'], [/시내/g, 'Stadtzentrum'], [/인근/g, 'in der Nähe'],
        [/에서/g, ' von'], [/시간/g, 'Std'], [/분/g, 'Min'],
    ],
    fr: [
        [/무료/g, 'Gratuit'], [/성인/g, 'Adulte'], [/어린이/g, 'Enfant'], [/학생/g, 'Étudiant'],
        [/매일/g, 'Tous les jours'], [/예약제/g, 'Sur réservation'], [/예약 필수/g, 'Réservation obligatoire'],
        [/기부 환영/g, 'Dons bienvenus'],
        [/월·화 휴관/g, 'Fermé lun-mar'], [/일·월 휴관/g, 'Fermé dim-lun'],
        [/월 휴관/g, 'Fermé lun'], [/화 휴관/g, 'Fermé mar'], [/수 휴관/g, 'Fermé mer'],
        [/목 휴관/g, 'Fermé jeu'], [/금 휴관/g, 'Fermé ven'], [/토 휴관/g, 'Fermé sam'], [/일 휴관/g, 'Fermé dim'],
        [/항시 개방/g, 'Toujours ouvert'], [/야외/g, 'Extérieur'], [/동절기/g, 'Hiver'], [/하계/g, 'Été'],
        [/도보/g, 'à pied'], [/차량/g, 'en voiture'], [/시내/g, 'centre-ville'], [/인근/g, 'à proximité'],
        [/에서/g, ' depuis'], [/시간/g, 'h'], [/분/g, 'min'],
    ],
    es: [
        [/무료/g, 'Gratis'], [/성인/g, 'Adulto'], [/어린이/g, 'Niño'], [/학생/g, 'Estudiante'],
        [/매일/g, 'Todos los días'], [/예약제/g, 'Con reserva'], [/예약 필수/g, 'Reserva obligatoria'],
        [/기부 환영/g, 'Donaciones bienvenidas'],
        [/월·화 휴관/g, 'Cerrado lun-mar'], [/일·월 휴관/g, 'Cerrado dom-lun'],
        [/월 휴관/g, 'Cerrado lun'], [/화 휴관/g, 'Cerrado mar'], [/수 휴관/g, 'Cerrado mié'],
        [/목 휴관/g, 'Cerrado jue'], [/금 휴관/g, 'Cerrado vie'], [/토 휴관/g, 'Cerrado sáb'], [/일 휴관/g, 'Cerrado dom'],
        [/항시 개방/g, 'Siempre abierto'], [/야외/g, 'Exterior'], [/동절기/g, 'Invierno'], [/하계/g, 'Verano'],
        [/도보/g, 'a pie'], [/차량/g, 'en coche'], [/시내/g, 'centro'], [/인근/g, 'cerca'],
        [/에서/g, ' desde'], [/시간/g, 'h'], [/분/g, 'min'],
    ],
    pt: [
        [/무료/g, 'Gratuito'], [/성인/g, 'Adulto'], [/어린이/g, 'Criança'], [/학생/g, 'Estudante'],
        [/매일/g, 'Todos os dias'], [/예약제/g, 'Com agendamento'], [/예약 필수/g, 'Reserva obrigatória'],
        [/기부 환영/g, 'Doações bem-vindas'],
        [/월 휴관/g, 'Fechado seg'], [/화 휴관/g, 'Fechado ter'], [/수 휴관/g, 'Fechado qua'],
        [/목 휴관/g, 'Fechado qui'], [/금 휴관/g, 'Fechado sex'], [/토 휴관/g, 'Fechado sáb'], [/일 휴관/g, 'Fechado dom'],
        [/항시 개방/g, 'Sempre aberto'], [/야외/g, 'Exterior'], [/동절기/g, 'Inverno'], [/하계/g, 'Verão'],
        [/도보/g, 'a pé'], [/차량/g, 'de carro'], [/시내/g, 'centro'], [/인근/g, 'próximo'],
        [/에서/g, ' de'], [/시간/g, 'h'], [/분/g, 'min'],
    ],
    'zh-CN': [
        [/무료/g, '免费'], [/성인/g, '成人'], [/어린이/g, '儿童'], [/학생/g, '学生'],
        [/매일/g, '每天'], [/예약제/g, '预约制'], [/예약 필수/g, '需提前预约'],
        [/기부 환영/g, '欢迎捐赠'],
        [/월 휴관/g, '周一闭馆'], [/화 휴관/g, '周二闭馆'], [/수 휴관/g, '周三闭馆'],
        [/목 휴관/g, '周四闭馆'], [/금 휴관/g, '周五闭馆'], [/토 휴관/g, '周六闭馆'], [/일 휴관/g, '周日闭馆'],
        [/항시 개방/g, '全天开放'], [/야외/g, '户外'], [/동절기/g, '冬季'], [/하계/g, '夏季'],
        [/도보/g, '步行'], [/차량/g, '驾车'], [/시내/g, '市中心'], [/인근/g, '附近'],
        [/에서/g, '从'], [/시간/g, '小时'], [/분/g, '分钟'],
    ],
    'zh-TW': [
        [/무료/g, '免費'], [/성인/g, '成人'], [/어린이/g, '兒童'], [/학생/g, '學生'],
        [/매일/g, '每天'], [/예약제/g, '預約制'], [/예약 필수/g, '需提前預約'],
        [/기부 환영/g, '歡迎捐贈'],
        [/월 휴관/g, '週一休館'], [/화 휴관/g, '週二休館'], [/수 휴관/g, '週三休館'],
        [/목 휴관/g, '週四休館'], [/금 휴관/g, '週五休館'], [/토 휴관/g, '週六休館'], [/일 휴관/g, '週日休館'],
        [/항시 개방/g, '全天開放'], [/야외/g, '戶外'], [/동절기/g, '冬季'], [/하계/g, '夏季'],
        [/도보/g, '步行'], [/차량/g, '開車'], [/시내/g, '市中心'], [/인근/g, '附近'],
        [/에서/g, '從'], [/시간/g, '小時'], [/분/g, '分鐘'],
    ],
    da: [
        [/무료/g, 'Gratis'], [/성인/g, 'Voksen'], [/어린이/g, 'Barn'], [/학생/g, 'Studerende'],
        [/매일/g, 'Dagligt'], [/예약제/g, 'Efter aftale'], [/예약 필수/g, 'Reservation påkrævet'],
        [/기부 환영/g, 'Donationer velkomne'],
        [/월 휴관/g, 'Lukket man'], [/화 휴관/g, 'Lukket tir'], [/수 휴관/g, 'Lukket ons'],
        [/목 휴관/g, 'Lukket tor'], [/금 휴관/g, 'Lukket fre'], [/토 휴관/g, 'Lukket lør'], [/일 휴관/g, 'Lukket søn'],
        [/항시 개방/g, 'Altid åbent'], [/야외/g, 'Udendørs'], [/동절기/g, 'Vinter'], [/하계/g, 'Sommer'],
        [/도보/g, 'til fods'], [/차량/g, 'med bil'], [/시내/g, 'centrum'], [/인근/g, 'i nærheden'],
        [/에서/g, ' fra'], [/시간/g, 't'], [/분/g, 'min'],
    ],
    fi: [
        [/무료/g, 'Ilmainen'], [/성인/g, 'Aikuinen'], [/어린이/g, 'Lapsi'], [/학생/g, 'Opiskelija'],
        [/매일/g, 'Päivittäin'], [/예약제/g, 'Varauksella'], [/예약 필수/g, 'Varaus vaaditaan'],
        [/기부 환영/g, 'Lahjoitukset tervetulleita'],
        [/월 휴관/g, 'Suljettu ma'], [/화 휴관/g, 'Suljettu ti'], [/수 휴관/g, 'Suljettu ke'],
        [/목 휴관/g, 'Suljettu to'], [/금 휴관/g, 'Suljettu pe'], [/토 휴관/g, 'Suljettu la'], [/일 휴관/g, 'Suljettu su'],
        [/항시 개방/g, 'Aina avoinna'], [/야외/g, 'Ulkona'], [/동절기/g, 'Talvi'], [/하계/g, 'Kesä'],
        [/도보/g, 'kävellen'], [/차량/g, 'autolla'], [/시내/g, 'keskusta'], [/인근/g, 'lähellä'],
        [/에서/g, ':sta'], [/시간/g, 't'], [/분/g, 'min'],
    ],
    sv: [
        [/무료/g, 'Gratis'], [/성인/g, 'Vuxen'], [/어린이/g, 'Barn'], [/학생/g, 'Student'],
        [/매일/g, 'Dagligen'], [/예약제/g, 'Bokning krävs'], [/예약 필수/g, 'Bokning krävs'],
        [/기부 환영/g, 'Donationer välkomna'],
        [/월 휴관/g, 'Stängt mån'], [/화 휴관/g, 'Stängt tis'], [/수 휴관/g, 'Stängt ons'],
        [/목 휴관/g, 'Stängt tor'], [/금 휴관/g, 'Stängt fre'], [/토 휴관/g, 'Stängt lör'], [/일 휴관/g, 'Stängt sön'],
        [/항시 개방/g, 'Alltid öppet'], [/야외/g, 'Utomhus'], [/동절기/g, 'Vinter'], [/하계/g, 'Sommar'],
        [/도보/g, 'till fots'], [/차량/g, 'med bil'], [/시내/g, 'centrum'], [/인근/g, 'i närheten'],
        [/에서/g, ' från'], [/시간/g, 't'], [/분/g, 'min'],
    ],
    et: [
        [/무료/g, 'Tasuta'], [/성인/g, 'Täiskasvanu'], [/어린이/g, 'Laps'], [/학생/g, 'Üliõpilane'],
        [/매일/g, 'Iga päev'], [/예약제/g, 'Ettetellimisel'], [/예약 필수/g, 'Broneering vajalik'],
        [/기부 환영/g, 'Annetused teretulnud'],
        [/월 휴관/g, 'Suletud E'], [/화 휴관/g, 'Suletud T'], [/수 휴관/g, 'Suletud K'],
        [/목 휴관/g, 'Suletud N'], [/금 휴관/g, 'Suletud R'], [/토 휴관/g, 'Suletud L'], [/일 휴관/g, 'Suletud P'],
        [/항시 개방/g, 'Alati avatud'], [/야외/g, 'Väljas'], [/동절기/g, 'Talv'], [/하계/g, 'Suvi'],
        [/도보/g, 'jalgsi'], [/차량/g, 'autoga'], [/시내/g, 'kesklinn'], [/인근/g, 'lähedal'],
        [/에서/g, '-st'], [/시간/g, 't'], [/분/g, 'min'],
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
 * Translate common Korean words in visitorInfo values
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
