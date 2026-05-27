import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types (Ideally from shared types package, defining locally for simplicity)
export interface Domain {
  id: string;
  name: string;
  slug: string;
  certifications?: Certification[];
}

export interface Certification {
  id: string;
  name: string;
  slug: string;
  difficulty: string;
  _count?: { questions: number };
}

export interface DashboardStats {
  examsTakenThisWeek: number;
  averageScore: number;
  currentStreak: number;
  rank: number | null;
  recentCertifications: Certification[];
  weakAreas: any[];
}

// Hooks
export const useDomains = () => {
  return useQuery({
    queryKey: ['domains'],
    queryFn: async () => {
      const { data } = await api.get('/domains');
      return data.data as Domain[];
    }
  });
};

export const useDomain = (slug: string) => {
  return useQuery({
    queryKey: ['domains', slug],
    queryFn: async () => {
      const { data } = await api.get(`/domains/${slug}`);
      return data.data as Domain;
    },
    enabled: !!slug
  });
};

export const useCertification = (slug: string) => {
  return useQuery({
    queryKey: ['certifications', slug],
    queryFn: async () => {
      const { data } = await api.get(`/domains/certifications/${slug}`);
      return data.data as Certification & { domain: Domain };
    },
    enabled: !!slug
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/users/me/stats');
      return data.data as DashboardStats;
    }
  });
};

export const useTodayAttempts = (certId: string) => {
  return useQuery({
    queryKey: ['attempts-today', certId],
    queryFn: async () => {
      const { data } = await api.get(`/exams/attempts/today?certId=${certId}`);
      return data.data.count as number;
    },
    enabled: !!certId
  });
};
