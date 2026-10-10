import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, CheckCircle } from 'lucide-react';
import { AnalyticsData, Task } from '../types';
import { EmptyState } from '../components/EmptyState';

interface AnalyticsPageProps {
  analytics: AnalyticsData;
  tasks: Task[];
  onOpenAddTask: () => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  analytics,
  tasks,
  onOpenAddTask,
}) => {
  const hasData = analytics.totalTasks > 0 && analytics.expectedTaskDays > 0;

  // Chart 1: Doughnut Chart Data (Completed vs Not Completed)
  const pieData = [
    { name: 'Completed', value: analytics.completedTaskDays, color: '#059669' }, // emerald-600
    { name: 'Missed', value: analytics.missedTaskDays, color: '#e5e7eb' }, // stone-200
  ];

  // Chart 2: Task-wise consistency (Bar chart)
  const barData = analytics.taskConsistency.map(item => ({
    name: item.taskName.length > 15 ? item.taskName.substring(0, 15) + '…' : item.taskName,
    fullName: item.taskName,
    category: item.category,
    consistency: item.percentage,
    completed: item.completedCount,
    expected: item.expectedCount,
  }));

  // Chart 3: Consistency over time (Daily line chart)
  const lineData = analytics.dailyCompletion.map(item => ({
    day: `Day ${item.day}`,
    date: item.date,
    consistency: item.percentage,
    completed: item.completedCount,
    total: item.totalActiveCount,
  }));

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Analytics & Consistency Insights
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Measurable, non-fabricated visual performance across all days and tasks.
        </p>
      </div>

      {!hasData ? (
        <EmptyState
          icon={BarChart3}
          title="No analytics data available yet"
          description="Analytics and charts will automatically populate once you add tasks and mark daily completions in the tracker grid."
          actionLabel="Create a Task"
          onAction={onOpenAddTask}
        />
      ) : (
        <div className="space-y-6">
          {/* Top Key Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
              <span className="text-xs text-stone-500 font-medium">Overall Consistency Rate</span>
              <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
                {analytics.overallConsistency}%
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                {analytics.completedTaskDays} of {analytics.expectedTaskDays} expected days completed
              </p>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
              <span className="text-xs text-stone-500 font-medium">Active Habit Tracking</span>
              <div className="text-2xl font-bold font-mono tabular-nums text-stone-900 dark:text-stone-100 mt-1">
                {analytics.activeTasks} / {analytics.totalTasks}
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Currently active ongoing tasks
              </p>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
              <span className="text-xs text-stone-500 font-medium">Current Best Streak</span>
              <div className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-1">
                {analytics.currentStreak} {analytics.currentStreak === 1 ? 'day' : 'days'}
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Longest achieved: {analytics.longestStreak} days
              </p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Completed vs Not Completed Doughnut Chart */}
            <div className="p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <PieIcon className="w-4 h-4 text-emerald-600" />
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                  Completed vs Not Completed Task-Days
                </h3>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val} task-days`, '']}
                      contentStyle={{
                        backgroundColor: '#1c1917',
                        borderColor: '#292524',
                        color: '#f5f5f4',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-around text-center text-xs">
                <div>
                  <span className="text-stone-400">Completed:</span>{' '}
                  <span className="font-mono font-bold text-emerald-600">{analytics.completedTaskDays}</span>
                </div>
                <div>
                  <span className="text-stone-400">Missed:</span>{' '}
                  <span className="font-mono font-bold text-stone-500">{analytics.missedTaskDays}</span>
                </div>
              </div>
            </div>

            {/* Chart 2: Task-wise consistency Bar Chart */}
            <div className="p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                  Task-wise Consistency (%)
                </h3>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#78716c' }}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: '#78716c' }}
                      unit="%"
                    />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Consistency']}
                      labelFormatter={(_label, payload) => payload?.[0]?.payload?.fullName || _label}
                      contentStyle={{
                        backgroundColor: '#1c1917',
                        borderColor: '#292524',
                        color: '#f5f5f4',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="consistency" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500 text-center">
                Calculated strictly from each task's start date
              </div>
            </div>
          </div>

          {/* Chart 3: Consistency Over Time (Line Chart) */}
          <div className="p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                Consistency Trend Over Time (Current Month)
              </h3>
            </div>

            {lineData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-xs text-stone-400">
                No recorded days for this month yet.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 10, right: 15, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#78716c' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#78716c' }} unit="%" />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Daily Consistency']}
                      contentStyle={{
                        backgroundColor: '#1c1917',
                        borderColor: '#292524',
                        color: '#f5f5f4',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="consistency"
                      stroke="#0d9488"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#0d9488' }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
