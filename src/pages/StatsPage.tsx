import React, { useCallback, useEffect, useState } from 'react';
import { Pie, Radar, Bar } from 'react-chartjs-2';
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
    CategoryScale,
    LinearScale,
    BarElement,
    Title as ChartTitle,
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
    Filler,
    CategoryScale,
    LinearScale,
    BarElement,
    ChartTitle
);

const StatsPage: React.FC = () => {
    const [pieChartData, setPieChartData] = useState<any>(null);
    const [radarChartData, setRadarChartData] = useState<any>(null);
    const [barWeightChartData, setBarWeightChartData] = useState<any>(null);
    const [barSizeChartData, setBarSizeChartData] = useState<any>(null);
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

                const weightByDate: {
                    [date: string]: { [category: string]: number };
                } = {};
                const sizeByDate: {
                    [date: string]: { [size: string]: number };
                } = {};

                stats.forEach(stat => {
                    const category = stat.category;
                    const date = stat.date;

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

                    if (!weightByDate[date]) {
                        weightByDate[date] = {};
                    }
                    if (!weightByDate[date][category]) {
                        weightByDate[date][category] = 0;
                    }
                    weightByDate[date][category] += stat.count * weight;

                    if (!sizeByDate[date]) {
                        sizeByDate[date] = { Small: 0, Big: 0 };
                    }
                    const sizeLabel =
                        stat.size === TaskSize.BIG ? 'Big' : 'Small';
                    sizeByDate[date][sizeLabel] += stat.count;
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

                const sortedDates = Object.keys(weightByDate).sort();
                const categories = Array.from(
                    new Set(stats.map(stat => stat.category))
                );

                const weightDatasets = categories.map(category => {
                    const data = sortedDates.map(
                        date => weightByDate[date][category] || 0
                    );
                    return {
                        label: category,
                        data,
                        backgroundColor: getCategoryColor(category),
                    };
                });

                const barWeightData = {
                    labels: sortedDates,
                    datasets: weightDatasets,
                };

                setBarWeightChartData(barWeightData);

                const sizeLabels = ['Small', 'Big'];
                const sizeDatasets = sizeLabels.map(size => {
                    const data = sortedDates.map(
                        date => sizeByDate[date][size] || 0
                    );
                    const color =
                        size === 'Small'
                            ? TAILWIND_COLORS['sky-500']
                            : TAILWIND_COLORS['rose-500'];
                    return {
                        label: size,
                        data,
                        backgroundColor: color,
                    };
                });

                const barSizeData = {
                    labels: sortedDates,
                    datasets: sizeDatasets,
                };

                setBarSizeChartData(barSizeData);
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

    const barOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
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
            x: {
                ticks: {
                    color: isDarkMode ? '#ffffff' : '#000000',
                },
                grid: {
                    color: isDarkMode ? '#4b5563' : '#e5e7eb',
                },
            },
            y: {
                ticks: {
                    color: isDarkMode ? '#ffffff' : '#000000',
                },
                grid: {
                    color: isDarkMode ? '#4b5563' : '#e5e7eb',
                },
            },
        },
    };

    const CustomLegend: React.FC<{ labels: string[]; colors: string[] }> = ({
        labels,
        colors,
    }) => {
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

    return (
        <Layout>
            <Card className={'my-4'}>
                <CardHeader>
                    <CardTitle className="text-gray-800 dark:text-gray-200 text-center">
                        Task statistics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col space-y-8 p-4">
                        <div className="flex flex-row space-x-8 items-stretch">
                            <div className="flex flex-row items-center p-4 border w-full">
                                <div className="flex-1">
                                    <h3 className="text-center text-gray-800 dark:text-gray-200 mb-4">
                                        Task Weights Distribution
                                    </h3>
                                    <div className="chart-container">
                                        {pieChartData && (
                                            <Pie
                                                data={pieChartData}
                                                options={pieOptions}
                                            />
                                        )}
                                    </div>
                                </div>
                                {pieChartData && (
                                    <CustomLegend
                                        labels={pieChartData.labels}
                                        colors={
                                            pieChartData.datasets[0]
                                                .backgroundColor
                                        }
                                    />
                                )}
                            </div>

                            <div className="flex flex-row items-start p-4 border w-full">
                                <div className="flex-1">
                                    <h3 className="text-center text-gray-800 dark:text-gray-200 mb-4">
                                        Task Sizes by Category
                                    </h3>
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
                        </div>

                        <div className="flex flex-row items-start p-4 border w-full">
                            <div className="flex-1">
                                <h3 className="text-center text-gray-800 dark:text-gray-200 mb-4">
                                    Task Weight per Day
                                </h3>
                                <div className="flex-1 h-56">
                                    {barWeightChartData && (
                                        <Bar
                                            data={barWeightChartData}
                                            options={barOptions}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-row items-start p-4 border w-full">
                            <div className="flex-1">
                                <h3 className="text-center text-gray-800 dark:text-gray-200 mb-4">
                                    Task Size per Day
                                </h3>
                                <div className="flex-1 h-56">
                                    {barSizeChartData && (
                                        <Bar
                                            data={barSizeChartData}
                                            options={barOptions}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Layout>
    );
};

export default StatsPage;
