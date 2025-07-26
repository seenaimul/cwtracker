
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../App';
import { ChevronLeftIcon } from '../components/Icons';

export const ThemePage = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const ToggleSwitch = () => (
        <button
            onClick={toggleTheme}
            className={`relative inline-flex items-center h-8 rounded-full w-14 transition-colors ${
                theme === 'dark' ? 'bg-brand-accent' : 'bg-gray-300'
            }`}
        >
            <span
                className={`inline-block w-6 h-6 transform bg-white rounded-full transition-transform ${
                    theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                }`}
            />
        </button>
    );

    return (
        <div className="p-4">
            <header className="flex items-center mb-8 relative">
                <button onClick={() => navigate(-1)} className="p-2 absolute left-0">
                    <ChevronLeftIcon />
                </button>
                <h1 className="text-xl font-bold text-light-text dark:text-white text-center flex-grow">App Theme</h1>
            </header>

            <div className="p-4 rounded-lg bg-light-surface dark:bg-brand-secondary-dark flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold">Dark Mode</h2>
                    <p className="text-sm text-light-text-secondary dark:text-brand-accent-light">
                        {theme === 'dark' ? 'Enabled' : 'Disabled'}
                    </p>
                </div>
                <ToggleSwitch />
            </div>
            
            <div className="mt-8 space-y-4">
                <h3 className="text-lg font-semibold text-light-text dark:text-white">Preview</h3>
                <div className="p-4 rounded-lg bg-light-surface dark:bg-brand-secondary-dark border border-gray-200 dark:border-brand-accent">
                     <h4 className="font-bold text-light-text dark:text-white">This is a Title</h4>
                     <p className="text-light-text-secondary dark:text-brand-accent-light">This is some preview text to see how the theme looks.</p>
                     <button className="mt-4 px-4 py-2 rounded-lg bg-light-accent dark:bg-brand-accent text-white font-semibold">
                        Preview Button
                     </button>
                </div>
            </div>
        </div>
    );
};
