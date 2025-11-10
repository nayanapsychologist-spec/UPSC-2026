import React, { useState, useEffect, useRef } from 'react';
import { generateScaffoldForMains, evaluateMainsTextNotes } from '../services/geminiService';
import { NoteScaffoldSection, EvaluationResult } from '../types';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ClockIcon from './icons/ClockIcon';
import Spinner from './Spinner';
import SparklesIcon from './icons/SparklesIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import { marked } from 'marked';

type Stage = 'setup' | 'writing' | 'evaluating' | 'results';

const getInitialScaffold = (): { [key: string]: NoteScaffoldSection } => ({
    introduction: { title: 'Introduction', prompt: 'Generate 2-3 compelling introduction hooks (quotes, data facts, or crisp definitions)', content: null, isLoading: false, userInput: '' },
    data: { title: 'Relevant Data & Examples', prompt: 'Provide relevant data from reputed sources, recent reports, or key example case studies', content: null, isLoading: false, userInput: '' },
    body: { title: 'Body', prompt: 'Brainstorm key points for the body. Include subheadings like "Features", "Constitutional Provisions", "Pros & Cons", and "Challenges"', content: null, isLoading: false, userInput: '' },
    diagrams: { title: 'Diagram Ideas', prompt: 'Suggest 2-3 ideas for diagrams, flowcharts, or mind maps that can be used to visually represent key information', content: null, isLoading: false, userInput: '' },
    steps: { title: 'Steps Taken', prompt: 'List the steps or initiatives taken by the government or other relevant bodies', content: null, isLoading: false, userInput: '' },
    wayForward: { title: 'Way Forward & Conclusion', prompt: 'Suggest points for a balanced and futuristic way forward and a concluding summary', content: null, isLoading: false, userInput: '' },
});

