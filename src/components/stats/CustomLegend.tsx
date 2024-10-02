import React from 'react';
import { useIsDarkMode } from 'src/components/hooks/useIsDarkMode';

interface CustomLegendProps {
    labels: string[];
    colors: string[];
}

const CustomLegend: React.FC<CustomLegendProps> = ({ labels, colors }) => {
    const isDarkMode = useIsDarkMode();
    return (
        <div className="flex flex-col justify-start space-y-2 ml-4">
            {labels.map((label, index) => (
                <div key={index} className="flex items-center space-x-2">
                    <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: colors[index] }}
                    ></span>
                    <span
                        className="text-sm"
                        style={{
                            color: isDarkMode ? '#ffffff' : '#000000',
                        }}
                    >
                        {label}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default CustomLegend;
