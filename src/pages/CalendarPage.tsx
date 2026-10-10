import React from 'react';
import { Task } from '../types';
import { MonthlyTrackerGrid } from '../components/MonthlyTrackerGrid';

interface CalendarPageProps {
  tasks: Task[];
  completions: Record<string, Record<string, boolean>>;
  selectedYear: number;
  selectedMonthIndex: number;
  onNavigateMonth: (year: number, monthIndex: number) => void;
  onToggleCompletion: (taskId: string, dateStr: string) => void;
  onOpenAddTask: () => void;
  onEditTask: (task: Task) => void;
  onToggleTaskActive: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  tasks,
  completions,
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Monthly Spreadsheet Tracker
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Full month calendar view with daily completion checkboxes for every task.
        </p>
      </div>

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
