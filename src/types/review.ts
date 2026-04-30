// Shared client-side type for a review document (after DB populate)
export interface ClientReviewUser {
  _id: string;
  name: string;
  email: string;
}

export interface ClientReview {
  _id: string;
  product: string;
  user: ClientReviewUser | null;
  userName?: string;
  userEmail?: string;
  rating: number;
  title?: string;
  body?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

// Shape of the response from GET /api/reviews/[productId]
export interface ReviewsApiResponse {
  reviews: ClientReview[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    "5": number;
    "4": number;
    "3": number;
    "2": number;
    "1": number;
  };
}

// Shape of the eligibility check from GET /api/reviews/can-review
export interface CanReviewApiResponse {
  canReview: boolean;
  hasReviewed: boolean;
}

// Form values for submitting a review
export interface ReviewFormValues {
  rating: number;
  title: string;
  body: string;
  images: string[];
}
