// src/common/entities/dashboard-stats.entity.ts (ou similar)
export interface DashboardStatsEntity {
  totalRevenue: number;
  revenuePercentage: number;
  totalDonations: number;
  donationsPercentage: number;
  newCustomers: number;
  customersPercentage: number;
  pendingAnalysis: number;
  salesHistory: { date: string; amount: number }[];
  recentDonations: { 
    id: string; 
    customer: string; 
    institution: string; 
    amount: number 
  }[];
}