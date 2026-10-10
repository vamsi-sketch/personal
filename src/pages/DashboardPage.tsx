import React from 'react';
import { Task, AnalyticsData } from '../types';
import { SummaryCards } from '../components/SummaryCards';
import { MonthlyTrackerGrid } from '../components/MonthlyTrackerGrid';

interface DashboardPageProps {
  tasks: Task[];
  completions: Record<string, Record<string, boolean>>;
  analytics: AnalyticsData;
  selectedYear: number;
  selectedMonthIndex: number;
  onNavigateMonth: (year: number, monthIndex: number) => void;
  onToggleCompletion: (taskId: string, dateStr: string) => void;
  onOpenAddTask: () => void;
  onEditTask: (task: Task) => void;
  onToggleTaskActive: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  tasks,
  completions,
  analytics,
  selectedYear,
  selectedMonthIndex,
  onNavigateMonth,
  onToggleCompletion,
  onOpenAddTask,
  onEditTask,
  onToggleTaskActive,
  onDeleteTask,
}) => {
  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
          My Consistency Tracker
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Small actions. Every day. Long-term results.
        </p>
      </div>

      {/* Summary Cards */}
      <SummaryCards analytics={analytics} />

      {/* Main Monthly Tracking Grid */}
      <MonthlyTrackerGrid
        tasks={tasks}
        completions={completions}
        selectedYear={selectedYear}
        selectedMonthIndex={selectedMonthIndex}
        onNavigateMonth={onNavigateMonth}
        onToggleCompletion={onToggleCompletion}
        onOpenAddTask={onOpenAddTask}
        onEditTask={onEditTask}
        onToggleTaskActive={onToggleTaskActive}
        onDeleteTask={onDeleteTask}
      />
    </div>
  );
};
