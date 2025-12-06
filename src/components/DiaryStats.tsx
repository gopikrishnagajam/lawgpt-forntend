interface DiaryStatsProps {
  totalEntries: number;
  last30Days: number;
  totalDays: number;
  isLoading?: boolean;
}

export const DiaryStats = ({ totalEntries, last30Days, totalDays, isLoading }: DiaryStatsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Entries',
      value: totalEntries,
      icon: '📝',
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-600',
    },
    {
      label: 'This Month',
      value: last30Days,
      icon: '📅',
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-600',
    },
    {
      label: 'Active Days',
      value: totalDays,
      icon: '🔥',
      color: 'bg-orange-50 border-orange-200',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`${stat.color} border rounded-lg p-4 flex items-center gap-4`}
        >
          <div className="text-3xl">{stat.icon}</div>
          <div>
            <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
            <p className={`${stat.textColor} text-2xl font-bold`}>{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
