import React from 'react';

interface LoaderProps {
    loadingType: 'image' | 'video';
}

const Loader: React.FC<LoaderProps> = ({ loadingType = 'image' }) => {
    const imageMessages = [
        "Warming up the AI's creativity...",
        "Mixing digital paints and pixels...",
        "Consulting with the design muses...",
        "Generating a masterpiece...",
        "Finalizing the details...",
    ];
    
    const videoMessages = [
        "Setting up the digital film crew...",
        "Animating your scene frame by frame...",
        "This can take a minute, great art needs patience!",
        "Rendering the video sequence...",
        "Adding the final touches to your animation...",
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
        {isVideoProcess && <p className="text-sm text-gray-400 mt-2">Video generation is a complex process and may take a few minutes.</p>}
    </div>
  );
};

export default Loader;