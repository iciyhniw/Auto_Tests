import { test, expect } from '../../fixtures/test';

/** SM-15. Сторінка відгуків: блоки, Load more, Leave a review веде на авторизацію (ECM-1982). */
test.describe('SM-15 Reviews', { tag: ['@p1', '@smoke'] }, () => {
  test('блоки і Load more', async ({ reviews }) => {
    await reviews.open();
    await expect(reviews.heading).toHaveText(/what people are saying/i);
    for (const section of [reviews.customerMedia, reviews.socialReviews, reviews.youtubeReviews, reviews.userReviews]) {
      await expect(section).toBeVisible();
    }

    const mediaBefore = await reviews.mediaItems.count();
    await reviews.loadMoreMedia.click();
    await expect.poll(() => reviews.mediaItems.count(), { message: 'Load more не додав фото/відео' }).toBeGreaterThan(mediaBefore);

    await reviews.loadMoreReviews.scrollIntoViewIfNeeded();
    const reviewsBefore = await reviews.reviewCards.count();
    await reviews.loadMoreReviews.click();
    await expect.poll(() => reviews.reviewCards.count(), { message: 'Load more reviews не додав відгуки' }).toBeGreaterThan(reviewsBefore);
  });

  test('Leave a review веде на сторінку входу', async ({ page, reviews }) => {
    await reviews.open();
    await reviews.leaveReviewButton.click();
    await page.waitForURL(/\/\/auth\./, { waitUntil: 'commit', timeout: 30_000 });
  });
});
