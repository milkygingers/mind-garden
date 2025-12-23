/**
 * Pomodoro Timer Page
 * 
 * A dedicated page for the focus timer widget.
 */

import { PomodoroTimer } from "@/components/widgets/PomodoroTimer";
import { Timer, Info } from "lucide-react";

export default function TimerPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl text-white">
          <Timer className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold">Focus Timer</h1>
          <p className="text-[var(--muted)]">
            Stay productive with the Pomodoro Technique
          </p>
        </div>
      </div>

      {/* Timer Widget */}
      <div className="mb-10">
        <PomodoroTimer />
      </div>

      {/* Info Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* What is Pomodoro */}
        <div className="p-6 bg-[var(--card)] border border-[var(--border)] rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-garden-500" />
            <h2 className="font-semibold">What is Pomodoro?</h2>
          </div>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            The Pomodoro Technique is a time management method that uses a timer 
            to break work into focused intervals (traditionally 25 minutes), 
            separated by short breaks. After 4 work sessions, you take a longer break.
          </p>
        </div>

        {/* How to use */}
        <div className="p-6 bg-[var(--card)] border border-[var(--border)] rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🍅</span>
            <h2 className="font-semibold">How to use</h2>
          </div>
          <ol className="text-sm text-[var(--muted)] space-y-2">
            <li>1. Click <strong>Play</strong> to start a 25-minute focus session</li>
            <li>2. Work until the timer rings</li>
            <li>3. Take a <strong>5-minute break</strong></li>
            <li>4. After 4 sessions, take a <strong>15-minute break</strong></li>
            <li>5. Repeat and stay productive! 🚀</li>
          </ol>
        </div>

        {/* Tips */}
        <div className="md:col-span-2 p-6 bg-gradient-to-r from-garden-50 to-warmth-50 dark:from-garden-900/20 dark:to-warmth-900/20 border border-garden-200 dark:border-garden-800 rounded-xl">
          <h2 className="font-semibold mb-3 text-garden-800 dark:text-garden-200">
            💡 Pro Tips
          </h2>
          <ul className="grid md:grid-cols-2 gap-3 text-sm text-garden-700 dark:text-garden-300">
            <li>• Put your phone in another room</li>
            <li>• Close unnecessary browser tabs</li>
            <li>• Use breaks to stretch and hydrate</li>
            <li>• Track your sessions to see progress</li>
            <li>• Adjust timer durations to fit your flow</li>
            <li>• Pair with lo-fi music for extra focus</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

