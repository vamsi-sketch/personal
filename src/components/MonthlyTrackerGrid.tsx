import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Check,
  Plus,
  MoreVertical,
  Edit2,
  PowerOff,
  Power,
  Trash2
} from 'lucide-react';
import { Task } from '../types';
import {
  formatDateStr,
  getDaysInMonth,
  getDayOfWeekAbbr,
  getMonthLabel,
  getPrevMonth,
  getNextMonth,
  getTodayString,
  formatYearMonth
} from '../utils/dateUtils';

interface MonthlyTrackerGridProps {
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

export const MonthlyTrackerGrid: React.FC<MonthlyTrackerGridProps> = ({
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
  const [activeMenuTaskId, setActiveMenuTaskId] = React.useState<string | null>(null);

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonthIndex);
  const currentMonthLabel = getMonthLabel(selectedYear, selectedMonthIndex);

  const prevMonthObj = getPrevMonth(selectedYear, selectedMonthIndex);
  const prevMonthLabel = getMonthLabel(prevMonthObj.year, prevMonthObj.monthIndex);

  const nextMonthObj = getNextMonth(selectedYear, selectedMonthIndex);
  const nextMonthLabel = getMonthLabel(nextMonthObj.year, nextMonthObj.monthIndex);

  const todayStr = getTodayString();
  const currentYearMonth = formatYearMonth(selectedYear, selectedMonthIndex);
  const isViewingCurrentMonth = todayStr.startsWith(currentYearMonth);
  const todayDayNum = isViewingCurrentMonth ? parseInt(todayStr.split('-')[2], 10) : -1;

  // Jump to today
  const handleJumpToToday = () => {
    const now = new Date();
    onNavigateMonth(now.getFullYear(), now.getMonth());
  };

  // Close menus on outside click
  React.useEffect(() => {
    const handleOutside = () => setActiveMenuTaskId(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  // Generate array of days: 1 .. daysInMonth
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs overflow-hidden">
      {/* Month Navigation Header */}
      <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-50/70 dark:bg-stone-900/50">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              {currentMonthLabel}
            </h2>
            {isViewingCurrentMonth && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                Current Month
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Spreadsheet Monthly Tracker · Click any day cell to toggle completion
          </p>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigateMonth(prevMonthObj.year, prevMonthObj.monthIndex)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-lg transition-colors cursor-pointer"
            title={`Go to ${prevMonthLabel}`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{prevMonthLabel}</span>
            <span className="sm:hidden">Prev</span>
          </button>

          {!isViewingCurrentMonth && (
            <button
              onClick={handleJumpToToday}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-lg transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Today</span>
            </button>
          )}

          <button
            onClick={() => onNavigateMonth(nextMonthObj.year, nextMonthObj.monthIndex)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-lg transition-colors cursor-pointer"
            title={`Go to ${nextMonthLabel}`}
          >
            <span className="hidden sm:inline">{nextMonthLabel}</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAddTask}
            className="inline-flex items-center gap-1.5 ml-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Grid Container with Horizontal Scroll */}
      {tasks.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-1">
            No tasks created yet
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 max-w-sm mx-auto mb-5">
            Add your daily tasks to populate the spreadsheet grid and track your consistency across days.
          </p>
          <button
            onClick={onOpenAddTask}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Task</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto relative scrollbar-thin">
          <table className="w-full border-collapse text-left min-w-[800px]">
            {/* Table Header: Days */}
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-100/80 dark:bg-stone-900/80 text-xs font-semibold text-stone-600 dark:text-stone-300">
                {/* Sticky Left Column: Task Name */}
                <th
                  scope="col"
                  className="sticky left-0 z-20 bg-stone-100 dark:bg-stone-900 px-4 py-3 min-w-[200px] max-w-[240px] border-r border-stone-200 dark:border-stone-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="tracking-wider uppercase font-bold text-stone-700 dark:text-stone-200">
                      MY TASKS ({tasks.length})
                    </span>
                  </div>
                </th>

                {/* Day Columns */}
                {daysArray.map(day => {
                  const dateStr = formatDateStr(selectedYear, selectedMonthIndex, day);
                  const isToday = isViewingCurrentMonth && day === todayDayNum;
                  const isFuture = dateStr > todayStr;
                  const dayName = getDayOfWeekAbbr(selectedYear, selectedMonthIndex, day);
                  const isWeekend = ['S'].includes(dayName);

                  return (
                    <th
                      key={day}
                      scope="col"
                      className={`text-center px-1 py-2 min-w-[34px] w-[34px] border-r border-stone-200/60 dark:border-stone-800/60 select-none ${
                        isToday
                          ? 'bg-emerald-100/90 dark:bg-emerald-950/70 font-bold text-emerald-900 dark:text-emerald-200'
                          : isWeekend
                          ? 'bg-stone-200/40 dark:bg-stone-800/40'
                          : ''
                      } ${isFuture ? 'opacity-60' : ''}`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] uppercase font-normal text-stone-500 dark:text-stone-400">
                          {dayName}
                        </span>
                        <span
                          className={`text-xs font-mono tabular-nums leading-tight ${
                            isToday ? 'text-emerald-700 dark:text-emerald-300 font-extrabold' : ''
                          }`}
                        >
                          {day}
                        </span>
                      </div>
                    </th>
                  );
                })}

                {/* Right Summary Column: Month Progress */}
                <th
                  scope="col"
                  className="px-3 py-2 text-center text-[11px] font-semibold tracking-wider text-stone-600 dark:text-stone-300 uppercase min-w-[100px] bg-stone-100 dark:bg-stone-900"
                >
                  MONTH STATS
                </th>

                {/* Actions Column */}
                <th
                  scope="col"
                  className="px-2 py-2 text-center text-[11px] font-semibold tracking-wider text-stone-600 dark:text-stone-300 uppercase w-[50px] bg-stone-100 dark:bg-stone-900"
                >
                  ACTIONS
                </th>
              </tr>
            </thead>

            {/* Table Body: Tasks & Daily Checkboxes */}
            <tbody className="divide-y divide-stone-200 dark:divide-stone-800 text-xs">
              {tasks.map(task => {
                const taskCompletions = completions[task.id] || {};
                
                // Calculate monthly completions for this task
                let taskMonthCompleted = 0;
                let taskMonthExpected = 0;

                daysArray.forEach(day => {
                  const dateStr = formatDateStr(selectedYear, selectedMonthIndex, day);
                  if (task.start_date <= dateStr && dateStr <= todayStr) {
                    taskMonthExpected += 1;
                    if (taskCompletions[dateStr] === true) {
                      taskMonthCompleted += 1;
                    }
                  }
                });

                const taskMonthPct = taskMonthExpected > 0
                  ? Math.round((taskMonthCompleted / taskMonthExpected) * 100)
                  : 0;

                return (
                  <tr
                    key={task.id}
                    className={`hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors ${
                      !task.active ? 'opacity-50 bg-stone-100/30 dark:bg-stone-900/30' : ''
                    }`}
                  >
                    {/* Sticky Task Label Column */}
                    <td
                      className="sticky left-0 z-10 bg-white dark:bg-stone-900 px-3 py-2.5 min-w-[210px] max-w-[260px] border-r border-stone-200 dark:border-stone-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]"
                    >
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <div className="flex flex-col justify-center min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className="font-medium text-stone-900 dark:text-stone-100 truncate text-sm"
                              title={task.name}
                            >
                              {task.name}
                            </span>
                            {!task.active && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 shrink-0">
                                Inactive
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                            <span className="truncate">{task.category || 'General'}</span>
                            <span>·</span>
                            <span className="font-mono text-[10px] text-stone-400">
                              since {task.start_date}
                            </span>
                          </div>
                        </div>

                        {/* Delete Button right beside the task name */}
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTask(task.id);
                            }}
                            className="p-1 rounded text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            title={`Delete "${task.name}"`}
                            aria-label={`Delete ${task.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Checkbox for Each Day */}
                    {daysArray.map(day => {
                      const dateStr = formatDateStr(selectedYear, selectedMonthIndex, day);
                      const isCompleted = taskCompletions[dateStr] === true;
                      const isBeforeStart = dateStr < task.start_date;
                      const isFuture = dateStr > todayStr;
                      const isToday = isViewingCurrentMonth && day === todayDayNum;

                      return (
                        <td
                          key={day}
                          className={`p-1 text-center border-r border-stone-200/50 dark:border-stone-800/50 align-middle ${
                            isToday ? 'bg-emerald-50/50 dark:bg-emerald-950/30' : ''
                          }`}
                        >
                          {isBeforeStart ? (
                            <div
                              className="w-6 h-6 mx-auto flex items-center justify-center text-stone-300 dark:text-stone-700 text-xs font-mono select-none"
                              title={`Task started on ${task.start_date}`}
                            >
                              -
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onToggleCompletion(task.id, dateStr)}
                              disabled={!task.active}
                              title={`${task.name}: ${dateStr} - ${isCompleted ? 'Completed' : 'Incomplete'}`}
                              className={`w-6 h-6 mx-auto rounded flex items-center justify-center transition-all cursor-pointer select-none focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 ${
                                isCompleted
                                  ? 'bg-emerald-600 text-white font-bold shadow-xs hover:bg-emerald-700'
                                  : isFuture
                                  ? 'border border-dashed border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 bg-stone-50/50 dark:bg-stone-800/20 text-transparent'
                                  : 'border border-stone-300 dark:border-stone-600 hover:border-emerald-500 dark:hover:border-emerald-400 bg-white dark:bg-stone-800 text-transparent'
                              } ${!task.active ? 'cursor-not-allowed opacity-50' : ''}`}
                            >
                              {isCompleted ? (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              ) : (
                                <span className="opacity-0">□</span>
                              )}
                            </button>
                          )}
                        </td>
                      );
                    })}

                    {/* Row Summary / Consistency Stat */}
                    <td className="px-3 py-2 text-center align-middle whitespace-nowrap bg-stone-50/50 dark:bg-stone-900/30">
                      <div className="flex flex-col items-center">
                        <span className="font-mono font-bold text-xs tabular-nums text-stone-800 dark:text-stone-200">
                          {taskMonthCompleted} / {taskMonthExpected}
                        </span>
                        <div className="w-16 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${taskMonthPct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-stone-500 font-mono tabular-nums mt-0.5">
                          {taskMonthPct}%
                        </span>
                      </div>
                    </td>

                    {/* Actions Menu */}
                    <td className="px-2 py-2 text-center align-middle relative">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setActiveMenuTaskId(activeMenuTaskId === task.id ? null : task.id);
                          }}
                          className="p-1 rounded-md text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuTaskId === task.id && (
                          <div
                            onClick={e => e.stopPropagation()}
                            className="absolute right-0 top-8 z-30 w-36 bg-white dark:bg-stone-900 rounded-lg shadow-lg border border-stone-200 dark:border-stone-800 py-1 text-xs"
                          >
                            <button
                              onClick={() => {
                                setActiveMenuTaskId(null);
                                onEditTask(task);
                              }}
                              className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-stone-400" />
                              <span>Edit Task</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveMenuTaskId(null);
                                onToggleTaskActive(task);
                              }}
                              className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 cursor-pointer"
                            >
                              {task.active ? (
                                <>
                                  <PowerOff className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Deactivate</span>
                                </>
                              ) : (
                                <>
                                  <Power className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Activate</span>
                                </>
                              )}
                            </button>

                            <div className="border-t border-stone-200 dark:border-stone-800 my-1" />

                            <button
                              onClick={() => {
                                setActiveMenuTaskId(null);
                                onDeleteTask(task.id);
                              }}
                              className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
