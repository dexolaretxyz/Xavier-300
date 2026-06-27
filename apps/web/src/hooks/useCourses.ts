import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useDomains() {
  return useQuery({
    queryKey: ['domains'],
    queryFn: async () => {
      const { data } = await api.get('/api/domains');
      return data.data;
    },
    enabled: typeof window !== 'undefined',
  });
}

export function useDomain(slug: string) {
  return useQuery({
    queryKey: ['domain', slug],
    queryFn: async () => {
      const { data } = await api.get(`/api/domains/${slug}`);
      return data.data;
    },
    enabled: typeof window !== 'undefined' && !!slug,
  });
}

export function useCertification(slug: string) {
  return useQuery({
    queryKey: ['certifications', slug],
    queryFn: async () => {
      const { data } = await api.get(`/api/domains/certifications/${slug}`);
      return data.data;
    },
    enabled: typeof window !== 'undefined' && !!slug,
  });
}

export function useTodayAttempts(certId: string) {
  return useQuery({
    queryKey: ['exams', 'attempts', 'today', certId],
    queryFn: async () => {
      const { data } = await api.get(`/api/exams/attempts/today?certId=${certId}`);
      return data.data.count as number;
    },
    enabled: typeof window !== 'undefined' && !!certId,
  });
}
