import React, { useState } from 'react';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import { analyzePYQ } from '../services/geminiService';
import { PYQAnalysisResult } from '../types';
import Spinner from './Spinner';
import { marked } from 'marked';

interface PYQAnalysisProps {
  onBack: () => void;
}

const PYQAnalysis: React.FC<PYQAnalysisProps> = ({ onBack }) => {
  const [question, setQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PYQAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!question.trim()) {
      setError('Please enter a question to analyze.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await analyzePYQ(question, userAnswer);
      setAnalysis(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center text-sm font-medium text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300 mb-6">
        <ChevronLeftIcon className="h-4 w-4 mr-1" />
        Back to Prelims Prep
      </button>

      <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-4 dark:text-slate-100">PYQ Analysis Tool</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6">Enter a Previous Year Question to get a detailed breakdown, including topics, explanations, and relevant current affairs.</p>
        <div className="space-y-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Paste the full question here, including all options..."
            className="w-full h-32 p-3 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600"
          />
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Your Answer (optional, e.g., 'A' or 'Option A')"
            className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600"
          />
          <button onClick={handleAnalyze} disabled={isLoading} className="w-full sm:w-auto bg-indigo-600 text-white font-bold py-2 px-6 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 transition duration-300">
            {isLoading ? 'Analyzing...' : 'Analyze Question'}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-6" role="alert">{error}</div>}
      
      {isLoading && <Spinner />}

      {analysis && (
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-lg shadow-md space-y-6">
            <AnalysisSection title="Evaluation" content={analysis.evaluation} />
            <AnalysisSection title="Demand of the Question" content={analysis.demandOfQuestion} />
            
            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 border-b dark:border-slate-600 pb-2 mb-3">Core Topics Involved</h3>
                <div className="flex flex-wrap gap-2">
                    {analysis.topics.map((topic, index) => (
                        <span key={index} className="bg-slate-200 text-slate-700 text-sm font-medium px-3 py-1 rounded-full dark:bg-slate-700 dark:text-slate-300">{topic}</span>
                    ))}
                </div>
            </div>

            <AnalysisSection title="Explanation" content={analysis.explanation} />
            <AnalysisSection title="Extra Information" content={analysis.extraInfo} />

            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 border-b dark:border-slate-600 pb-2 mb-3">Relevant Articles (Last 2 Years)</h3>
                <div className="space-y-4">
                    {analysis.relevantArticles.length > 0 ? analysis.relevantArticles.map((article, index) => (
                        <div key={index} className="border dark:border-slate-700 p-3 rounded-md bg-slate-50 dark:bg-slate-700/50">
                            <a href={article.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300">{article.title}</a>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{article.summary}</p>
                        </div>
                    )) : <p className="text-slate-500 dark:text-slate-400 text-sm">No recent relevant articles found by the AI.</p>}
                </div>
            </div>
            
            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 border-b dark:border-slate-600 pb-2 mb-3">Recommended Topics for Further Study</h3>
                 <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1">
                    {analysis.recommendedTopics.map((topic, index) => (
                        <li key={index}>{topic}</li>
                    ))}
                 </ul>
            </div>

        </div>
      )}
    </div>
  );
};

const AnalysisSection: React.FC<{title: string, content: string}> = ({ title, content }) => (
    <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 border-b dark:border-slate-600 pb-2 mb-3">{title}</h3>
        <div className="prose prose-sm max-w-none text-slate-700 dark:prose-invert" dangerouslySetInnerHTML={{ __html: marked.parse(content) }}/>
    </div>
);


export default PYQAnalysis;