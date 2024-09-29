import React, { useCallback, useEffect, useState } from 'react';
import { Pie, Radar } from 'react-chartjs-2';
import { StatsResponse, statsService } from '../service/statsService';
import { TaskCategory, TaskSize } from '../service/taskService';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from 'src/components/ui/card';
import Layout from 'src/components/Layout';
import { categoryShades } from 'src/components/task/categoryShades';

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip as ChartTooltip,
    Legend as ChartLegend,
    ChartOptions,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { TAILWIND_COLORS } from 'src/components/library/TailwindColors';
import { hexToRgba } from 'src/lib/utils';

ChartJS.register(
    ArcElement,
    ChartTooltip,
    ChartLegend,
    ChartDataLabels,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler
);

const StatsPage: React.FC = () => {
    const [pieChartData, setPieChartData] = useState<any>(null);
    const [radarChartData, setRadarChartData] = useState<any>(null);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

    useEffect(() => {
        const determineTheme = () => {
            if (typeof window !== 'undefined') {
                return document.documentElement.classList.contains('dark');
            }
            return false;
        };
        setIsDarkMode(determineTheme());

        const observer = new MutationObserver(() => {
            setIsDarkMode(determineTheme());
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });
        return () => observer.disconnect();
    }, []);

    const getCategoryColor = useCallback(
        (category: string) => {
            const taskCategory = category.toUpperCase() as TaskCategory;
            const shade = categoryShades[taskCategory];
            const colorKey = isDarkMode ? shade.darkBg : shade.lightIcon;
            return TAILWIND_COLORS[colorKey] || '#8884d8';
        },
        [isDarkMode]
    );

    useEffect(() => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 6);
        endDate.setDate(endDate.getDate() + 1);

        const endDateStr = endDate.toISOString().split('T')[0];
        const startDateStr = startDate.toISOString().split('T')[0];

        statsService
            .getStatsForDateRange(startDateStr, endDateStr)
            .then((stats: StatsResponse[]) => {
                const categoryTotals: { [key: string]: number } = {};

                const radarData: {
                    [key: string]: { small: number; big: number };
                } = {};

                stats.forEach(stat => {
                    const category = stat.category;

                    const weight = stat.size === TaskSize.BIG ? 3 : 1;
                    if (!categoryTotals[category]) {
                        categoryTotals[category] = 0;
                    }
                    categoryTotals[category] += stat.count * weight;

                    if (!radarData[category]) {
                        radarData[category] = { small: 0, big: 0 };
                    }
                    if (stat.size === TaskSize.BIG) {
                        radarData[category].big += stat.count;
                    } else {
                        radarData[category].small += stat.count;
                    }
                });

                const pieLabels = Object.keys(categoryTotals);
                const pieValues = pieLabels.map(
                    category => categoryTotals[category]
                );
                const pieBackgroundColors = pieLabels.map(category =>
                    getCategoryColor(category)
                );

                const pieData = {
                    labels: pieLabels,
                    datasets: [
                        {
                            data: pieValues,
                            backgroundColor: pieBackgroundColors,
                            borderWidth: 0,
                        },
                    ],
                };

                setPieChartData(pieData);

                const radarLabels = Object.keys(radarData);
                const smallTaskValues = radarLabels.map(
                    category => radarData[category].small
                );
                const bigTaskValues = radarLabels.map(
                    category => radarData[category].big
                );

                const smallTasksRadarBg = isDarkMode
                    ? hexToRgba(TAILWIND_COLORS['sky-700'], 0.3)
                    : hexToRgba(TAILWIND_COLORS['sky-500'], 0.3);
                const smallTasksRadarBorder = TAILWIND_COLORS['sky-500'];
                const bigTasksRadarBg = isDarkMode
                    ? hexToRgba(TAILWIND_COLORS['rose-700'], 0.3)
                    : hexToRgba(TAILWIND_COLORS['rose-500'], 0.3);
                const bigTasksRadarBorder = TAILWIND_COLORS['rose-500'];

                const radarDataFormatted = {
                    labels: radarLabels,
                    datasets: [
                        {
                            label: 'SMALL',
                            data: smallTaskValues,
                            backgroundColor: smallTasksRadarBg,
                            borderColor: smallTasksRadarBorder,
                            borderWidth: 1,
                            pointBackgroundColor: smallTasksRadarBorder,
                            fill: true,
                        },
                        {
                            label: 'BIG',
                            data: bigTaskValues,
                            backgroundColor: bigTasksRadarBg,
                            borderColor: bigTasksRadarBorder,
                            borderWidth: 1,
                            pointBackgroundColor: bigTasksRadarBg,
                            fill: true,
                        },
                    ],
                };

                setRadarChartData(radarDataFormatted);
            })
            .catch(error => {
                console.error('Error fetching stats:', error);
            });
    }, [getCategoryColor, isDarkMode]);

    const pieOptions: ChartOptions<'pie'> = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                borderColor: TAILWIND_COLORS['slate-900'],
                titleColor: isDarkMode ? '#ffffff' : '#000000',
                bodyColor: isDarkMode ? '#ffffff' : '#000000',
            },
            datalabels: {
                color: isDarkMode ? '#ffffff' : '#000000',
                anchor: 'end',
                align: 'start',
                offset: 6,
                clip: false,
                formatter: (value: number, context: any) => {
                    const total = context.dataset.data.reduce(
                        (acc: number, val: number) => acc + val,
                        0
                    );
                    const percentage = (value / total) * 100;
                    const threshold = 3;
                    if (percentage < threshold) {
                        return null;
                    }
                    return `${percentage.toFixed(0)}% / ${value}w`;
                },
                textAlign: 'left',
                backgroundColor: isDarkMode
                    ? 'rgba(0, 0, 0, 0.4)'
                    : 'rgba(0, 0, 0, 0.1)',
                borderRadius: 4,
                padding: 6,
            },
        },
        layout: {
            autoPadding: true,
        },
    };

    const radarOptions: ChartOptions<'radar'> = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
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
        scales: {
            r: {
                angleLines: {
                    color: isDarkMode ? '#4b5563' : '#e5e7eb',
                },
                grid: {
                    color: isDarkMode ? '#4b5563' : '#e5e7eb',
                },
                ticks: {
                    backdropColor: 'transparent',
                    color: isDarkMode ? '#ffffff' : '#000000',
                },
                pointLabels: {
                    color: isDarkMode ? '#ffffff' : '#000000',
                },
            },
        },
    };

    const CustomLegend: React.FC<{ labels: string[]; colors: string[] }> = ({
        labels,
        colors,
    }) => {
        return (
            <div className="flex flex-col justify-start space-y-2 ml-8">
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

    return (
        <Layout>
            <Card>
                <CardHeader>
                    <CardTitle className="text-gray-800 dark:text-gray-200 text-center">
                        Task statistics over the last 7 days
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-row min-w-[450px] space-x-8 items-stretch p-4">
                        <div className="flex items-center p-4 border">
                            <div className="chart-container">
                                {pieChartData && (
                                    <Pie
                                        data={pieChartData}
                                        options={pieOptions}
                                    />
                                )}
                            </div>
                            {pieChartData && (
                                <CustomLegend
                                    labels={pieChartData.labels}
                                    colors={
                                        pieChartData.datasets[0].backgroundColor
                                    }
                                />
                            )}
                        </div>

                        <div className="flex items-center p-4 border">
                            <div className="w-80 h-80">
                                {radarChartData && (
                                    <Radar
                                        data={radarChartData}
                                        options={radarOptions}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Layout>
    );
};

export default StatsPage;
