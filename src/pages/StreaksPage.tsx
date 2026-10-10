import React from 'react';
import { Flame, Award, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { StreaksData, Task } from '../types';
import { EmptyState } from '../components/EmptyState';

interface StreaksPageProps {
  streaks: StreaksData;
  tasks: Task[];
  onOpenAddTask: () => void;
}

export const StreaksPage: React.FC<StreaksPageProps> = ({
  streaks,
  tasks,
  onOpenAddTask,
}) => {
  const hasTasks = tasks.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Consistency Streaks
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Every consecutive day counts. Future dates are never counted, missed days reset the streak.
        </p>
      </div>

      {!hasTasks ? (
        <EmptyState
          icon={Flame}
          title="No streak records yet"
          description="Create daily tasks and mark them completed to build your streaks."
          actionLabel="Create a Task"
          onAction={onOpenAddTask}
        />
      ) : (
        <div className="space-y-6">
          {/* Highlight Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-linear-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:via-stone-900 dark:to-stone-900 shadow-xs flex items-center gap-4">
              <div className="p-3.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Flame className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Current Top Streak
                </span>
                <div className="text-3xl font-extrabold font-mono tabular-nums text-stone-900 dark:text-stone-100 mt-0.5">
                  {streaks.overallCurrentStreak}{' '}
                  <span className="text-base font-normal text-stone-500">
                    {streaks.overallCurrentStreak === 1 ? 'day' : 'days'}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Active consecutive streak
                </p>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-linear-to-br from-indigo-500/10 via-indigo-500/5 to-transparent dark:from-indigo-950/40 dark:via-stone-900 dark:to-stone-900 shadow-xs flex items-center gap-4">
              <div className="p-3.5 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  All-Time Longest Streak
                </span>
                <div className="text-3xl font-extrabold font-mono tabular-nums text-stone-900 dark:text-stone-100 mt-0.5">
                  {streaks.overallLongestStreak}{' '}
                  <span className="text-base font-normal text-stone-500">
                    {streaks.overallLongestStreak === 1 ? 'day' : 'days'}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Highest unbroken record
                </p>
              </div>
            </div>
          </div>

          {/* Task-Specific Streaks Breakdown */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                Task-Specific Streaks
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Individual habit momentum tracking
              </p>
            </div>

            <div className="divide-y divide-stone-200 dark:divide-stone-800">
              {streaks.taskStreaks.map(item => (
                <div
                  key={item.taskId}
                  className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-stone-900 dark:text-stone-100 truncate">
                        {item.taskName}
                      </h4>
                      {!item.active && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-500">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-1">
                      <span>{item.category || 'General'}</span>
                      {item.lastCompletedDate && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-[11px]">
                            Last logged: {item.lastCompletedDate}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 sm:gap-8 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                        Current Streak
                      </span>
                      <div className="flex items-center justify-end gap-1 font-mono font-bold text-base tabular-nums text-amber-600 dark:text-amber-400">
                        <Flame className="w-4 h-4 fill-amber-500/20" />
                        <span>{item.currentStreak} d</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                        Best Streak
                      </span>
                      <div className="flex items-center justify-end gap-1 font-mono font-bold text-base tabular-nums text-indigo-600 dark:text-indigo-400">
                        <Award className="w-4 h-4 fill-indigo-500/20" />
                        <span>{item.longestStreak} d</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
