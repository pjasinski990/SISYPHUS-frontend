import React, { useCallback, useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
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
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { TAILWIND_COLORS } from 'src/components/library/TailwindColors';

ChartJS.register(ArcElement, ChartTooltip, ChartLegend, ChartDataLabels);

const StatsPage: React.FC = () => {
    const [chartData, setChartData] = useState<any>(null);
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

                stats.forEach(stat => {
                    const weight = stat.size === TaskSize.BIG ? 3 : 1;
                    const category = stat.category;

                    if (!categoryTotals[category]) {
                        categoryTotals[category] = 0;
                    }

                    categoryTotals[category] += stat.count * weight;
                });

                const labels = Object.keys(categoryTotals);
                const values = labels.map(category => categoryTotals[category]);
                const backgroundColors = labels.map(category =>
                    getCategoryColor(category)
                );

                const data = {
                    labels: labels,
                    datasets: [
                        {
                            data: values,
                            backgroundColor: backgroundColors,
                            borderWidth: 0,
                        },
                    ],
                };

                setChartData(data);
            })
            .catch(error => {
                console.error('Error fetching stats:', error);
            });
    }, [getCategoryColor, isDarkMode]);

    const options: ChartOptions<'pie'> = {
        responsive: true,
        plugins: {
            legend: {
                display: false, // Disable default legend
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
                    <div className="flex flex-col lg:flex-row items-center justify-start min-w-[450px]">
                        <div className="chart-container">
                            {chartData && (
                                <Pie data={chartData} options={options} />
                            )}
                        </div>
                        {chartData && (
                            <CustomLegend
                                labels={chartData.labels}
                                colors={chartData.datasets[0].backgroundColor}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>
        </Layout>
    );
};

export default StatsPage;
