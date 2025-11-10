import React from 'react';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import EditIcon from './icons/EditIcon';

interface MainsPrepProps {
  onBack: () => void;
  onStartNoteMaker: () => void;
}

const MainsPrep: React.FC<MainsPrepProps> = ({ onBack, onStartNoteMaker }) => {
  return (
    <div>
      <button onClick={onBack} className="flex items-center text-sm font-medium text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300 mb-6 no-print">
        <ChevronLeftIcon className="h-4 w-4 mr-1" />
        Back to Home
      </button>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Mains Preparation Module</h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">Select a tool to begin structuring your answers and improving your writing skills.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <ToolCard
                title="Mains Note Making Tool"
                description="A timed, AI-scaffolded environment to brainstorm and structure your notes on any topic."
                onClick={onStartNoteMaker}
                icon={<EditIcon className="h-10 w-10 text-blue-500" />}
                isActive={true}
            />
             <ToolCard
                title="Mains Evaluation Tool"
                description="Get AI-driven feedback on your written answers by uploading them directly."
                onClick={() => {}}
                icon={<div className="h-10 w-10 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>}
                isActive={false}
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

export default MainsPrep;