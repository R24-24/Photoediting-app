import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const Footer: React.FC = () => {
    const { t } = useTranslation();

    return (
        <footer className="bg-base-200/50 backdrop-blur-sm p-4 shadow-inner mt-8">
            <div className="container mx-auto text-center text-gray-400 text-sm">
                <div className="flex justify-center items-center gap-6">
                    <div className="flex items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <span>{t('footer.phone')}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span>{t('footer.address')}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
