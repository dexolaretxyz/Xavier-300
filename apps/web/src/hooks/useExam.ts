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
    // Poll every 4 seconds if:
    // - MCQ: weakTopics exist but aiRecommendations not yet generated
    // - Theory: theoryScores not yet filled by AI marking
    refetchInterval: (query) => {
      const attempt = query.state?.data?.attempt;
      if (attempt) {
        // Theory exam: keep polling until theoryScores are populated
        const hasTheoryAnswers = attempt.theoryAnswers && Object.keys(attempt.theoryAnswers as object).length > 0;
        const hasTheoryScores = attempt.theoryScores && Object.keys(attempt.theoryScores as object).length > 0;
        if (hasTheoryAnswers && !hasTheoryScores) {
          return 4000;
        }

        // MCQ: poll until AI recommendations arrive
        const hasWeakTopics = attempt.weakTopics?.length > 0;
        const noRecommendationsYet = !attempt.aiRecommendations || attempt.aiRecommendations.length === 0;
        if (hasWeakTopics && noRecommendationsYet) {
          return 4000;
        }
      }
      return false; // Stop polling
    },
  });
}
