export interface Task {
  id: string;
  name: string;
  description: string;
  category: string;
  start_date: string; // YYYY-MM-DD
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskCompletion {
  id?: string;
  task_id: string;
  completion_date: string; // YYYY-MM-DD
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MonthlyCalendarData {
  month: string; // YYYY-MM
  year: number;
  monthIndex: number; // 0-11
  daysInMonth: number;
  tasks: Task[];
  completions: Record<string, Record<string, boolean>>; // taskId -> { [YYYY-MM-DD]: boolean }
}

export interface TaskConsistencyStat {
  taskId: string;
  taskName: string;
  category: string;
  completedCount: number;
  expectedCount: number;
  percentage: number;
}

export interface DailyTrendStat {
  date: string;
  day: number;
  completedCount: number;
  totalActiveCount: number;
  percentage: number;
}

export interface MonthlyTrendStat {
  month: string;
  completedCount: number;
  expectedCount: number;
  percentage: number;
}

export interface AnalyticsData {
  overallConsistency: number; // 0 - 100
  totalTasks: number;
  activeTasks: number;
  completedTaskDays: number;
  expectedTaskDays: number;
  missedTaskDays: number;
  currentStreak: number;
  longestStreak: number;
  taskConsistency: TaskConsistencyStat[];
  dailyCompletion: DailyTrendStat[];
  monthlyConsistency: MonthlyTrendStat[];
}

export interface TaskStreakStat {
  taskId: string;
  taskName: string;
  category: string;
  active: boolean;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
}

export interface StreaksData {
  overallCurrentStreak: number;
  overallLongestStreak: number;
  taskStreaks: TaskStreakStat[];
}
