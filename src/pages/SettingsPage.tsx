import React, { useState } from 'react';
import { Settings as SettingsIcon, Download, Trash2, Database, ShieldCheck, Info } from 'lucide-react';
import { Task } from '../types';

interface SettingsPageProps {
  tasks: Task[];
  completions: Record<string, Record<string, boolean>>;
  onResetData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  tasks,
  completions,
  onResetData,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [exportStatus, setExportStatus] = useState('');

  const handleExportJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      tasks,
      completions,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consistency-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportStatus('Backup exported successfully');
    setTimeout(() => setExportStatus(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Tracker Settings
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Preferences, calculation principles, backup, and data management.
        </p>
      </div>

      <div className="space-y-4">
        {/* Tracker Calculation Rules */}
        <div className="p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
              Mathematical Consistency Rules
            </h3>
          </div>
          <div className="space-y-2 text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            <p>
              • <strong className="text-stone-800 dark:text-stone-200">Start Date Grounding:</strong> A task's consistency is calculated strictly from its configured start date. Days prior to creation are not penalized.
            </p>
            <p>
              • <strong className="text-stone-800 dark:text-stone-200">No Future Penalties:</strong> Future calendar dates are never counted as missed. Only passed days up to today require completion.
            </p>
            <p>
              • <strong className="text-stone-800 dark:text-stone-200">Formula:</strong> Consistency % = (Completed task-days / Expected task-days) × 100.
            </p>
            <p>
              • <strong className="text-stone-800 dark:text-stone-200">Deactivation Safety:</strong> Deactivating a task preserves all historic completion records without skewing active tracking.
            </p>
          </div>
        </div>

        {/* Database & Architecture */}
        <div className="p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-5 h-5 text-teal-600" />
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
              Database Architecture
            </h3>
          </div>
          <div className="text-xs text-stone-600 dark:text-stone-400 space-y-2 leading-relaxed">
            <p>
              • Private single-user architecture: No logins, no cookies, no third-party tracking.
            </p>
            <p>
              • Normalized relational PostgreSQL schema: <code className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-mono text-[11px]">tasks</code> and <code className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-mono text-[11px]">task_completions</code> with <code className="font-mono text-[11px]">UNIQUE(task_id, completion_date)</code>.
            </p>
            <p>
              • Automatic schema initialization executes on server startup with <code className="font-mono text-[11px]">CREATE TABLE IF NOT EXISTS</code>.
            </p>
          </div>
        </div>

        {/* Data Backup & Export */}
        <div className="p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                Export Data
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Download a complete JSON export of all your tasks and daily completion logs.
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-750 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON</span>
            </button>
          </div>
          {exportStatus && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
              {exportStatus}
            </p>
          )}
        </div>

        {/* Reset Data */}
        <div className="p-5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-300 text-sm">
                Reset All Tracker Data
              </h3>
              <p className="text-xs text-red-700/80 dark:text-red-400/80 mt-0.5">
                Permanently clear all tasks and daily completions. This cannot be undone.
              </p>
            </div>
            {!showConfirmReset ? (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-200 dark:border-red-800 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset Data</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onResetData();
                    setShowConfirmReset(false);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                >
                  Confirm Reset
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
