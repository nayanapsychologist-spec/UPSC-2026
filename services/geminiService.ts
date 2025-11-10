import { GoogleGenAI, Type, GenerateContentRequest } from "@google/genai";
import { AnalysisTopic, QuizQuestion, EvaluationResult, PYQAnalysisResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;

// A generic helper function that wraps the Gemini API call with retry logic for rate limit errors.
const generateContentWithRetry = async (params: GenerateContentRequest) => {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            return await ai.models.generateContent(params);
        } catch (error: any) {
            const isRateLimitError = error.toString().includes('429') || 
                                     error.toString().includes('RESOURCE_EXHAUSTED');

            if (isRateLimitError) {
                if (attempt === MAX_RETRIES - 1) {
                    console.error("Max retries reached for rate limit error. Failing.", error);
                    throw new Error("The request was blocked due to rate limits. Please wait a moment before trying again.");
                }
                const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
                console.warn(`Rate limit hit. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${MAX_RETRIES})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error("An unhandled API error occurred:", error);
                throw error; // Re-throw other errors immediately
            }
        }
    }
    // This should ideally not be reached, but serves as a fallback.
    throw new Error("API call failed after multiple retries.");
};


export const analyzeSources = async (month: string, year: number): Promise<AnalysisTopic[]> => {
  try {
    const response = await generateContentWithRetry({
      model: "gemini-2.5-flash",
      contents: `Analyze the following sources for ${month} ${year} and extract the most important events, updates, and topics for the UPSC Prelims exam:
      - Press Information Bureau (PIB)
      - Down to Earth Magazine
      - The Hindu Newspaper
      - The Indian Express Newspaper
      - Economic and Political Weekly (EPW)
      - Yojana Magazine
      - Kurukshetra Magazine
      
      For each topic, provide a concise title and a brief, one-paragraph summary explaining its relevance to the UPSC prelims syllabus.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "The concise title of the topic." },
              summary: { type: Type.STRING, description: "A one-paragraph summary of its relevance to UPSC prelims." }
            },
            required: ["title", "summary"]
          }
        }
      }
    });

    if (!response) throw new Error("Received an empty response from the API.");
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error analyzing sources:", error);
    if (error instanceof Error) throw error;
    throw new Error("Failed to analyze sources. Please check the API key and try again.");
  }
};

export const generateQuiz = async (topic: AnalysisTopic): Promise<QuizQuestion[]> => {
  try {
    const response = await generateContentWithRetry({
      model: "gemini-2.5-flash",
      contents: `Based on the following topic and summary, generate a 5-question multiple-choice quiz suitable for the UPSC Prelims exam.
      
      Topic: "${topic.title}"
      Summary: "${topic.summary}"
      
      For each question, focus on a critical aspect, include four plausible options (one correct), and provide the correct answer and a detailed explanation. The incorrect options should target common misconceptions. The output should be markdown formatted.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "The quiz question (markdown formatted)." },
              options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 4 answer options (markdown formatted)." },
              correctAnswer: { type: Type.STRING, description: "The correct answer string from the options." },
              explanation: { type: Type.STRING, description: "Detailed explanation of the correct answer (markdown formatted)." }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });
    
    if (!response) throw new Error("Received an empty response from the API.");
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating quiz:", error);
    if (error instanceof Error) throw error;
    throw new Error("Failed to generate quiz. The content may be restricted or the API is unavailable.");
  }
};

export const generateScaffoldForMains = async (topic: string, prompt: string): Promise<string> => {
    try {
        const fullPrompt = `${prompt} for the topic: "${topic}". Format the output as a markdown list.`;
        const response = await generateContentWithRetry({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
        });
        if (!response) throw new Error("Received an empty response from the API.");
        return response.text;
    } catch (error) {
        console.error("Error generating scaffold:", error);
        if (error instanceof Error) throw error;
        throw new Error("Failed to generate brainstorming content.");
    }
};

export const evaluateMainsTextNotes = async (topic: string, notes: string): Promise<EvaluationResult> => {
    try {
        const prompt = `You are an expert UPSC Mains exam evaluator. A student has prepared notes on the topic: "${topic}".
        Here are their notes:
        ---
        ${notes}
        ---
        
        Evaluate these notes based on standard UPSC criteria (Structure, Content, Relevance, Diverse Perspectives, Use of Data/Examples).
        
        Provide your feedback in the following JSON format. For each section, provide the feedback as a markdown-formatted string. Also include an "additionalContent" section with relevant facts, figures, reports, or perspectives the student may have missed.`;

        const response = await generateContentWithRetry({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        strengths: { type: Type.STRING, description: "Markdown-formatted list of strengths." },
                        weaknesses: { type: Type.STRING, description: "Markdown-formatted list of weaknesses." },
                        suggestions: { type: Type.STRING, description: "Markdown-formatted list of suggestions for improvement." },
                        additionalContent: { type: Type.STRING, description: "Markdown-formatted list of additional data, facts, or perspectives." }
                    },
                    required: ["strengths", "weaknesses", "suggestions", "additionalContent"]
                }
            }
        });
        
        if (!response) throw new Error("Received an empty response from the API.");
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error evaluating notes:", error);
        if (error instanceof Error) throw error;
        throw new Error("Failed to evaluate notes. The content may be restricted or the API is unavailable.");
    }
};

export const analyzePYQ = async (question: string, userAnswer?: string): Promise<PYQAnalysisResult> => {
  try {
    const prompt = `You are an expert UPSC Prelims exam analyst. Analyze the following Previous Year Question (PYQ).

    Question: "${question}"
    ${userAnswer ? `User's Answer: "${userAnswer}"` : ''}

    Provide a comprehensive analysis in the following JSON format:
    1.  evaluation: If a user's answer is provided, evaluate it as "Correct" or "Incorrect" and briefly explain why in markdown. If no answer is provided, state "No answer provided for evaluation.".
    2.  demandOfQuestion: A concise explanation of what the question is asking for, in markdown.
    3.  topics: An array of strings listing the core syllabus topics involved (e.g., "Indian Polity", "Modern History", "Environmental Science").
    4.  explanation: A clear, foundational explanation of the concepts involved, including common confusion points, in markdown.
    5.  extraInfo: Additional, in-depth information relevant to the topic, suitable for a UPSC aspirant, in markdown.
    6.  relevantArticles: An array of objects, each representing a relevant news article from The Times of India, The Indian Express, or The Hindu published in the last two years. Each object should have a 'title', 'url' (a valid https link or a google search link if a direct url is not available), and a one-line 'summary'.
    7.  recommendedTopics: An array of strings suggesting related topics, reports (national and international), or concepts to study for a holistic understanding. For example, if the question is on BRSR, recommend looking into GRI, TCFD, etc.
    `;
    
    const response = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    evaluation: { type: Type.STRING },
                    demandOfQuestion: { type: Type.STRING },
                    topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                    explanation: { type: Type.STRING },
                    extraInfo: { type: Type.STRING },
                    relevantArticles: { 
                        type: Type.ARRAY, 
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                url: { type: Type.STRING },
                                summary: { type: Type.STRING }
                            },
                            required: ["title", "url", "summary"]
                        }
                    },
                    recommendedTopics: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["evaluation", "demandOfQuestion", "topics", "explanation", "extraInfo", "relevantArticles", "recommendedTopics"]
            }
        }
    });

    if (!response) throw new Error("Received an empty response from the API.");
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error analyzing PYQ:", error);
    if (error instanceof Error) throw error;
    throw new Error("Failed to analyze the question. The content may be restricted or the API is unavailable.");
  }
};
