import { TAILWIND_COLORS } from 'src/components/library/TailwindColors';

export const getCommonChartOptions = (isDarkMode: boolean) => ({
    responsive: true,
    plugins: {
        legend: {
            labels: {
                color: isDarkMode ? '#ffffff' : '#000000',
            },
        },
        tooltip: {
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            borderColor: TAILWIND_COLORS['slate-900'],
            titleColor: isDarkMode ? '#ffffff' : '#000000',
            bodyColor: isDarkMode ? '#ffffff' : '#000000',
        },
    },
});

export const getScalesOptions = (isDarkMode: boolean, chartType: string) => {
    const commonScales = {
        ticks: {
            color: isDarkMode ? '#ffffff' : '#000000',
        },
        grid: {
            color: isDarkMode ? '#4b5563' : '#e5e7eb',
        },
    };
    if (chartType === 'radar') {
        return {
            r: {
                ...commonScales,
                angleLines: {
                    color: isDarkMode ? '#4b5563' : '#e5e7eb',
                },
                pointLabels: {
                    color: isDarkMode ? '#ffffff' : '#000000',
                },
                ticks: {
                    ...commonScales.ticks,
                    backdropColor: 'transparent',
                },
            },
        };
    } else if (chartType === 'bar') {
        return {
            x: commonScales,
            y: commonScales,
        };
    }
    return {};
};
