import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { useTranslation } from 'react-i18next';

interface Car {
  ownerId: string;
  createdAt?: string;
  year?: number;
}

interface CarAnalyticsChartProps {
  cars: Car[];
  userId?: string;
}

export const CarAnalyticsChart: React.FC<CarAnalyticsChartProps> = ({ cars, userId }) => {
  const { t } = useTranslation();

  const userDateMap = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    cars.forEach(car => {
      const user = car.ownerId || 'unknown';
      const date = car.createdAt ? car.createdAt.slice(0, 10) : car.year?.toString() || 'unknown';
      if (!map[user]) map[user] = {};
      map[user][date] = (map[user][date] || 0) + 1;
    });
    return map;
  }, [cars]);

  // Get all unique dates sorted
  const allDates = useMemo(() => {
    const set = new Set<string>();
    Object.values(userDateMap).forEach(dateMap => {
      Object.keys(dateMap).forEach(date => set.add(date));
    });
    return Array.from(set).sort();
  }, [userDateMap]);

  // Масив userId у тому ж порядку, що й серії
  const userIds = useMemo(() => Object.entries(userDateMap).map(([user]) => user), [userDateMap]);

  // Масив стилів ліній: ваш id — пунктирна, інші — суцільна
  const chartDashArray = useMemo(() =>
    userIds.map(uid => (userId && uid === userId ? 6 : 0)),
    [userIds, userId]
  );

  // Масив кольорів: ваш id — синій, інші — з палітри
  const palette = ['#2ecc40', '#ff4136', '#ff851b', '#b10dc9', '#7fdbff', '#39cccc', '#01ff70', '#ffdc00', '#001f3f', '#aaaaaa'];
  const chartColors = useMemo(() =>
    userIds.map((uid, idx) => (userId && uid === userId ? '#1971c2' : palette[idx % palette.length])),
    [userIds, userId]
  );

  // Prepare series for ApexCharts
  const chartSeries = useMemo(() => {
    return Object.entries(userDateMap).map(([user, dateMap]) => ({
      name: user,
      data: allDates.map(date => dateMap[date] || 0),
    }));
  }, [userDateMap, allDates]);

  const chartOptions = useMemo(() => ({
    chart: { id: 'cars-by-date', toolbar: { show: false } },
    xaxis: { categories: allDates },
    yaxis: { title: { text: t('cars_published') } },
    dataLabels: { enabled: false },
    tooltip: { enabled: true },
    grid: { borderColor: '#eee' },
    stroke: {
      curve: 'smooth',
      dashArray: chartDashArray,
    },
    colors: chartColors,
    legend: {
      show: true,
      formatter: (seriesName: string) =>
        userId && seriesName === userId ? `${seriesName} (${t('you')})` : seriesName,
    },
  }), [allDates, t, userId, chartColors, chartDashArray]);

  return (
    <Chart
      options={chartOptions}
      series={chartSeries}
      type="line"
      height={300}
      width="100%"
    />
  );
};
