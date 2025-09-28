import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

interface HeaderProps {
    onSignOut: () => void;
    showSignOut: boolean;
    tokens: number;
}

const Header: React.FC<HeaderProps> = ({ onSignOut, showSignOut, tokens }) => {
  const { setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <header className="bg-base-200/50 backdrop-blur-sm p-4 shadow-md sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.943 2.943a2 2 0 00-1.886 0L2.943 11.057a2 2 0 000 1.886l8.114 8.114a2 2 0 001.886 0l8.114-8.114a2 2 0 000-1.886L12.943 2.943zM12 17.25a5.25 5.25 0 110-10.5 5.25 5.25 0 010 10.5z" />
                <path d="M12 14.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
            </svg>
            <h1 className="text-2xl font-bold text-white tracking-tight">{t('header.title')} <span className="text-brand-light">AI</span></h1>
        </div>
        <div className="flex items-center gap-4">
            {showSignOut && (
                <div className="flex items-center gap-2 bg-base-300 text-white font-semibold py-2 px-3 rounded-lg" title="Remaining daily tokens">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-bold">{tokens}</span>
                </div>
            )}
            <div className="relative">
                <select 
                    onChange={(e) => setLanguage(e.target.value as 'en' | 'hi' | 'mr')}
                    className="bg-base-300 text-white font-semibold py-2 px-4 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer"
                    defaultValue="en"
                >
                    <option value="en">EN</option>
                    <option value="hi">HI</option>
                    <option value="mr">MR</option>
                </select>
            </div>
            {showSignOut && (
                <button 
                    onClick={onSignOut}
                    className="flex items-center space-x-2 bg-base-300 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 -960 960 960" fill="currentColor">
                        <path d="M160-160v-80h110l-16-14q-52-46-73-105t-21-119q0-111 66.5-197.5T400-790v84q-72 26-116 88.5T240-478q0 45 17 87.5t53 78.5l10 10v-98h80v240H160Zm400-10v-84q72-26 116-88.5T720-482q0-45-17-87.5T650-648l-10-10v98h-80v-240h240v80H690l16 14q49 49 71.5 106.5T800-482q0 111-66.5 197.5T560-170Z"/>
                    </svg>
                    <span>{t('header.sign_out')}</span>
                </button>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;