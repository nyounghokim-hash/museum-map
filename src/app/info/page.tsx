'use client';
import Link from 'next/link';
import { useApp } from '@/components/AppContext';

const TEXTS: Record<string, {
    title: string; subtitle: string;
    feedback: string; feedbackDesc: string;
    terms: string; termsTitle: string;
    privacy: string; privacyTitle: string;
    sources: string; sourcesTitle: string;
    mapData: string; imageData: string; museumData: string;
    disclaimer: string; disclaimerText: string;
    goFeedback: string;
}> = {
    ko: {
        title: '의견 및 정보',
        subtitle: '서비스 이용에 대한 안내사항입니다.',
        feedback: '의견 보내기',
        feedbackDesc: '서비스 개선을 위한 의견을 보내주세요.',
        terms: '이용약관',
        termsTitle: '서비스 이용약관',
        privacy: '개인정보 처리방침',
        privacyTitle: '개인정보 처리방침',
        sources: '데이터 출처',
        sourcesTitle: '데이터 및 이미지 출처',
        mapData: '지도 데이터: © OpenStreetMap contributors, © CARTO',
        imageData: '이미지 출처: 위키백과(Wikipedia), 각 박물관/미술관 공식 사이트',
        museumData: '박물관 정보: 각 박물관/미술관 공식 사이트 및 공개 데이터',
        disclaimer: '면책 사항',
        disclaimerText: '본 서비스에서 제공하는 박물관/미술관 정보는 참고용이며, 정확한 운영 시간 및 입장료는 각 기관의 공식 사이트를 확인해 주세요. 이미지는 각 출처의 라이선스 정책을 따릅니다.',
        goFeedback: '의견 보내기 →',
    },
    en: {
        title: 'Info & Feedback',
        subtitle: 'Service information and guidelines.',
        feedback: 'Send Feedback',
        feedbackDesc: 'Help us improve the service with your feedback.',
        terms: 'Terms of Service',
        termsTitle: 'Terms of Service',
        privacy: 'Privacy Policy',
        privacyTitle: 'Privacy Policy',
        sources: 'Data Sources',
        sourcesTitle: 'Data & Image Sources',
        mapData: 'Map data: © OpenStreetMap contributors, © CARTO',
        imageData: 'Images: Wikipedia, official museum/gallery websites',
        museumData: 'Museum info: Official museum/gallery websites and public data',
        disclaimer: 'Disclaimer',
        disclaimerText: 'Museum/gallery information provided is for reference only. Please check official websites for accurate hours and admission. Images follow the licensing policies of their respective sources.',
        goFeedback: 'Send Feedback →',
    },
    ja: {
        title: '情報とフィードバック',
        subtitle: 'サービスに関するご案内です。',
        feedback: 'フィードバック',
        feedbackDesc: 'サービス向上のためにご意見をお聞かせください。',
        terms: '利用規約',
        termsTitle: '利用規約',
        privacy: 'プライバシーポリシー',
        privacyTitle: 'プライバシーポリシー',
        sources: 'データソース',
        sourcesTitle: 'データ・画像ソース',
        mapData: '地図データ: © OpenStreetMap contributors, © CARTO',
        imageData: '画像: Wikipedia、各博物館/美術館公式サイト',
        museumData: '博物館情報: 各博物館/美術館公式サイトおよび公開データ',
        disclaimer: '免責事項',
        disclaimerText: '提供する博物館/美術館情報は参考用です。正確な営業時間や入場料は各機関の公式サイトをご確認ください。',
        goFeedback: 'フィードバックへ →',
    },
};

function getTexts(locale: string) {
    if (locale.startsWith('ko')) return TEXTS.ko;
    if (locale.startsWith('ja')) return TEXTS.ja;
    return TEXTS.en;
}

export default function InfoPage() {
    const { locale } = useApp();
    const tx = getTexts(locale);

    return (
        <div className="w-full max-w-[800px] mx-auto px-4 py-6 sm:px-6 sm:py-10 md:px-8 mt-4 sm:mt-8">
            <div className="mb-8 sm:mb-10">
                <h1 className="text-2xl sm:text-3xl font-extrabold dark:text-white">{tx.title}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">{tx.subtitle}</p>
            </div>

            <div className="flex flex-col gap-4">
                {/* Feedback Card */}
                <Link href="/feedback" className="block">
                    <div className="bg-purple-50 dark:bg-purple-900/15 border border-purple-100 dark:border-purple-800/30 rounded-2xl p-5 sm:p-6 hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{tx.feedback}</h2>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 ml-[52px]">{tx.feedbackDesc}</p>
                        <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-3 ml-[52px]">{tx.goFeedback}</p>
                    </div>
                </Link>

                {/* Data Sources Card */}
                <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-5 sm:p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{tx.sourcesTitle}</h2>
                    </div>
                    <div className="space-y-3 ml-[52px]">
                        <div className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">🗺️</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{tx.mapData}</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">🖼️</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{tx.imageData}</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">🏛️</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{tx.museumData}</p>
                        </div>
                    </div>
                </div>

                {/* Terms & Privacy */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-5 sm:p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">{tx.termsTitle}</h2>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed ml-[52px] space-y-2">
                            <p>본 서비스는 개인 프로젝트로 운영되며, 무료로 제공됩니다. 서비스 이용 시 발생하는 모든 데이터는 서비스 개선 목적으로만 사용됩니다.</p>
                            <p>This service is operated as a personal project and provided free of charge. All data generated during use is solely used for service improvement.</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-5 sm:p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">{tx.privacyTitle}</h2>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed ml-[52px] space-y-2">
                            <p>개인정보는 서비스 이용에 필요한 최소한의 정보만 수집하며, 제3자에게 제공하지 않습니다. 소셜 로그인 시 이메일과 프로필 이름만 저장됩니다.</p>
                            <p>We collect minimal personal information necessary for service use and do not share it with third parties. Only email and profile name are stored via social login.</p>
                        </div>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-2xl p-5 sm:p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">{tx.disclaimer}</h2>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed ml-[52px]">{tx.disclaimerText}</p>
                </div>
            </div>
        </div>
    );
}
