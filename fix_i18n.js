const fs = require('fs');

const file = 'src/lib/i18n.ts';
let content = fs.readFileSync(file, 'utf8');

// 1. Extract all keys from TranslationKeys type
const typeMatch = content.match(/type TranslationKeys = {([^}]*)};/s);
if (!typeMatch) {
    console.error("Could not find type TranslationKeys");
    process.exit(1);
}

// 2. We extract the ones that exist right now in the file. Wait, what about the keys missing from TranslationKeys?
const allMissingKeys = [
    "collections.autoRouteDesc",
    "collections.collectionPublished",
    "collections.curatedBy",
    "collections.generateAutoRoute",
    "collections.planTrip",
    "collections.publishCollection",
    "collections.share",
    "collections.shareSuccess",
    "feedback.error",
    "feedback.placeholder",
    "feedback.send",
    "feedback.sending",
    "feedback.subtitle",
    "feedback.success",
    "feedback.title",
    "nav.feedback",
    "plans.confirmEndTrip",
    "plans.confirmSave",
    "plans.dragReorder",
    "plans.endTrip",
    "plans.est",
    "plans.generating",
    "plans.noRouteData",
    "plans.noStops",
    "plans.reviewAutoRoute",
    "plans.reviewAutoRouteDesc",
    "plans.routeItinerary",
    "plans.saveButton",
    "plans.saving",
    "plans.startingDate",
    "plans.startTripButton",
    "plans.tripEnded",
    "plans.tripTitle",
    "plans.tripTitlePlaceholder",
    "review.exceedLimit",
    "review.lines",
    "review.placeholder",
    "review.submit",
    "review.submitting",
    "review.subtitle",
    "review.threeLineReview",
    "review.title",
];

// Append missing keys to TranslationKeys type
let typeBlock = typeMatch[1];
let newKeysExtracted = [];
allMissingKeys.forEach(k => {
    if (!typeBlock.includes(`'${k}': string;`)) {
        typeBlock += `    '${k}': string;\n`;
        newKeysExtracted.push(k);
    }
});

content = content.replace(typeMatch[1], typeBlock);

const allKeysArr = [...typeBlock.matchAll(/'([^']+)'/g)].map(m => m[1]);

// 3. For each language object, ensure it has ALL keys
const locales = ['en', 'ko', 'ja', 'de', 'fr', 'es', 'pt', 'zh-CN', 'zh-TW'];

for (const locale of locales) {
    const localeRegex = new RegExp(`${locale === 'zh-CN' || locale === 'zh-TW' ? `'${locale}'` : locale}:\\s*{([^}]*)}`, 'g');

    content = content.replace(localeRegex, (match, body) => {
        let newBody = body;
        allKeysArr.forEach(key => {
            if (!newBody.includes(`'${key}':`)) {
                // Remove formatting errors if it missed comma on last
                if (newBody.trim() && !newBody.trim().endsWith(',')) {
                    newBody = newBody.replace(/([^\s,])(\s*)$/, "$1,$2");
                }
                newBody += `        '${key}': '${key}',\n`;
            }
        });
        return `${locale === 'zh-CN' || locale === 'zh-TW' ? `'${locale}'` : locale}: {${newBody}}`;
    });
}

fs.writeFileSync(file, content, 'utf8');
console.log("Updated i18n safely.");
