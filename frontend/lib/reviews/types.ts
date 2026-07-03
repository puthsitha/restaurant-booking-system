export interface ReviewUser {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface Review {
  id: string;
  restaurantId: string;
  userId: string;
  user: ReviewUser;
  rating: number;
  text: string | null;
  ownerReply: string | null;
  repliedAt: string | null;
  createdAt: string;
}

export interface ListReviewsResponse {
  items: Review[];
  total: number;
  average: number;
  countByRating: Record<number, number>;
}
