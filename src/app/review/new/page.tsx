'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GlassPanel } from '@/components/ui/glass';
import { useApp } from '@/components/AppContext';

function ReviewCreateForm() {
  const { locale, t } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const museumId = searchParams.get('museumId');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Call Review API
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ museumId, content, photos: [] }) // Skipping photo upload logic for MVP mock
    });
    // Automatically flag as visited as part of review creation (UI/UX logic)
    await fetch('/api/visited', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ museumId })
    });
    setLoading(false);
    alert(locale === 'ko' ? '리뷰가 등록되었으며 지도에 방문 표시가 완료되었습니다!' : 'Review Submitted & Museum marked as Visited!');
    router.push(`/museums/${museumId}`);
  };
  const lines = content.split('\n');
  const lineCount = lines.length;
  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 mt-6 sm:mt-10">
      <GlassPanel className="p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-gray-900 dark:text-white">
          {t('review.title', locale) || 'Write a Review'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 border-b border-gray-100 dark:border-neutral-800 pb-4">
          {t('review.subtitle', locale) || 'Share your experience. Keep it concise.'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                {t('review.threeLineReview', locale) || 'Your 3-Line Review'}
              </label>
              <span className={`text-xs font-semibold ${lineCount > 3 ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
                {lineCount} / 3 {t('review.lines', locale) || 'lines'}
              </span>
            </div>
            <textarea
              required
              rows={4}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={t('review.placeholder', locale) || "1st line... \n2nd line... \n3rd line..."}
              className={`w-full p-4 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-gray-900 dark:text-white resize-none ${lineCount > 3 ? 'border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:ring-red-500' : 'border-gray-200 dark:border-neutral-700'}`}
            />
            {lineCount > 3 && <p className="text-xs text-red-500 mt-2">{t('review.exceedLimit', locale) || 'You have exceeded the 3-line limit.'}</p>}
          </div>
          <button
            type="submit"
            disabled={lineCount > 3 || loading}
            className="w-full bg-black text-white dark:bg-white dark:text-black font-bold py-4 rounded-xl shadow-lg hover:bg-neutral-800 dark:hover:bg-gray-200 disabled:bg-gray-300 dark:disabled:bg-neutral-700 disabled:text-gray-500 dark:disabled:text-neutral-500 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {loading ? (t('review.submitting', locale) || 'Submitting...') : (t('review.submit', locale) || 'Complete & Submit')}
          </button>
        </form>
      </GlassPanel>
    </div>
  );
}
export default function ReviewCreatePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ReviewCreateForm />
    </Suspense>
  );
}
