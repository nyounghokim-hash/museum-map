const fs = require('fs');
const file = './src/lib/i18n.ts';
let content = fs.readFileSync(file, 'utf8');

const correctTranslations = {
    en: {
        'collections.autoRouteDesc': 'Automatically build an optimal route holding the collections you select.',
        'collections.collectionPublished': 'Collection published successfully!',
        'collections.curatedBy': 'Curated by',
        'collections.generateAutoRoute': 'Generate AutoRoute',
        'collections.planTrip': 'Plan Trip',
        'collections.publishCollection': 'Publish Collection',
        'collections.share': 'Share',
        'collections.shareSuccess': 'Link copied to clipboard!',
        'feedback.error': 'Error submitting feedback. Please try again.',
        'feedback.placeholder': 'Tell us what you think...',
        'feedback.send': 'Send Feedback',
        'feedback.sending': 'Sending...',
        'feedback.subtitle': 'Help us improve by sharing your feedback.',
        'feedback.success': 'Thank you! Your feedback has been received.',
        'feedback.title': 'Send Feedback',
        'nav.feedback': 'Feedback',
        'review.exceedLimit': 'You can only upload up to 3 images.',
        'review.lines': 'lines',
        'review.placeholder': 'Write your 3-line review here...',
        'review.submit': 'Submit Review',
        'review.submitting': 'Submitting...',
        'review.subtitle': 'Share your experience in just 3 lines.',
        'review.threeLineReview': 'Your 3-line review',
        'review.title': 'Write a Review',
    },
    ko: {
        'collections.autoRouteDesc': '선택한 컬렉션들을 기반으로 최적화된 경로를 자동 생성합니다.',
        'collections.collectionPublished': '컬렉션이 성공적으로 발행되었습니다!',
        'collections.curatedBy': '큐레이터',
        'collections.generateAutoRoute': '최적 경로 생성',
        'collections.planTrip': '여행 계획하기',
        'collections.publishCollection': '컬렉션 발행하기',
        'collections.share': '공유하기',
        'collections.shareSuccess': '링크가 클립보드에 복사되었습니다!',
        'feedback.error': '의견 전송에 실패했습니다. 다시 시도해주세요.',
        'feedback.placeholder': '여기에 의견을 적어주세요...',
        'feedback.send': '의견 보내기',
        'feedback.sending': '전송 중...',
        'feedback.subtitle': '서비스 개선을 위해 여러분의 소중한 의견을 들려주세요.',
        'feedback.success': '감사합니다! 의견이 성공적으로 접수되었습니다.',
        'feedback.title': '의견 보내기',
        'nav.feedback': '의견 보내기',
        'review.exceedLimit': '이미지는 최대 3장까지만 업로드 가능합니다.',
        'review.lines': '줄',
        'review.placeholder': '여기에 3줄 리뷰를 작성해주세요...',
        'review.submit': '리뷰 등록',
        'review.submitting': '등록 중...',
        'review.subtitle': '당신의 멋진 경험을 3줄로 짧게 공유해주세요.',
        'review.threeLineReview': '나의 3줄 리뷰',
        'review.title': '리뷰 작성하기',
    }
}

// Function to update keys within a specific language block mapping string keys
for (const [lang, translations] of Object.entries(correctTranslations)) {
    // We target the language block
    const langRegex = new RegExp(`^\\s*${lang}:\\s*{[\\s\\S]*?^\\s*},`, 'm');
    content = content.replace(langRegex, (match) => {
        let block = match;
        // inside the block, replace " 'key': 'key', " with " 'key': 'translation', "
        for (const [k, v] of Object.entries(translations)) {
            const keyRegex = new RegExp(`'${k}':\\s*'${k}'`, 'g');
            block = block.replace(keyRegex, `'${k}': '${v.replace(/'/g, "\\'")}'`);
        }
        return block;
    });
}

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed dummy translations mapping for EN and KO.');
