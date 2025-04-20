export interface Promotion {
  _id: string;
  title: string;
  description: string;
  discountPercentage: number;
  maxDiscountAmount: number;
  minPurchaseAmount: number;
  startDate: string;
  endDate: string;
  provider?: string | { _id: string; name: string; }; 
  amount: number; 
  createdAt: string;
}