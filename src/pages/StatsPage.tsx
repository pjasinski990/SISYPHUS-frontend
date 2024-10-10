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
import { useIsDarkMode } from 'src/components/hooks/useIsDarkMode';
import CustomLegend from 'src/components/stats/CustomLegend';
import {
    getCommonChartOptions,
    getScalesOptions,
} from 'src/components/stats/chartOptions';

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
    const isDarkMode = useIsDarkMode();

    const [pieChartData, setPieChartData] = useState<any>(null);
    const [radarChartData, setRadarChartData] = useState<any>(null);
    const [barWeightChartData, setBarWeightChartData] = useState<any>(null);
    const [barSizeChartData, setBarSizeChartData] = useState<any>(null);

    const getCategoryColor = useCallback(
        (category: string) => {
            const taskCategory = category.toUpperCase() as TaskCategory;
            const shade = categoryShades[taskCategory];
            const colorKey = isDarkMode ? shade.darkBg : shade.lightIcon;
            return TAILWIND_COLORS[colorKey] || '#8884d8';
        },
        [isDarkMode]
    );

    const getTaskSizeColors = useCallback(
        (isDarkMode: boolean) => ({
            smallTasksRadarBg: isDarkMode
                ? hexToRgba(TAILWIND_COLORS['sky-700'], 0.3)
                : hexToRgba(TAILWIND_COLORS['sky-500'], 0.3),
            smallTasksRadarBorder: TAILWIND_COLORS['sky-500'],
            bigTasksRadarBg: isDarkMode
                ? hexToRgba(TAILWIND_COLORS['rose-700'], 0.3)
                : hexToRgba(TAILWIND_COLORS['rose-500'], 0.3),
            bigTasksRadarBorder: TAILWIND_COLORS['rose-500'],
        }),
        []
    );

    const preparePieChartData = useCallback(
        (categoryTotals: { [key: string]: number }) => {
            const pieLabels = Object.keys(categoryTotals);
            const pieValues = pieLabels.map(
                category => categoryTotals[category]
            );
            const pieBackgroundColors = pieLabels.map(category =>
                getCategoryColor(category)
            );

            return {
                labels: pieLabels,
                datasets: [
                    {
                        data: pieValues,
                        backgroundColor: pieBackgroundColors,
                        borderWidth: 0,
                    },
                ],
            };
        },
        [getCategoryColor]
    );

    const prepareRadarChartData = useCallback(
        (radarData: { [key: string]: { small: number; big: number } }) => {
            const radarLabels = Object.keys(radarData);
            const smallTaskValues = radarLabels.map(
                category => radarData[category].small
            );
            const bigTaskValues = radarLabels.map(
                category => radarData[category].big
            );

            const {
                smallTasksRadarBg,
                smallTasksRadarBorder,
                bigTasksRadarBg,
                bigTasksRadarBorder,
            } = getTaskSizeColors(isDarkMode);

            return {
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
        },
        [getTaskSizeColors, isDarkMode]
    );

    const prepareBarChartData = useCallback(
        (
            dataByDate: { [date: string]: { [key: string]: number } },
            stats: StatsResponse[],
            keyType: 'category' | 'size',
            getColor?: (key: string) => string
        ) => {
            const sortedDates = Object.keys(dataByDate).sort();
            let keys: string[] = [];
            if (keyType === 'category') {
                keys = Array.from(new Set(stats.map(stat => stat.category)));
            } else if (keyType === 'size') {
                keys = ['Small', 'Big'];
            }

            const datasets = keys.map(key => {
                const data = sortedDates.map(
                    date => dataByDate[date][key] || 0
                );
                const color =
                    keyType === 'category'
                        ? getColor!(key)
                        : key === 'Small'
                          ? TAILWIND_COLORS['sky-500']
                          : TAILWIND_COLORS['rose-500'];
                return {
                    label: key,
                    data,
                    backgroundColor: color,
                };
            });

            return {
                labels: sortedDates,
                datasets,
            };
        },
        []
    );

    const processStatsData = useCallback(
        (stats: StatsResponse[]) => {
            const categoryTotals: { [key: string]: number } = {};
            const radarData: { [key: string]: { small: number; big: number } } =
                {};
            const weightByDate: {
                [date: string]: { [category: string]: number };
            } = {};
            const sizeByDate: { [date: string]: { [size: string]: number } } =
                {};

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
                const sizeLabel = stat.size === TaskSize.BIG ? 'Big' : 'Small';
                sizeByDate[date][sizeLabel] += stat.count;
            });

            const pieData = preparePieChartData(categoryTotals);
            setPieChartData(pieData);

            const radarDataFormatted = prepareRadarChartData(radarData);
            setRadarChartData(radarDataFormatted);

            const barWeightData = prepareBarChartData(
                weightByDate,
                stats,
                'category',
                getCategoryColor
            );
            setBarWeightChartData(barWeightData);

            const barSizeData = prepareBarChartData(sizeByDate, stats, 'size');
            setBarSizeChartData(barSizeData);
        },
        [
            getCategoryColor,
            prepareBarChartData,
            preparePieChartData,
            prepareRadarChartData,
        ]
    );

    const pieOptions: ChartOptions<'pie'> = {
        ...getCommonChartOptions(isDarkMode),
        plugins: {
            ...getCommonChartOptions(isDarkMode).plugins,
            legend: {
                display: false,
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
        ...getCommonChartOptions(isDarkMode),
        scales: getScalesOptions(isDarkMode, 'radar'),
    };

    const barOptions: ChartOptions<'bar'> = {
        ...getCommonChartOptions(isDarkMode),
        maintainAspectRatio: false,
        scales: getScalesOptions(isDarkMode, 'bar'),
        plugins: {
            ...getCommonChartOptions(isDarkMode).plugins,
            datalabels: {
                color: isDarkMode ? '#ffffff' : '#000000',
                anchor: 'start',
                align: 'end',
                offset: 0,
                formatter: (value: number) => value,
            },
        },
    };

    useEffect(() => {
        const fetchAndProcessStats = async () => {
            try {
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(endDate.getDate() - 6);
                endDate.setDate(endDate.getDate() + 1);

                const endDateStr = endDate.toISOString().split('T')[0];
                const startDateStr = startDate.toISOString().split('T')[0];

                const stats = await statsService.getStatsForDateRange(
                    startDateStr,
                    endDateStr
                );

                processStatsData(stats);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchAndProcessStats().catch(err => console.log(err));
    }, [processStatsData]);

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
