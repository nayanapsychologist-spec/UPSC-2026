export interface AnalysisTopic {
  title: string;
  summary: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface UserAnswer {
  question: string;
  selectedAnswer: string;
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
}

export interface NoteScaffoldSection {
    title: string;
    prompt: string;
    content: string | null;
    isLoading: boolean;
    userInput: string;
}

export interface EvaluationResult {
    strengths: string;
    weaknesses: string;
    suggestions: string;
    additionalContent: string;
}

export interface PYQArticle {
  title: string;
  url: string;
  summary: string;
}

export interface PYQAnalysisResult {
  evaluation: string;
  demandOfQuestion: string;
  topics: string[];
  explanation: string;
  extraInfo: string;
  relevantArticles: PYQArticle[];
  recommendedTopics: string[];
}
