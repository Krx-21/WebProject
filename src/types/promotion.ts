export interface Promotion {
  _id: string;
  title: string;
  description: string;
  discountPercentage: number;
  maxDiscountAmount: number;
  minPurchaseAmount: number;
  startDate: string;
  endDate: string;
  provider?: string;
  createdAt: string;
} 