const MainsNoteMaker: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [stage, setStage] = useState<Stage>('setup');
    const [topic, setTopic] = useState('');
    const [timeLimit, setTimeLimit] = useState(15);
    const [timeLeft, setTimeLeft] = useState(0);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    // Fix: Explicitly type the state to ensure correct type inference for scaffoldData's values.
    const [scaffoldData, setScaffoldData] = useState<{ [key: string]: NoteScaffoldSection }>(getInitialScaffold());
    const [error, setError] = useState<string | null>(null);
    const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
    const [showFinalNotes, setShowFinalNotes] = useState(false);
    const printableRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let timer: number;
        if (stage === 'writing' && timeLeft > 0) {
            timer = window.setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (stage === 'writing' && timeLeft === 0) {
            alert("Time's up! Please proceed to evaluate your notes.");
            handleEvaluate();
        }
        return () => clearTimeout(timer);
    }, [stage, timeLeft]);

    const handleStart = () => {
        if (topic.trim()) {
            setTimeLeft(timeLimit * 60);
            setStage('writing');
            setCurrentStepIndex(0);
            setScaffoldData(getInitialScaffold());
            setEvaluationResult(null);
            setError(null);
            setShowFinalNotes(false);
        } else {
            alert('Please enter a topic.');
        }
    };

    const handleGenerate = async (key: string) => {
        setScaffoldData(prev => ({ ...prev, [key]: { ...prev[key], isLoading: true, content: null } }));
        setError(null);
        try {
            const result = await generateScaffoldForMains(topic, scaffoldData[key].prompt);
            setScaffoldData(prev => ({ ...prev, [key]: { ...prev[key], content: result, isLoading: false } }));
        } catch (e: any) {
            setError(e.message);
            setScaffoldData(prev => ({ ...prev, [key]: { ...prev[key], isLoading: false } }));
        }
    };
    
    const handleEvaluate = async () => {
        setStage('evaluating');
        setError(null);
        const compiledNotes = Object.values(scaffoldData)
            // Fix: Explicitly type `section` to avoid `unknown` type from `Object.values`.
            .map((section: NoteScaffoldSection) => `## ${section.title}\n\n${section.userInput}`)
            .join('\n\n---\n\n');
        
        try {
            const result = await evaluateMainsTextNotes(topic, compiledNotes);
            setEvaluationResult(result);
            setStage('results');
        } catch (e: any) {
            setError(e.message);
            setStage('writing'); // Go back to writing if eval fails
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (showFinalNotes && evaluationResult) {
        // Fix: Explicitly type `s` to avoid `unknown` type from `Object.values`.
        const fullNotes = Object.values(scaffoldData).filter((s: NoteScaffoldSection) => s.userInput.trim() !== '');
        return (
            <div>
                <button onClick={() => setShowFinalNotes(false)} className="flex items-center text-sm font-medium text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300 mb-6 no-print">
                    <ChevronLeftIcon className="h-4 w-4 mr-1" />
                    Back to Evaluation Results
                </button>
                <div id="printable-area" ref={printableRef}>
                    <h2 className="text-3xl font-bold mb-2">Final Notes</h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">Topic: <span className="font-semibold">{topic}</span></p>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Main notes column */}
                        <div className="lg:col-span-3 space-y-4">
                            <h3 className="text-xl font-bold border-b pb-2 mb-4">Your Compiled Notes</h3>
                            <div className="prose max-w-none dark:prose-invert">
                               {fullNotes.length > 0 ? fullNotes.map((item) => (
                                    <div key={item.title} className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-600">
                                        <h4 className="font-bold text-lg">{item.title}</h4>
                                        <div dangerouslySetInnerHTML={{ __html: marked.parse(item.userInput) }} />
                                    </div>
                                )) : <p>No notes were written.</p>}
                            </div>
                        </div>

                        {/* Additional content column */}
                        <div className="lg:col-span-2">
                            <div className="sticky top-4">
                               <h3 className="text-xl font-bold border-b pb-2 mb-4">AI Suggestions & Additional Content</h3>
                                <div className="prose max-w-none p-4 bg-purple-50 rounded-lg border border-purple-200 dark:bg-purple-900/40 dark:border-purple-600 dark:prose-invert">
                                    <div dangerouslySetInnerHTML={{ __html: marked.parse(evaluationResult.additionalContent) }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        switch (stage) {
            case 'setup':
                return (
                    <div className="text-center max-w-lg mx-auto">
                        <h2 className="text-2xl font-bold mb-4">Mains Note Making Tool</h2>
                        <p className="text-slate-600 dark:text-slate-300 mb-6">Enter a topic and set a timer to start your focused, step-by-step note-making session.</p>
                        <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Artificial Intelligence and its impact" className="w-full p-3 border border-slate-300 rounded-md shadow-sm mb-4 bg-white text-slate-800 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600" />
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <label htmlFor="timeLimit" className="font-medium">Time Limit:</label>
                            <select id="timeLimit" value={timeLimit} onChange={(e) => setTimeLimit(parseInt(e.target.value))} className="p-2 border border-slate-300 rounded-md shadow-sm bg-white text-slate-800 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600">
                                <option value={15}>15 minutes</option>
                                <option value={20}>20 minutes</option>
                                <option value={25}>25 minutes</option>
                            </select>
                        </div>
                        <button onClick={handleStart} className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-md hover:bg-blue-700 transition duration-300">Start Session</button>
                    </div>
                );
            case 'writing':
                const stepKeys = Object.keys(scaffoldData);
                const currentKey = stepKeys[currentStepIndex];
                const currentItem = scaffoldData[currentKey];
                const progress = ((currentStepIndex + 1) / stepKeys.length) * 100;

                return (
                    <div>
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 truncate">Topic: <span className="font-normal">{topic}</span></h2>
                                <div className="flex items-center gap-2 font-mono text-xl font-bold text-blue-600 dark:text-blue-400">
                                    <ClockIcon />
                                    <span>{formatTime(timeLeft)}</span>
                                </div>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                             <p className="text-sm text-right text-slate-500 dark:text-slate-400 mt-1">Step {currentStepIndex + 1} of {stepKeys.length}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* AI Scaffold Section */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                                <h3 className="font-bold mb-2 flex items-center gap-2">
                                    <SparklesIcon/> AI Brainstorming for: {currentItem.title}
                                </h3>
                                <button onClick={() => handleGenerate(currentKey)} disabled={currentItem.isLoading} className="text-sm bg-indigo-100 text-indigo-700 font-semibold py-2 px-4 rounded-md hover:bg-indigo-200 disabled:opacity-50 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900/80">
                                    {currentItem.isLoading ? 'Generating...' : currentItem.content ? 'Regenerate Ideas' : 'Generate Ideas'}
                                </button>
                                {currentItem.isLoading && <Spinner />}
                                {currentItem.content && <div className="prose prose-sm max-w-none mt-4 dark:prose-invert" dangerouslySetInnerHTML={{ __html: marked.parse(currentItem.content) }} />}
                            </div>

                            {/* User Input Section */}
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                                <h3 className="font-bold mb-2">Your Notes for: {currentItem.title}</h3>
                                <textarea
                                    value={currentItem.userInput}
                                    onChange={(e) => setScaffoldData(prev => ({...prev, [currentKey]: {...prev[currentKey], userInput: e.target.value}}))}
                                    placeholder={`Write your notes for the ${currentItem.title.toLowerCase()} here...`}
                                    className="w-full h-64 p-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">You can use Markdown for formatting (e.g., <strong className="font-semibold">**bold text**</strong>).</p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between mt-8">
                            <button onClick={() => setCurrentStepIndex(i => i - 1)} disabled={currentStepIndex === 0} className="bg-slate-500 text-white font-bold py-2 px-6 rounded-md hover:bg-slate-600 disabled:bg-slate-300">Previous</button>
                            {currentStepIndex < stepKeys.length - 1 ? (
                                <button onClick={() => setCurrentStepIndex(i => i + 1)} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700">Next</button>
                            ) : (
                                <button onClick={handleEvaluate} className="bg-green-600 text-white font-bold py-2 px-6 rounded-md hover:bg-green-700">Finish & Evaluate</button>
                            )}
                        </div>
                    </div>
                );
            case 'evaluating':
                return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Evaluating Your Notes...</h2>
                        <p className="text-slate-600 dark:text-slate-300 mb-6">Our AI is analyzing your notes based on UPSC standards. This might take a moment.</p>
                        <Spinner />
                    </div>
                );
            case 'results':
                // Fix: Explicitly type `s` to avoid `unknown` type from `Object.values`.
                const fullNotes = Object.values(scaffoldData).filter((s: NoteScaffoldSection) => s.userInput.trim() !== '');
                return (
                     <div>
                        <div className="flex justify-between items-center mb-6">
                           <h2 className="text-3xl font-bold">Evaluation Results</h2>
                           <button onClick={() => setShowFinalNotes(true)} className="flex items-center gap-2 bg-slate-700 text-white font-semibold py-2 px-4 rounded-md hover:bg-slate-800 no-print">
                                <BookOpenIcon className="h-5 w-5"/> View the Final Notes with comments
                            </button>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md mb-8">
                            <h3 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-slate-600">Topic: {topic}</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                     <h4 className="font-bold text-lg mb-2">Your Compiled Notes:</h4>
                                     <div className="prose prose-sm max-w-none p-4 bg-slate-50 rounded-md border max-h-96 overflow-y-auto dark:bg-slate-700/50 dark:border-slate-600 dark:prose-invert">
                                        {fullNotes.map((item) => (
                                            <div key={item.title}>
                                                <h5 className="font-bold">{item.title}</h5>
                                                <div dangerouslySetInnerHTML={{ __html: marked.parse(item.userInput) }} />
                                            </div>
                                        ))}
                                     </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-2">AI Feedback:</h4>
                                    <div className="space-y-4">
                                        <ResultCard title="Strengths" content={evaluationResult!.strengths} color="green" />
                                        <ResultCard title="Weaknesses" content={evaluationResult!.weaknesses} color="red" />
                                        <ResultCard title="Suggestions for Improvement" content={evaluationResult!.suggestions} color="blue" />
                                        <ResultCard title="Additional Content" content={evaluationResult!.additionalContent} color="purple" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };
    
    return (
        <div>
            <button onClick={stage === 'writing' ? () => setStage('setup') : onBack} className="flex items-center text-sm font-medium text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300 mb-6 no-print">
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                {stage === 'setup' || stage === 'results' ? 'Back to Mains Prep' : 'Cancel Session'}
            </button>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-6" role="alert">{error}</div>}
            <div className="bg-slate-100 dark:bg-slate-800 p-4 md:p-6 rounded-lg shadow-inner">
                {renderContent()}
            </div>
        </div>
    );
};

const ResultCard: React.FC<{title: string, content: string, color: 'green' | 'red' | 'blue' | 'purple'}> = ({title, content, color}) => {
    const colors = {
        green: 'border-green-500 bg-green-50 dark:bg-green-900/40 dark:border-green-600',
        red: 'border-red-500 bg-red-50 dark:bg-red-900/40 dark:border-red-600',
        blue: 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 dark:border-blue-600',
        purple: 'border-purple-500 bg-purple-50 dark:bg-purple-900/40 dark:border-purple-600',
    };
    return (
        <div className={`border-l-4 p-4 rounded-r-lg ${colors[color]}`}>
            <h5 className="font-bold mb-2 dark:text-slate-100">{title}</h5>
            <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{__html: marked.parse(content)}} />
        </div>
    );
};

export default MainsNoteMaker;