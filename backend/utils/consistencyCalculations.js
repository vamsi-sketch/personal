import { getTodayString, getDaysInMonth, formatDateStr } from './dateHelper.js';

export function computeConsistencyAndAnalytics(tasks, completionsMap, year, monthIndex) {
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
      monthlyConsistency: [],
    };
  }

  let totalExpectedTaskDays = 0;
  let totalCompletedTaskDays = 0;
  const taskConsistency = [];

  for (const task of tasks) {
    let taskExpected = 0;
    let taskCompleted = 0;
    const taskCompletions = completionsMap[task.id] || {};

    // Only count from task.start_date up to today
    if (task.start_date <= today) {
      const cur = new Date(task.start_date + 'T00:00:00');
      const todayDate = new Date(today + 'T00:00:00');

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
      percentage,
    });

    totalExpectedTaskDays += taskExpected;
    totalCompletedTaskDays += taskCompleted;
  }

  const missedTaskDays = Math.max(0, totalExpectedTaskDays - totalCompletedTaskDays);
  const overallConsistency = totalExpectedTaskDays > 0
    ? Math.round((totalCompletedTaskDays / totalExpectedTaskDays) * 100)
    : 0;

  // Daily trend for the given month
  const targetYear = year ?? new Date().getFullYear();
  const targetMonthIndex = monthIndex ?? new Date().getMonth();
  const daysInMonth = getDaysInMonth(targetYear, targetMonthIndex);
  const dailyCompletion = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDateStr(targetYear, targetMonthIndex, day);
    if (dateStr > today) continue; // Future dates not counted

    let activeExpectedCount = 0;
    let dayCompletedCount = 0;

    for (const task of tasks) {
      if (task.active && task.start_date <= dateStr) {
        activeExpectedCount += 1;
        if (completionsMap[task.id]?.[dateStr] === true) {
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
      percentage,
    });
  }

  const streaks = computeStreaks(tasks, completionsMap);

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
    monthlyConsistency: [],
  };
}

export function computeStreaks(tasks, completionsMap) {
  const today = getTodayString();
  const activeTasks = tasks.filter(t => t.active);

  if (activeTasks.length === 0) {
    return {
      overallCurrentStreak: 0,
      overallLongestStreak: 0,
      taskStreaks: [],
    };
  }

  const taskStreaks = [];

  for (const task of tasks) {
    const taskCompletions = completionsMap[task.id] || {};
    const startDate = new Date(task.start_date + 'T00:00:00');
    const todayDate = new Date(today + 'T00:00:00');

    if (task.start_date > today) {
      taskStreaks.push({
        taskId: task.id,
        taskName: task.name,
        category: task.category,
        active: task.active,
        currentStreak: 0,
        longestStreak: 0,
      });
      continue;
    }

    const timeline = [];
    const cur = new Date(startDate);
    while (cur <= todayDate) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, '0');
      const d = String(cur.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      timeline.push({
        dateStr,
        completed: taskCompletions[dateStr] === true,
      });
      cur.setDate(cur.getDate() + 1);
    }

    let longest = 0;
    let running = 0;
    let lastCompletedDate;

    for (const day of timeline) {
      if (day.completed) {
        running += 1;
        lastCompletedDate = day.dateStr;
        if (running > longest) longest = running;
      } else {
        running = 0;
      }
    }

    let current = 0;
    const len = timeline.length;
    if (len > 0) {
      const lastDay = timeline[len - 1]; // today
      if (lastDay.completed) {
        for (let i = len - 1; i >= 0; i--) {
          if (timeline[i].completed) current += 1;
          else break;
        }
      } else if (len > 1 && timeline[len - 2].completed) {
        // Today is not finished, yesterday was completed
        for (let i = len - 2; i >= 0; i--) {
          if (timeline[i].completed) current += 1;
          else break;
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
      lastCompletedDate,
    });
  }

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
    taskStreaks,
  };
}
