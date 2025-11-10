import React, { useState, useMemo } from 'react';
import { analyzeSources, generateQuiz } from '../services/geminiService';
import { AnalysisTopic, QuizQuestion } from '../types';
import Spinner from './Spinner';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import QuizModal from './QuizModal';
import PYQAnalysis from './PYQAnalysis';
import BookOpenIcon from './icons/BookOpenIcon';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon';

type PrelimsTool = 'hub' | 'currentAffairs' | 'pyq';

const PrelimsPrep: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTool, setActiveTool] = useState<PrelimsTool>('hub');
  
  // State for Current Affairs Analyzer
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisTopic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeQuizTopic, setActiveQuizTopic] = useState<AnalysisTopic | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState<boolean>(false);
  const [quizData, setQuizData] = useState<QuizQuestion[]>([]);
  const [quizError, setQuizError] = useState<string | null>(null);

  const months = useMemo(() => [
    { value: '01', name: 'January' }, { value: '02', name: 'February' },
    { value: '03', name: 'March' }, { value: '04', name: 'April' },
    { value: '05', name: 'May' }, { value: '06', name: 'June' },
    { value: '07', name: 'July' }, { value: '08', name: 'August' },
    { value: '09', name: 'September' }, { value: '10', name: 'October' },
    { value: '11', name: 'November' }, { value: '12', name: 'December' }
  ], []);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  const handleAnalyze = async () => {
    setLoadingAnalysis(true);
    setError(null);
    setAnalysisResults([]);
    try {
      const selectedMonthName = months.find(m => m.value === month)?.name || '';
      const results = await analyzeSources(selectedMonthName, year);
      setAnalysisResults(results);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleTakeQuiz = async (topic: AnalysisTopic) => {
    setActiveQuizTopic(topic);
    setLoadingQuiz(true);
    setQuizError(null);
    setQuizData([]);
    try {
        const quiz = await generateQuiz(topic);
        setQuizData(quiz);
    } catch(e: any) {
        setQuizError(e.message);
    } finally {
        setLoadingQuiz(false);
    }
  }

  const closeQuizModal = () => {
    setActiveQuizTopic(null);
    setQuizData([]);
    setQuizError(null);
  }

  if (activeTool === 'pyq') {
    return <PYQAnalysis onBack={() => setActiveTool('hub')} />;
  }

  if (activeTool === 'currentAffairs') {
    return (
      <div>
         <button onClick={() => setActiveTool('hub')} className="flex items-center text-sm font-medium text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300 mb-6">
          <ChevronLeftIcon className="h-4 w-4 mr-1" />
          Back to Prelims Prep
        </button>
  
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4 dark:text-slate-100">Current Affairs Browser</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">Select a month and year to scan key sources for important UPSC prelims topics.</p>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full sm:w-auto p-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 dark:border-slate-600">
              {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
            </select>
            <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="w-full sm:w-auto p-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 dark:border-slate-600">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={handleAnalyze} disabled={loadingAnalysis} className="w-full sm:w-auto bg-blue-600 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition duration-300">
              {loadingAnalysis ? 'Analyzing...' : 'Analyze Sources'}
            </button>
          </div>
        </div>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-6" role="alert">{error}</div>}
        
        {loadingAnalysis && <Spinner />}
  
        {analysisResults.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold dark:text-slate-100">Key Topics for {months.find(m => m.value === month)?.name} {year}</h3>
            {analysisResults.map((topic, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">{topic.title}</h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">{topic.summary}</p>
                <button
                  onClick={() => handleTakeQuiz(topic)}
                  className="bg-green-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-600 transition duration-300 text-sm">
                  Assess My Knowledge
                </button>
              </div>
            ))}
          </div>
        )}
  
        {activeQuizTopic && (
          <QuizModal
            topic={activeQuizTopic}
            quizData={quizData}
            loading={loadingQuiz}
            error={quizError}
            onClose={closeQuizModal}
          />
        )}
      </div>
    );
  }

  // Render Hub
  return (
    <div>
      <button onClick={onBack} className="flex items-center text-sm font-medium text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300 mb-6 no-print">
        <ChevronLeftIcon className="h-4 w-4 mr-1" />
        Back to Home
      </button>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Prelims Preparation Module</h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">Select a tool to begin your targeted prelims practice.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <ToolCard
                title="Current Affairs Browser"
                description="Analyze key sources by month and test your knowledge with AI-generated quizzes."
                onClick={() => setActiveTool('currentAffairs')}
                icon={<BookOpenIcon className="h-10 w-10 text-blue-500" />}
                isActive={true}
            />
             <ToolCard
                title="PYQ Analysis Tool"
                description="Get a deep, AI-powered analysis of any Previous Year Question."
                onClick={() => setActiveTool('pyq')}
                icon={<QuestionMarkCircleIcon className="h-10 w-10 text-indigo-500" />}
                isActive={true}
            />
        </div>
      </div>
    </div>
  );
};

interface ToolCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    isActive: boolean;
}
  
const ToolCard: React.FC<ToolCardProps> = ({ title, description, icon, onClick, isActive }) => (
    <button
      onClick={isActive ? onClick : undefined}
      className={`bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg text-left flex flex-col items-center text-center transition-all duration-300 ease-in-out ${isActive ? 'hover:shadow-xl dark:hover:shadow-blue-500/20 transform hover:-translate-y-1 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
      disabled={!isActive}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-300 flex-grow text-sm">{description}</p>
      <span className={`mt-6 font-semibold  transition-colors ${isActive ? 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300' : 'text-slate-400'}`}>
        {isActive ? 'Start Now →' : 'Coming Soon'}
      </span>
    </button>
);

export default PrelimsPrep;