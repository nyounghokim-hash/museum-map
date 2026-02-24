export async function translateText(text: string, targetLang: string = 'en'): Promise<string> {
    if (!text) return '';

    // In a real-world scenario, you would use Google Translate API, DeepL, etc.
    // For now, we'll provide a placeholder implementation that simulates translation
    // or you can plug in your API key here.

    try {
        // Placeholder: If it's Korean, we just return the original text with a prefix 
        // until a real API is integrated. 
        // 
        // To use a real API (e.g., Google Cloud Translate):
        // const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=YOUR_API_KEY`, {
        //     method: 'POST',
        //     body: JSON.stringify({ q: text, target: targetLang })
        // });
        // const data = await res.json();
        // return data.data.translations[0].translatedText;

        console.log(`[Translate] No translation API configured, returning original text for ${targetLang}: ${text.substring(0, 20)}...`);

        // No API key configured — return original text without any prefix
        return text;

    } catch (err) {
        console.error('Translation error:', err);
        return text;
    }
}
