'use client';
import { useApp } from '@/components/AppContext';
import { GlassPanel } from '@/components/ui/glass';

export default function PrivacyPage() {
    const { locale } = useApp();

    return (
        <div className="max-w-4xl mx-auto p-6 sm:p-10 mt-10 mb-20">
            <h1 className="text-3xl font-extrabold mb-8 dark:text-white">개인정보 처리방침</h1>
            <GlassPanel className="p-8 space-y-6 text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300">
                <p>시행일자: 2024.02.23</p>
                <p>개인정보처리자: Global Museum Map 운영팀</p>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">1. 개인정보의 처리 목적</h2>
                    <ul className="list-disc ml-5 space-y-1">
                        <li>회원 가입 및 계정 관리</li>
                        <li>서비스 제공 (저장/리뷰/컬렉션 등)</li>
                        <li>고객 문의 응대 및 품질 개선</li>
                        <li>광고 제공 및 성과 측정 (AdSense 등)</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">2. 처리하는 개인정보 항목</h2>
                    <p>필수: 이메일 또는 소셜 로그인 식별자, 닉네임</p>
                    <p>자동 수집: IP, 쿠키, 브라우저 정보, 이용 기록</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">3. 개인정보의 처리 및 보유 기간</h2>
                    <p>회원 정보: 회원 탈퇴 시까지 (단, 법령에 따른 보존 필요 시 해당 기간 보관)</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">4. 개인정보의 제3자 제공</h2>
                    <p>이용자의 동의가 있거나 법령에 따른 요청이 있는 경우를 제외하고는 제3자에게 제공하지 않습니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">5. 개인정보 처리의 위탁 및 국외 이전</h2>
                    <p>Vercel (호스팅), Google (Maps/AdSense), Serper (데이터) 등 서비스 제공을 위한 외부 API 및 인프라를 활용합니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">6. 개인정보의 파기</h2>
                    <p>목적 달성 후 지체 없이 복구 불가능한 방법으로 파기합니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">7. 정보주체의 권리</h2>
                    <p>언제든지 개인정보 열람, 정정, 삭제 요청이 가능합니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">8. 쿠키 및 맞춤형 광고</h2>
                    <p>맞춤형 광고 제공을 위해 쿠키를 사용하며 브라우저 설정을 통해 거부가 가능합니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">9. 문의처</h2>
                    <p>이메일: [관리자 이메일]</p>
                </section>
            </GlassPanel>
        </div>
    );
}
