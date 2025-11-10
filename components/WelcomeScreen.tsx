
import React from 'react';
import BookOpenIcon from './icons/BookOpenIcon';
import EditIcon from './icons/EditIcon';

interface WelcomeScreenProps {
  onSelectPrelims: () => void;
  onSelectMains: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectPrelims, onSelectMains }) => {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Welcome, Nayana!</h2>
      <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">Choose your preparation module to begin your journey towards success in the Civil Services Examination.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <OptionCard
          title="Prelims Prep"
          description="Analyze current affairs from key sources and test your knowledge with AI-generated quizzes."
          icon={<BookOpenIcon className="h-12 w-12 text-blue-500" />}
          onClick={onSelectPrelims}
        />
        <OptionCard
          title="Mains Prep"
          description="Structure your answers, create comprehensive notes, and get AI-based evaluation for mains."
          icon={<EditIcon className="h-12 w-12 text-indigo-500" />}
          onClick={onSelectMains}
        />
      </div>
    </div>
  );
};

interface OptionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const OptionCard: React.FC<OptionCardProps> = ({ title, description, icon, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg hover:shadow-xl dark:hover:shadow-blue-500/20 transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 text-left flex flex-col items-center text-center"
  >
    <div className="mb-4">{icon}</div>
    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
    <p className="text-slate-600 dark:text-slate-300 flex-grow">{description}</p>
    <span className="mt-6 font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
      Start Now &rarr;
    </span>
  </button>
);

export default WelcomeScreen;