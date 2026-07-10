import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key',
});

export interface AIRecommendation {
  topic: string;
  recommendation: string;
  priority: string;
}

export interface TheoryQuestion {
  id: string;
  text: string;
  markingGuide?: any;
}

export interface TheoryScore {
  score: number;
  maxScore: number;
  feedback: string;
  pointsCovered: string[];
  pointsMissed: string[];
}

async function markSingleAnswer(
  question: string,
  markingGuide: string, 
  studentAnswer: string,
  maxScore: number = 10
): Promise<TheoryScore> {
  const cleanAnswer = studentAnswer?.trim() || ''
  
  if (cleanAnswer.length < 10) {
    return {
      score: 0,
      maxScore,
      feedback: 'No meaningful answer provided.',
      pointsCovered: [],
      pointsMissed: ['No answer submitted']
    }
  }
  
  const wordCount = cleanAnswer.split(/\s+/).length
  if (wordCount < 3) {
    return {
      score: 0,
      maxScore,
      feedback: 'Answer is too short to evaluate. Please provide a detailed response.',
      pointsCovered: [],
      pointsMissed: ['Insufficient answer provided']
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY || '';
  if (!apiKey) {
    // Fallback mock marking for local development if no API key is present
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
      score: Math.min(score, maxScore),
      maxScore,
      feedback: `Mock Marking (Local Dev): The answer provides ${wordCount} words.`,
      pointsCovered,
      pointsMissed
    };
  }
  
  let attempts = 0
  const maxAttempts = 3
  
  while (attempts < maxAttempts) {
    try {
      if (attempts > 0) {
        await new Promise(resolve => 
          setTimeout(resolve, 2000 * attempts)
        )
      }
      
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `You are a CHEW exam examiner.
          
Question: ${question}

Marking Guide (key points): ${markingGuide}

Student Answer: "${studentAnswer}"

Score this answer out of ${maxScore} marks.
Be strict — random text, nonsense, or very short answers should score 0.

Return ONLY valid JSON:
{
  "score": <number 0-${maxScore}>,
  "feedback": "<2-3 sentences of specific feedback>",
  "pointsCovered": ["<point 1>", "<point 2>"],
  "pointsMissed": ["<point 1>", "<point 2>"]
}`
        }]
      })
      
      const content = response.content[0]
      if (content.type === 'text') {
        const clean = content.text
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim()
        const result = JSON.parse(clean)
        return {
          score: Math.min(result.score, maxScore),
          maxScore,
          feedback: result.feedback,
          pointsCovered: result.pointsCovered || [],
          pointsMissed: result.pointsMissed || []
        }
      }
      
    } catch (error: any) {
      attempts++
      console.error(`[AI MARKING] Attempt ${attempts} failed:`, error?.message)
      
      if (attempts >= maxAttempts) {
        return {
          score: 0,
          maxScore,
          feedback: 'AI marking temporarily unavailable. Score set to 0. Please contact support to request a re-mark.',
          pointsCovered: [],
          pointsMissed: ['AI evaluation failed after 3 attempts']
        }
      }
    }
  }
  
  return {
    score: 0,
    maxScore,
    feedback: 'Marking failed. Score set to 0.',
    pointsCovered: [],
    pointsMissed: []
  }
}

async function markAllTheoryAnswers(
  questions: TheoryQuestion[],
  studentAnswers: Record<string, string>
): Promise<any[]> {
  const results: any[] = []
  
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i]
    const answer = studentAnswers[question.id] || ''
    
    console.log(`[AI MARKING] Marking question ${i+1} of ${questions.length}`)
    
    const markingGuideStr = Array.isArray(question.markingGuide) 
      ? question.markingGuide.join('\n- ') 
      : JSON.stringify(question.markingGuide);

    const result = await markSingleAnswer(
      question.text,
      markingGuideStr || '',
      answer,
      10
    )
    
    results.push({
      questionId: question.id,
      ...result
    })
    
    if (i < questions.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  return results
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
    return markAllTheoryAnswers(questions, studentAnswers);
  }
};
