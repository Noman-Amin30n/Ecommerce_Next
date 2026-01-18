// Type definitions for admin analytics

export interface ChartData {
  labels: string[];
  data: number[];
  trend: number;
  isPositive: boolean;
}

export interface SalesAnalytics extends ChartData {
  totalSales: number;
  productId: string;
  productTitle: string;
}

export interface UserAnalytics extends ChartData {
  totalUsers: number;
}

export interface RevenueAnalytics extends ChartData {
  totalRevenue: number;
}

export interface OrderAnalytics extends ChartData {
  totalOrders: number;
}

export interface ProductSearchResult {
  _id: string;
  title: string;
  images: string[];
  price: number;
  createdAt: string;
}

export interface ProductSearchResponse {
  products: ProductSearchResult[];
  hasMore: boolean;
  total: number;
}

export type SalesTimeRange = "today" | "weekly" | "monthly" | "yearly";
export type AnalyticsTimeRange = "daily" | "weekly" | "monthly" | "yearly";
