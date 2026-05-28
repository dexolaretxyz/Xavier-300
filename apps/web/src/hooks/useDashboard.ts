import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface DashboardStats {
  examsTakenThisWeek: number;
  averageScore: number;
  currentStreak: number;
  rank: number | null;
  recentCertifications: any[];
  weakAreas: any[];
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/api/users/me/stats');
      return data.data as DashboardStats;
    },
  });
}
