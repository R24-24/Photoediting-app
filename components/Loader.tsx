import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface LoaderProps {
    loadingType: 'image' | 'video';
}

const Loader: React.FC<LoaderProps> = ({ loadingType = 'image' }) => {
    const { t } = useTranslation();

    const imageMessages = [
        t('loader.image.1'),
        t('loader.image.2'),
        t('loader.image.3'),
        t('loader.image.4'),
        t('loader.image.5'),
    ];
    
    const videoMessages = [
        t('loader.video.1'),
        t('loader.video.2'),
        t('loader.video.3'),
        t('loader.video.4'),
        t('loader.video.5'),
    ];

    const messages = loadingType === 'video' 
        ? videoMessages 
        : imageMessages;

    const [message, setMessage] = React.useState(messages[0]);

    React.useEffect(() => {
        setMessage(messages[0]); // Reset to first message on type change
        const intervalId = setInterval(() => {
            setMessage(prev => {
                const currentIndex = messages.indexOf(prev);
                const nextIndex = (currentIndex + 1) % messages.length;
                return messages[nextIndex];
            });
        }, 4000); 

        return () => clearInterval(intervalId);
    }, [messages]);

  const isVideoProcess = loadingType === 'video';

  return (
    <div className="text-center animate-fade-in">
        <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-base-300 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-brand-primary border-l-brand-primary rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-lg font-semibold text-gray-300 transition-opacity duration-500">{message}</p>
        {isVideoProcess && <p className="text-sm text-gray-400 mt-2">{t('loader.video.subtitle')}</p>}
    </div>
  );
};

export default Loader;
