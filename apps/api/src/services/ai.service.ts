import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key',
});

export interface AIRecommendation {
  topic: string;
  recommendation: string;
  priority: string;
}

export const aiService = {
  async generateRecommendations(weakTopics: { topic: string; score: number; total: number }[], certName: string): Promise<AIRecommendation[]> {
    if (!weakTopics || weakTopics.length === 0) {
      return [];
    }

    const topicsString = weakTopics.map(t => `${t.topic} (${t.score}%)`).join(', ');

    const prompt = `System: You are a study advisor for tech certification students.

A student just completed a ${certName} mock exam.
Weak areas (scored below 70%): ${topicsString}

For each weak area, recommend 1 specific study resource:
- Exact Microsoft Learn module name, or
- Specific documentation section, or
- Named book chapter

Return ONLY a JSON array with objects containing: { "topic": "...", "recommendation": "...", "priority": "High/Medium/Low" }. Be specific, not generic. Do not include markdown fences, just raw JSON.`;

    try {
      if (process.env.ANTHROPIC_API_KEY) {
        const message = await anthropic.messages.create({
          max_tokens: 1024,
          model: 'claude-3-5-sonnet-20241022',
          messages: [{ role: 'user', content: prompt }]
        });

        const textResponse = (message.content[0] as any).text;
        
        // Strip possible markdown JSON fences if the model adds them despite instructions
        let cleanJson = textResponse.trim();
        if (cleanJson.startsWith('```json')) cleanJson = cleanJson.replace(/```json/g, '');
        if (cleanJson.startsWith('```')) cleanJson = cleanJson.replace(/```/g, '');
        cleanJson = cleanJson.trim();

        return JSON.parse(cleanJson);
      } else {
        // Mock response if no API key is provided
        return weakTopics.map((t, i) => ({
          topic: t.topic,
          recommendation: `Read official documentation chapter for ${t.topic} to improve your ${t.score}% score.`,
          priority: t.score < 50 ? 'High' : 'Medium'
        }));
      }
    } catch (error) {
      console.error('Failed to generate AI recommendations', error);
      // Fallback
      return weakTopics.map(t => ({
        topic: t.topic,
        recommendation: `Review ${t.topic} fundamentals.`,
        priority: 'Medium'
      }));
    }
  },

  async markTheoryAnswers(
    questions: any[],
    studentAnswers: Record<string, string>
  ): Promise<any[]> {
    if (!questions || questions.length === 0) {
      return [];
    }

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

    // If no API key is set, run fallback mock marking immediately
    if (!ANTHROPIC_API_KEY) {
      return questions.map(q => {
        const studentAnswer = studentAnswers[q.id] || "";
        const cleanAnswer = studentAnswer.trim();
        const wordCount = cleanAnswer.split(/\s+/).filter(Boolean).length;
        
        let score = 2;
        let pointsCovered = ["Initial identification of problem"];
        let pointsMissed = ["Detailed procedural steps", "Proper hygiene/sterilization", "Patient safety verification"];
        
        if (wordCount > 100) {
          score = 8;
          pointsCovered = ["Initial identification of problem", "Detailed procedural steps", "Correct clinical assessment"];
          pointsMissed = ["Records entry and documentation"];
        } else if (wordCount > 40) {
          score = 5;
          pointsCovered = ["Initial identification of problem", "Detailed procedural steps"];
          pointsMissed = ["Patient safety verification", "Records entry and documentation"];
        }

        return {
          questionId: q.id,
          score,
          maxScore: 10,
          feedback: `Model Answer Key: ${q.explanation.substring(0, 100)}... Mock Marking: The answer provides ${wordCount} words showing basic comprehension. Ensure you cover all local health policies.`,
          pointsCovered,
          pointsMissed
        };
      });
    }

    // Mark questions in parallel
    const markingPromises = questions.map(async (q) => {
      const studentAnswer = studentAnswers[q.id] || "";
      const markingGuideStr = Array.isArray(q.markingGuide) 
        ? q.markingGuide.join('\n- ') 
        : JSON.stringify(q.markingGuide);

      const prompt = `You are an examiner for the Nigerian CHEW qualifying examination.
Mark this student answer for the following question.

Question: ${q.text}
Model Answer Key Points:
- ${markingGuideStr}
Student Answer: ${studentAnswer}

Score the answer out of 10 based on:
- Accuracy of content (4 marks)
- Completeness of key points (4 marks)  
- Clarity and organisation (2 marks)

Return ONLY valid JSON. Do not include markdown fences, preambles, or introduction.
JSON Structure:
{
  "score": number (0-10),
  "maxScore": 10,
  "feedback": "specific feedback to student in 2-3 sentences",
  "pointsCovered": ["point 1 covered", "point 2 covered"],
  "pointsMissed": ["point missed 1", "point missed 2"]
}`;

      try {
        const message = await anthropic.messages.create({
          max_tokens: 1024,
          model: 'claude-3-5-sonnet-20241022',
          messages: [{ role: 'user', content: prompt }]
        });

        const textResponse = (message.content[0] as any).text;
        let cleanJson = textResponse.trim();
        if (cleanJson.startsWith('```json')) cleanJson = cleanJson.replace(/```json/g, '');
        if (cleanJson.startsWith('```')) cleanJson = cleanJson.replace(/```/g, '');
        cleanJson = cleanJson.trim();

        const result = JSON.parse(cleanJson);
        return {
          questionId: q.id,
          score: typeof result.score === 'number' ? result.score : 0,
          maxScore: 10,
          feedback: result.feedback || "Marked by AI system.",
          pointsCovered: Array.isArray(result.pointsCovered) ? result.pointsCovered : [],
          pointsMissed: Array.isArray(result.pointsMissed) ? result.pointsMissed : []
        };
      } catch (error) {
        console.error(`Failed to mark question ${q.id} with AI`, error);
        return {
          questionId: q.id,
          score: 5,
          maxScore: 10,
          feedback: "Marking fallback: AI marking failed due to server rate limit. Please contact support.",
          pointsCovered: ["General response provided"],
          pointsMissed: ["System failed to evaluate specific key points"]
        };
      }
    });

    return Promise.all(markingPromises);
  }
};
