import React from 'react';
import { ToolType } from '../types';

interface ToolProps {
    // FIX: Replaced JSX.Element with React.ReactElement to resolve namespace error.
    icon: React.ReactElement;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    isActive?: boolean;
    toolId: ToolType;
}

const Tool: React.FC<ToolProps> = ({ icon, label, onClick, disabled, isActive }) => {
    const isDisabled = disabled || !onClick;
    const title = isDisabled && !disabled ? `${label} (Coming Soon)` : label;
    return (
        <button
            title={title}
            onClick={onClick}
            disabled={isDisabled}
            className={`w-full p-3 rounded-lg flex items-center justify-center transition-all duration-200 group relative ${isActive ? 'bg-brand-primary text-white' : 'hover:bg-base-300 text-gray-300'} ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            {icon}
            <span className="absolute left-full ml-3 px-2 py-1 bg-base-100 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {title}
            </span>
        </button>
    );
};


interface ToolboxProps {
    onRemoveBackground: () => void;
    activeTool: ToolType;
    setActiveTool: (tool: ToolType) => void;
    disabled: boolean;
}

const Toolbox: React.FC<ToolboxProps> = ({ onRemoveBackground, activeTool, setActiveTool, disabled }) => {

    const handleToolClick = (toolId: ToolType) => {
        if (toolId === activeTool) {
            setActiveTool('select'); // Toggle off
        } else {
            setActiveTool(toolId);
        }
    };

    const tools: Omit<ToolProps, 'isActive'>[] = [
        {
            toolId: 'magic-edit',
            label: "Magic Edit",
            onClick: () => handleToolClick('magic-edit'),
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.4-c.368.055-.734.055-1.1 0a2.25 2.25 0 01-2.4-2.4 3 3 0 00-1.128-5.78 2.25 2.25 0 010-1.1 3 3 0 001.128-5.78 2.25 2.25 0 012.4-2.4c.368-.055.734-.055 1.1 0 2.25 2.25 0 012.4 2.4 3 3 0 005.78 1.128c.055.368.055.734 0 1.1a3 3 0 00-5.78 1.128 2.25 2.25 0 010 1.1zM12 15a3 3 0 100-6 3 3 0 000 6z" /></svg>,
        },
        {
            toolId: 'select',
            label: "Remove Background",
            onClick: onRemoveBackground,
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12L12 14.25m-2.25-2.25L12 12m0 0L9.75 9.75M12 12l2.25-2.25M12 12L9.75 14.25m9-3l-3-3m0 0l-3 3m3-3v12.75m-2.25-14.25L12 3m0 0L9.75 5.25M12 3v12.75" /></svg>,
        },
        { toolId: 'select', label: 'divider', icon: <></>},
        {
            toolId: 'crop',
            label: "Crop & Resize",
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
        },
        {
            toolId: 'adjust',
            label: "Adjust Colors",
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>,
        },
        {
            toolId: 'text',
            label: "Text",
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H16.5M12 3.75V16.5M12 16.5L9.75 12M12 16.5L14.25 12" /></svg>,
        },
        {
            toolId: 'filter',
            label: "Add Filter",
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12.983 1.835l.386 1.159a1.125 1.125 0 002.162 0l.386-1.159M18.37 3.37a1.125 1.125 0 011.591 1.591l-1.159.386a1.125 1.125 0 000 2.162l1.159.386a1.125 1.125 0 01-1.59 1.592l-1.159-.386a1.125 1.125 0 00-2.162 0l-.386 1.159M12.983 1.835a1.125 1.125 0 00-1.966 0l-.386 1.159a1.125 1.125 0 01-2.162 0L8.08 1.835a1.125 1.125 0 00-1.966 0l-.386 1.159a1.125 1.125 0 01-2.162 0L3.18 1.835a1.125 1.125 0 00-1.966 0l-.386 1.159a1.125 1.125 0 01-2.162 0L-.33 1.835" transform="translate(6.33 9.33)"/></svg>,
        },
    ];

    return (
        <div className="flex lg:flex-col items-center gap-2 p-2 bg-base-300 rounded-lg">
           {tools.map((tool, index) => {
                if (tool.label === 'divider') {
                    return <div key={index} className="w-full h-[1px] bg-base-200 my-1"></div>
                }
                return (
                    <Tool 
                        key={tool.toolId + index}
                        {...tool}
                        disabled={disabled || (!tool.onClick && tool.toolId !== 'magic-edit')}
                        isActive={activeTool === tool.toolId}
                    />
                )
           })}
        </div>
    );
}

export default Toolbox;