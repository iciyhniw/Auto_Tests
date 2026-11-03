import type { Locator, Page } from '@playwright/test';
import { waitForHydration } from '../utils/hydration';

/** Сторінка /reviews (pages/reviews). */
export class ReviewsPage {
  readonly heading: Locator;
  readonly customerMedia: Locator;
  readonly socialReviews: Locator;
  readonly youtubeReviews: Locator;
  readonly userReviews: Locator;
  readonly mediaItems: Locator;
  readonly loadMoreMedia: Locator;
  readonly reviewCards: Locator;
  readonly loadMoreReviews: Locator;
  readonly leaveReviewButton: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 });
    this.customerMedia = page.locator('section.user-content');
    this.socialReviews = page.locator('section.social-reviews');
    this.youtubeReviews = page.locator('section.new-era-review');
    this.userReviews = page.locator('section.user-reviews');
    this.mediaItems = this.customerMedia.locator('img, video');
    this.loadMoreMedia = this.customerMedia.getByRole('button', { name: 'Load more', exact: true });
    this.reviewCards = this.userReviews.locator('.review-card').filter({ visible: true });
    this.loadMoreReviews = this.userReviews.getByRole('button', { name: 'Load more reviews' });
    this.leaveReviewButton = this.userReviews.getByRole('button', { name: 'Leave a review' });
  }

  async open(): Promise<void> {
    await this.page.goto('/reviews');
    await waitForHydration(this.page);
  }
}
