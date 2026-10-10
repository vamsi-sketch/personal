import React from 'react';
import { CheckCircle2, TrendingUp, Flame, Award, ListTodo } from 'lucide-react';
import { AnalyticsData } from '../types';

interface SummaryCardsProps {
  analytics: AnalyticsData;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ analytics }) => {
  const cards = [
    {
      label: 'Total Tasks',
      value: analytics.totalTasks,
      subValue: `${analytics.activeTasks} active`,
      icon: ListTodo,
      color: 'text-stone-700 dark:text-stone-300',
      bgColor: 'bg-stone-100 dark:bg-stone-800/80',
    },
    {
      label: 'Completed Task-Days',
      value: analytics.completedTaskDays,
      subValue: `of ${analytics.expectedTaskDays} expected`,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      label: 'Overall Consistency',
      value: `${analytics.overallConsistency}%`,
      subValue: analytics.expectedTaskDays > 0 ? `${analytics.completedTaskDays}/${analytics.expectedTaskDays} logged` : 'No tracked days yet',
      icon: TrendingUp,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-950/40',
    },
    {
      label: 'Current Streak',
      value: `${analytics.currentStreak} ${analytics.currentStreak === 1 ? 'day' : 'days'}`,
      subValue: analytics.currentStreak > 0 ? 'Consecutive consistency' : 'Start your streak today',
      icon: Flame,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    },
    {
      label: 'Longest Streak',
      value: `${analytics.longestStreak} ${analytics.longestStreak === 1 ? 'day' : 'days'}`,
      subValue: 'Personal best',
      icon: Award,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400 truncate">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg ${card.bgColor} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-stone-900 dark:text-stone-100">
                {card.value}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                {card.subValue}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
