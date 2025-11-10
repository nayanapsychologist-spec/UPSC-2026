import React, { useState, useEffect } from 'react';
import { AnalysisTopic, QuizQuestion, UserAnswer } from '../types';
import Spinner from './Spinner';
import { marked } from 'marked';

interface QuizModalProps {
  topic: AnalysisTopic;
  quizData: QuizQuestion[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ topic, quizData, loading, error, onClose }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Prevent scrolling on the body when the modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  
  const handleAnswerSelect = (option: string) => {
    setSelectedAnswer(option);
  };
  
  const handleNextQuestion = () => {
    if (selectedAnswer) {
      const currentQuestion = quizData[currentQuestionIndex];
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      
      setUserAnswers([...userAnswers, {
        question: currentQuestion.question,
        selectedAnswer,
        isCorrect,
        correctAnswer: currentQuestion.correctAnswer,
        explanation: currentQuestion.explanation,
      }]);

      setSelectedAnswer(null);

      if (currentQuestionIndex < quizData.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setShowResults(true);
      }
    }
  };

  const score = userAnswers.filter(a => a.isCorrect).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Quiz: {topic.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Test your understanding of this key topic.</p>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 font-bold text-2xl">&times;</button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          {loading && <Spinner />}
          {error && <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>}

          {!loading && !error && quizData.length > 0 && !showResults && (
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Question {currentQuestionIndex + 1} of {quizData.length}</p>
              <div className="prose prose-lg max-w-none mb-4 dark:prose-invert" dangerouslySetInnerHTML={{ __html: marked.parse(quizData[currentQuestionIndex].question) }} />
              <div className="space-y-3">
                {quizData[currentQuestionIndex].options.map((option, index) => (
                  <button 
                    key={index} 
                    onClick={() => handleAnswerSelect(option)}
                    className={`w-full text-left p-3 border rounded-md transition-colors ${selectedAnswer === option ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-500 dark:bg-blue-900/50 dark:border-blue-500' : 'bg-white border-slate-300 hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600'}`}
                  >
                    <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: marked.parse(option) }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && !error && showResults && (
            <div>
                <h3 className="text-2xl font-bold text-center mb-4 dark:text-slate-100">Quiz Results</h3>
                <p className="text-center text-lg mb-6 dark:text-slate-300">You scored <span className="font-bold text-blue-600 dark:text-blue-400">{score}</span> out of <span className="font-bold">{quizData.length}</span></p>
                <div className="space-y-6">
                    {userAnswers.map((answer, index) => (
                        <div key={index} className={`p-4 rounded-md border ${answer.isCorrect ? 'bg-green-50 border-green-300 dark:bg-green-900/40 dark:border-green-700' : 'bg-red-50 border-red-300 dark:bg-red-900/40 dark:border-red-700'}`}>
                            <div className="font-semibold prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: marked.parse(`${index+1}. ${answer.question}`) }} />
                            <p className={`text-sm mt-2 ${answer.isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                                Your answer: {answer.selectedAnswer} {answer.isCorrect ? ' (Correct)' : ' (Incorrect)'}
                            </p>
                            {!answer.isCorrect && <p className="text-sm mt-1 text-green-700 dark:text-green-300">Correct answer: {answer.correctAnswer}</p>}
                            <div className="text-sm mt-3 text-slate-600 bg-slate-100 dark:bg-slate-700/50 p-2 rounded prose prose-sm max-w-none dark:prose-invert">
                                <strong className="font-bold">Explanation:</strong>
                                <div dangerouslySetInnerHTML={{ __html: marked.parse(answer.explanation) }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
          {!showResults && quizData.length > 0 && (
             <button
                onClick={handleNextQuestion}
                disabled={!selectedAnswer || loading}
                className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition duration-300"
              >
              {currentQuestionIndex < quizData.length - 1 ? 'Next Question' : 'Finish & See Results'}
            </button>
          )}
           {showResults && (
             <button
                onClick={onClose}
                className="w-full bg-slate-600 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-700 transition duration-300"
              >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;