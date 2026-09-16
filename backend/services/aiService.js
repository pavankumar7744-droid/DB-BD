import { GoogleGenAI, Type } from '@google/genai';

/**
 * Schema defining the exact JSON output expected from Gemini for interview feedback.
 */
const feedbackSchema = {
  type: Type.OBJECT,
  properties: {
    scores: {
      type: Type.OBJECT,
      properties: {
        relevance: { type: Type.INTEGER },
        clarity: { type: Type.INTEGER },
        confidence: { type: Type.INTEGER },
        communication: { type: Type.INTEGER },
        overall: { type: Type.INTEGER },
      },
      required: ['relevance', 'clarity', 'confidence', 'communication', 'overall'],
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    weaknesses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    suggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    improvedAnswerExample: { type: Type.STRING },
  },
  required: ['scores', 'strengths', 'weaknesses', 'suggestions', 'improvedAnswerExample'],
};

/**
 * Fallback heuristic scorer when Gemini API is unavailable or unconfigured.
 */
const generateFallbackFeedback = (question, userAnswer) => {
  const answer = (userAnswer || '').trim();
  const wordCount = answer.split(/\s+/).filter(Boolean).length;
  const idealPoints = question.idealPoints || [];

  // Count matches with ideal points
  const matchedPoints = idealPoints.filter((point) =>
    point.split(' ').some((kw) => kw.length > 3 && answer.toLowerCase().includes(kw.toLowerCase()))
  );

  let relevance = 6;
  let clarity = 6;
  let confidence = 6;
  let communication = 6;

  if (wordCount === 0) {
    relevance = clarity = confidence = communication = 1;
  } else if (wordCount < 15) {
    relevance = 4;
    clarity = 5;
    confidence = 3;
    communication = 4;
  } else if (wordCount > 40) {
    relevance += Math.min(3, matchedPoints.length);
    clarity += 2;
    confidence += 2;
    communication += 2;
  } else {
    relevance += Math.min(2, matchedPoints.length);
    clarity += 1;
  }

  // Cap scores between 1 and 10
  const clamp = (val) => Math.min(10, Math.max(1, val));
  relevance = clamp(relevance);
  clarity = clamp(clarity);
  confidence = clamp(confidence);
  communication = clamp(communication);

  const overall = clamp(Math.round((relevance + clarity + confidence + communication) / 4));

  const strengths = [];
  const weaknesses = [];
  const suggestions = [];

  if (wordCount > 30) {
    strengths.push('Provided a detailed answer with sufficient context.');
  } else if (wordCount > 0) {
    strengths.push('Attempted to answer the prompt directly.');
  } else {
    weaknesses.push('No answer was provided.');
  }

  if (matchedPoints.length > 0) {
    strengths.push(`Addressed core concepts related to ${matchedPoints[0].toLowerCase()}`);
  } else if (idealPoints.length > 0) {
    weaknesses.push(`Missed key technical/behavioral concepts: ${idealPoints.slice(0, 2).join(', ')}.`);
  }

  if (wordCount < 20 && wordCount > 0) {
    weaknesses.push('The response was quite brief and lacked specific examples.');
    suggestions.push('Elaborate with the STAR method (Situation, Task, Action, Result) or concrete code examples.');
  } else {
    suggestions.push('Consider adding specific metrics, outcomes, or trade-off analysis to strengthen your response.');
  }

  const improvedAnswerExample =
    idealPoints.length > 0
      ? `A strong candidate answer would start by framing the core problem, then address: ${idealPoints.join('; ')}. For example: "In my experience, when tackling this scenario, I first evaluate the primary constraints..."`
      : `A strong candidate answer should be structured clearly with a brief context introduction, key technical or action steps taken, and the final measurable outcome achieved.`;

  const fallbackResult = {
    scores: {
      relevance,
      clarity,
      confidence,
      communication,
      overall,
    },
    strengths,
    weaknesses,
    suggestions,
    improvedAnswerExample,
    rawModelOutput: JSON.stringify({ note: 'Generated using local fallback evaluator (Gemini API fallback)' }),
  };

  return fallbackResult;
};

/**
 * Main AI Evaluation function using Google Gemini API (@google/genai package)
 */
export const generateFeedback = async (question, userAnswer) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here' || apiKey.trim() === '') {
    console.error('[aiService] GEMINI_API_KEY is missing or set to placeholder. Falling back to local heuristic feedback engine.');
    return generateFallbackFeedback(question, userAnswer);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Evaluated Question Details:
- Category: ${question.category || 'General'}
- Target Role: ${question.role || 'Software Engineer'}
- Difficulty: ${question.difficulty || 'Medium'}
- Question Text: "${question.text}"
- Ideal Key Points Expected: ${JSON.stringify(question.idealPoints || [])}

Candidate's Submitted Answer:
"${userAnswer || '(No response provided)'}"

Task:
Evaluate the candidate's answer thoroughly and fairly based on the question context and ideal points.
Return a structured JSON evaluation adhering strictly to the response schema. All scores must be integers between 0 and 10.
`;

    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert interview evaluator and career coach. Assess candidate answers for technical depth, clarity, confidence, relevance, and overall communication quality.',
        temperature: 0.4,
        responseMimeType: 'application/json',
        responseSchema: feedbackSchema,
      },
    });

    const rawOutput = response.text;
    console.log('[aiService] Successfully received Gemini API response');

    const parsed = JSON.parse(rawOutput);

    return {
      scores: {
        relevance: Number(parsed.scores?.relevance || 5),
        clarity: Number(parsed.scores?.clarity || 5),
        confidence: Number(parsed.scores?.confidence || 5),
        communication: Number(parsed.scores?.communication || 5),
        overall: Number(parsed.scores?.overall || 5),
      },
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      improvedAnswerExample: parsed.improvedAnswerExample || '',
      rawModelOutput: rawOutput,
    };
  } catch (error) {
    console.error(`[aiService] Gemini API call error: ${error.message}. Triggering fallback evaluation.`);
    return generateFallbackFeedback(question, userAnswer);
  }
};
