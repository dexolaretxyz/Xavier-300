import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useExamResults(attemptId: string) {
  return useQuery({
    queryKey: ['examResults', attemptId],
    queryFn: async () => {
      const { data } = await api.get(`/api/exams/${attemptId}/results`);
      return data.data; // { attempt, questions }
    },
    enabled: !!attemptId,
    // Poll every 3 seconds IF weakTopics exist but aiRecommendations is empty
    refetchInterval: (query) => {
      const attempt = query.state?.data?.attempt;
      if (attempt) {
        const hasWeakTopics = attempt.weakTopics?.length > 0;
        const noRecommendationsYet = !attempt.aiRecommendations || attempt.aiRecommendations.length === 0;
        if (hasWeakTopics && noRecommendationsYet) {
          return 3000;
        }
      }
      return false; // Stop polling
    },
  });
}
