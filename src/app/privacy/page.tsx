'use client';
import { useApp } from '@/components/AppContext';
import { t } from '@/lib/i18n';
import { GlassPanel } from '@/components/ui/glass';

export default function PrivacyPage() {
    const { locale } = useApp();

    return (
        <div className="max-w-4xl mx-auto p-6 sm:p-10 mt-10 mb-20">
            <h1 className="text-3xl font-extrabold mb-8 dark:text-white">{t('legal.privacyTitle', locale)}</h1>
            <GlassPanel className="p-8 space-y-6 text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300">
                <p>{t('legal.effectiveDate', locale)}</p>
                <p>{t('legal.privacyController', locale)}</p>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">{t('legal.privacy.s1.title', locale)}</h2>
                    <p>{t('legal.privacy.s1.content', locale)}</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">{t('legal.privacy.s2.title', locale)}</h2>
                    <p>{t('legal.privacy.s2.content', locale)}</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">{t('legal.privacy.s3.title', locale)}</h2>
                    <p>{t('legal.privacy.s3.content', locale)}</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">{t('legal.privacy.s4.title', locale)}</h2>
                    <p>{t('legal.privacy.s4.content', locale)}</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">{t('legal.privacy.s5.title', locale)}</h2>
                    <p>{t('legal.privacy.s5.content', locale)}</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">{t('legal.privacy.s6.title', locale)}</h2>
                    <p>{t('legal.privacy.s6.content', locale)}</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">{t('legal.privacy.s7.title', locale)}</h2>
                    <p>{t('legal.privacy.s7.content', locale)}</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">{t('legal.privacy.s8.title', locale)}</h2>
                    <p>{t('legal.privacy.s8.content', locale)}</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">{t('legal.privacy.s9.title', locale)}</h2>
                    <p>{t('legal.privacy.s9.content', locale)}</p>
                </section>
            </GlassPanel>
        </div>
    );
}
