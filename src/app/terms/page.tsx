'use client';
import { useApp } from '@/components/AppContext';
import { t } from '@/lib/i18n';
import { GlassPanel } from '@/components/ui/glass';

export default function TermsPage() {
    const { locale } = useApp();

    return (
        <div className="max-w-4xl mx-auto p-6 sm:p-10 mt-10 mb-20">
            <h1 className="text-3xl font-extrabold mb-8 dark:text-white">서비스 이용약관</h1>
            <GlassPanel className="p-8 space-y-6 text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300">
                <p>시행일자: 2024.02.23</p>
                <p>서비스명: Global Museum Map (이하 “서비스”)</p>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">제1조(목적)</h2>
                    <p>이 약관은 운영자가 제공하는 서비스의 이용과 관련하여 운영자와 이용자 간의 권리·의무 및 책임사항, 기타 필요한 사항을 정함을 목적으로 합니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">제2조(정의)</h2>
                    <p>“회원”이란 본 약관에 동의하고 계정을 생성하여 서비스를 이용하는 자를 말합니다.</p>
                    <p>“비회원”이란 회원가입 없이 서비스를 이용하는 자를 말합니다.</p>
                    <p>“콘텐츠”란 서비스 내 게시물(리뷰/댓글/이미지/텍스트), 블로그 글, 이용자가 저장한 목록(좋아요/컬렉션), 서비스가 제공하는 정보(미술관 정보/링크/지도/추천)를 포함합니다.</p>
                    <p>“외부 데이터”란 Google Places, 지도 서비스, 광고 네트워크 등 제3자가 제공하는 데이터/콘텐츠를 말합니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">제3조(약관의 효력 및 변경)</h2>
                    <p>운영자는 본 약관을 서비스 내 게시하거나 기타 방법으로 공지합니다.</p>
                    <p>운영자가 약관을 변경하는 경우, 적용일자 및 변경사유를 명시하여 적용일자 7일 전(회원에게 불리하거나 중대한 변경은 30일 전)부터 공지합니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">제4조(서비스 제공 및 변경)</h2>
                    <p>운영자는 미술관/박물관 정보 검색, 지도 기반 탐색, 저장/컬렉션, 리뷰 게시, 전시 링크 제공, 블로그 콘텐츠 제공, 광고 노출 등의 기능을 제공합니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">제5조(회원가입 및 계정)</h2>
                    <p>회원가입은 이용자가 약관 및 개인정보 처리방침에 동의하고 필요한 정보를 입력한 뒤 운영자가 승인함으로써 성립합니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">제6조(이용자의 의무)</h2>
                    <p>이용자는 다음 행위를 해서는 안 됩니다: 불법/유해정보 게시, 혐오·괴롭힘, 저작권 침해, 비정상적 트래픽 유발 등.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">제7조(게시물/리뷰 등 이용자 콘텐츠)</h2>
                    <p>이용자가 게시한 콘텐츠에 대한 저작권은 이용자에게 귀속됩니다. 운영자는 서비스 운영 및 홍보를 위해 해당 콘텐츠를 이용할 수 있습니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">제8조(외부 데이터/링크 및 광고)</h2>
                    <p>서비스는 외부 사이트 링크 및 Google AdSense 광고를 포함할 수 있습니다. 링크된 사이트의 정확성에 대해 운영자는 보증하지 않습니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">제9조(서비스 이용제한/해지)</h2>
                    <p>약관 위반 시 이용 제한 조치가 가능하며, 이용자는 언제든지 회원탈퇴가 가능합니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">제10조(면책 및 책임 제한)</h2>
                    <p>운영자는 천재지변, 시스템 장애 등 불가항력 시 책임을 지지 않으며, 이용자 간 분쟁에 개입하지 않습니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 dark:text-white">제11조(준거법 및 분쟁해결)</h2>
                    <p>본 약관은 대한민국 법령을 준거법으로 하며, 분쟁은 법령에 따른 관할 법원에서 해결합니다.</p>
                </section>
            </GlassPanel>
        </div>
    );
}
