const fs = require('fs');

const file = 'src/lib/i18n.ts';
let content = fs.readFileSync(file, 'utf8');

const newKeysTypeStr = `
    'global.networkError': string;
    'global.saveError': string;
    'plans.saveError': string;
    'collections.selectPlan': string;
};`;

content = content.replace('};', newKeysTypeStr);

const translations = {
    en: {
        'global.networkError': "Network error",
        'global.saveError': "Failed to save",
        'plans.saveError': "Failed to save plan.",
        'collections.selectPlan': "Select a plan to turn into a collection"
    },
    ko: {
        'global.networkError': "네트워크 오류",
        'global.saveError': "저장 실패",
        'plans.saveError': "경로 저장에 실패했습니다.",
        'collections.selectPlan': "컬렉션으로 만들 경로를 선택해주세요"
    },
    ja: {
        'global.networkError': "ネットワークエラー",
        'global.saveError': "保存に失敗しました",
        'plans.saveError': "プランの保存に失敗しました。",
        'collections.selectPlan': "コレクションを作成するプランを選択してください"
    },
    de: {
        'global.networkError': "Netzwerkfehler",
        'global.saveError': "Speichern fehlgeschlagen",
        'plans.saveError': "Plan konnte nicht gespeichert werden.",
        'collections.selectPlan': "Wählen Sie einen Plan aus, um eine Sammlung zu erstellen"
    },
    fr: {
        'global.networkError': "Erreur réseau",
        'global.saveError': "Échec de la sauvegarde",
        'plans.saveError': "Échec de l'enregistrement du plan.",
        'collections.selectPlan': "Sélectionnez un plan à transformer en collection"
    },
    es: {
        'global.networkError': "Error de red",
        'global.saveError': "Error al guardar",
        'plans.saveError': "Error al guardar el plan.",
        'collections.selectPlan': "Selecciona un plan para convertirlo en colección"
    },
    pt: {
        'global.networkError': "Erro de rede",
        'global.saveError': "Falha ao salvar",
        'plans.saveError': "Falha ao salvar o plano.",
        'collections.selectPlan': "Selecione um plano para transformar em coleção"
    },
    'zh-CN': {
        'global.networkError': "网络错误",
        'global.saveError': "保存失败",
        'plans.saveError': "路线保存失败。",
        'collections.selectPlan': "选择要转为收藏的路线"
    },
    'zh-TW': {
        'global.networkError': "網絡錯誤",
        'global.saveError': "儲存失敗",
        'plans.saveError': "路線儲存失敗。",
        'collections.selectPlan': "選擇要轉為收藏的路線"
    }
};

for (const [locale, keys] of Object.entries(translations)) {
    const localeMatch = new RegExp(`(${locale}:\\s*{[\\s\\S]*?)(\\n\\s*},?\\n)`, 'm');
    const newKeysStr = Object.entries(keys).map(([k, v]) => `        '${k}': '${v.replace(/'/g, "\\'")}',`).join('\n');
    content = content.replace(localeMatch, `$1\n${newKeysStr}$2`);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Injected missing translations.');
