import { IReview } from "@/models/review";

/**
 * Calculate average rating and rating distribution for a set of reviews
 */
export function calculateRatingStats(reviews: IReview[]) {
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: {
        "5": 0,
        "4": 0,
        "3": 0,
        "2": 0,
        "1": 0,
      },
    };
  }

  // Calculate average rating (precise decimal)
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = parseFloat((totalRating / reviews.length).toFixed(2));

  // Calculate rating distribution
  const distribution = {
    "5": 0,
    "4": 0,
    "3": 0,
    "2": 0,
    "1": 0,
  };

  reviews.forEach((review) => {
    const roundedRating = roundRating(review.rating);
    distribution[roundedRating.toString() as keyof typeof distribution]++;
  });

  return {
    averageRating,
    totalReviews: reviews.length,
    ratingDistribution: distribution,
  };
}

/**
 * Round a rating to the nearest whole number (1-5)
 * e.g., 4.7 -> 5, 3.2 -> 3, 2.5 -> 3
 */
export function roundRating(rating: number): number {
  return Math.round(rating);
}
