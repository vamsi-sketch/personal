import { Task, AnalyticsData, StreaksData, TaskConsistencyStat, TaskStreakStat, DailyTrendStat } from '../types';
import { getTodayString, getDaysInMonth, formatDateStr } from './dateUtils';

/**
 * Calculates consistency and streaks based strictly on real tasks and completion entries.
 * Rules:
 * - Only count dates from the task's start_date.
 * - Do NOT count future dates as missed.
 * - If no data exists, return 0s and empty arrays.
 */
export function calculateAnalytics(
  tasks: Task[],
  completions: Record<string, Record<string, boolean>>, // [taskId][YYYY-MM-DD] => boolean
  selectedYear: number,
  selectedMonthIndex: number
): AnalyticsData {
  const today = getTodayString();
  const totalTasks = tasks.length;
  const activeTasks = tasks.filter(t => t.active).length;

  if (totalTasks === 0) {
    return {
      overallConsistency: 0,
      totalTasks: 0,
      activeTasks: 0,
      completedTaskDays: 0,
      expectedTaskDays: 0,
      missedTaskDays: 0,
      currentStreak: 0,
      longestStreak: 0,
      taskConsistency: [],
      dailyCompletion: [],
      monthlyConsistency: []
    };
  }

  let totalExpectedTaskDays = 0;
  let totalCompletedTaskDays = 0;

  const taskConsistency: TaskConsistencyStat[] = [];

  for (const task of tasks) {
    let taskExpected = 0;
    let taskCompleted = 0;

    // Check all dates from task start date up to today (or end of recorded period)
    const taskCompletions = completions[task.id] || {};
    
    // We scan all recorded dates or up to today
    // Let's find earliest date from task.start_date
    const start = task.start_date;
    if (start <= today) {
      // Loop from start date up to today
      const startDate = new Date(start + 'T00:00:00');
      const todayDate = new Date(today + 'T00:00:00');
      
      const cur = new Date(startDate);
      while (cur <= todayDate) {
        const y = cur.getFullYear();
        const m = String(cur.getMonth() + 1).padStart(2, '0');
        const d = String(cur.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;
        
        taskExpected += 1;
        if (taskCompletions[dateStr] === true) {
          taskCompleted += 1;
        }

        cur.setDate(cur.getDate() + 1);
      }
    }

    const percentage = taskExpected > 0 ? Math.round((taskCompleted / taskExpected) * 100) : 0;

    taskConsistency.push({
      taskId: task.id,
      taskName: task.name,
      category: task.category,
      completedCount: taskCompleted,
      expectedCount: taskExpected,
      percentage
    });

    totalExpectedTaskDays += taskExpected;
    totalCompletedTaskDays += taskCompleted;
  }

  const missedTaskDays = Math.max(0, totalExpectedTaskDays - totalCompletedTaskDays);
  const overallConsistency = totalExpectedTaskDays > 0
    ? Math.round((totalCompletedTaskDays / totalExpectedTaskDays) * 100)
    : 0;

  // Daily trend for the selected month
  const daysInSelectedMonth = getDaysInMonth(selectedYear, selectedMonthIndex);
  const dailyCompletion: DailyTrendStat[] = [];

  for (let day = 1; day <= daysInSelectedMonth; day++) {
    const dateStr = formatDateStr(selectedYear, selectedMonthIndex, day);
    if (dateStr > today) {
      // Future date - don't show or mark as 0/0
      continue;
    }

    let activeExpectedCount = 0;
    let dayCompletedCount = 0;

    for (const task of tasks) {
      if (task.active && task.start_date <= dateStr) {
        activeExpectedCount += 1;
        if (completions[task.id]?.[dateStr] === true) {
          dayCompletedCount += 1;
        }
      }
    }

    const percentage = activeExpectedCount > 0
      ? Math.round((dayCompletedCount / activeExpectedCount) * 100)
      : 0;

    dailyCompletion.push({
      date: dateStr,
      day,
      completedCount: dayCompletedCount,
      totalActiveCount: activeExpectedCount,
      percentage
    });
  }

  // Calculate streaks
  const streaks = calculateStreaks(tasks, completions);

  return {
    overallConsistency,
    totalTasks,
    activeTasks,
    completedTaskDays: totalCompletedTaskDays,
    expectedTaskDays: totalExpectedTaskDays,
    missedTaskDays,
    currentStreak: streaks.overallCurrentStreak,
    longestStreak: streaks.overallLongestStreak,
    taskConsistency,
    dailyCompletion,
    monthlyConsistency: []
  };
}

/**
 * Calculates current streak and longest streak for each task and overall.
 * Streak rules:
 * - Future dates are not counted.
 * - Completed consecutive expected days increase streak.
 * - A missed expected day breaks streak.
 */
export function calculateStreaks(
  tasks: Task[],
  completions: Record<string, Record<string, boolean>>
): StreaksData {
  const today = getTodayString();
  const activeTasks = tasks.filter(t => t.active);

  if (activeTasks.length === 0) {
    return {
      overallCurrentStreak: 0,
      overallLongestStreak: 0,
      taskStreaks: []
    };
  }

  const taskStreaks: TaskStreakStat[] = [];

  for (const task of tasks) {
    const taskCompletions = completions[task.id] || {};
    const startDate = new Date(task.start_date + 'T00:00:00');
    const todayDate = new Date(today + 'T00:00:00');

    if (task.start_date > today) {
      taskStreaks.push({
        taskId: task.id,
        taskName: task.name,
        category: task.category,
        active: task.active,
        currentStreak: 0,
        longestStreak: 0
      });
      continue;
    }

    // Build timeline array of completion states from start_date to today
    const timeline: { dateStr: string; completed: boolean }[] = [];
    const cur = new Date(startDate);
    while (cur <= todayDate) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, '0');
      const d = String(cur.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      timeline.push({
        dateStr,
        completed: taskCompletions[dateStr] === true
      });
      cur.setDate(cur.getDate() + 1);
    }

    // Longest streak
    let longest = 0;
    let running = 0;
    let lastCompletedDate: string | undefined;

    for (const day of timeline) {
      if (day.completed) {
        running += 1;
        lastCompletedDate = day.dateStr;
        if (running > longest) {
          longest = running;
        }
      } else {
        running = 0;
      }
    }

    // Current streak: count backwards from today
    // If today is not completed yet, check if yesterday was completed.
    // If yesterday was completed, current streak continues if today isn't over.
    // If today is completed, streak includes today.
    let current = 0;
    const len = timeline.length;
    if (len > 0) {
      const lastDay = timeline[len - 1]; // today
      if (lastDay.completed) {
        // Count consecutive back from today
        for (let i = len - 1; i >= 0; i--) {
          if (timeline[i].completed) {
            current += 1;
          } else {
            break;
          }
        }
      } else if (len > 1 && timeline[len - 2].completed) {
        // Today is not completed yet, but yesterday was; grace period for today!
        for (let i = len - 2; i >= 0; i--) {
          if (timeline[i].completed) {
            current += 1;
          } else {
            break;
          }
        }
      }
    }

    taskStreaks.push({
      taskId: task.id,
      taskName: task.name,
      category: task.category,
      active: task.active,
      currentStreak: current,
      longestStreak: longest,
      lastCompletedDate
    });
  }

  // Overall current streak across all active tasks (days where ALL active tasks due were completed)
  // Or max streak among active tasks
  const activeTaskStreaks = taskStreaks.filter(t => t.active);
  const overallCurrentStreak = activeTaskStreaks.length > 0
    ? Math.max(0, ...activeTaskStreaks.map(t => t.currentStreak))
    : 0;
  const overallLongestStreak = activeTaskStreaks.length > 0
    ? Math.max(0, ...activeTaskStreaks.map(t => t.longestStreak))
    : 0;

  return {
    overallCurrentStreak,
    overallLongestStreak,
    taskStreaks
  };
}
