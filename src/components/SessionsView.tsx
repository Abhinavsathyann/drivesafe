import React from 'react';
import {
  Clock,
  AlertTriangle,
  Timer,
  BarChart2,
  LineChart,
  Calendar,
  FolderOpen,
  Lock,
  PieChart,
} from 'lucide-react';
import { useDriveSafe } from '../context/DriveSafeContext';

export const SessionsView: React.FC = () => {
  const { sessionStats } = useDriveSafe();

  const futureCharts = [
    {
      id: 'chart-eye-timeline',
      title: 'Eye State Timeline',
      subtitle: 'Continuous classification timeline (OPEN vs CLOSED)',
      icon: LineChart,
      type: 'Time Series Ribbon',
    },
    {
      id: 'chart-closure-duration',
      title: 'Eye Closure Duration',
      subtitle: 'Histogram of continuous eye-closure episodes (seconds)',
      icon: BarChart2,
      type: 'Duration Histogram',
    },
    {
      id: 'chart-drowsiness-events',
      title: 'Drowsiness Events',
      subtitle: 'Temporal distribution of threshold breach occurrences',
      icon: AlertTriangle,
      type: 'Event Frequency Scatter',
    },
    {
      id: 'chart-session-duration',
      title: 'Session Duration & Vigilance',
      subtitle: 'Aggregate driver attentiveness index over prolonged trips',
      icon: PieChart,
      type: 'Cumulative Trip Vigilance',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 px-6 py-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white font-mono">Session Analytics & History</h1>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              PHASE 1 ARCHITECTURE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historical session telemetry, drowsiness event records, and model vigilance statistics
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <Calendar className="h-3.5 w-3.5 text-emerald-400" />
          <span>Active Session: None</span>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Monitoring Duration */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Session Time</span>
            <Clock className="h-5 w-5 text-slate-500" />
          </div>
          <p className="text-xs text-slate-400 font-medium">Monitoring Duration</p>
          <p className="text-2xl font-black font-mono text-white mt-2">
            {sessionStats.monitoringDuration}
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">
            Total active runtime
          </div>
        </div>

        {/* Card 2: Drowsiness Events */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Safety Events</span>
            <AlertTriangle className="h-5 w-5 text-slate-500" />
          </div>
          <p className="text-xs text-slate-400 font-medium">Drowsiness Events</p>
          <p className="text-2xl font-black font-mono text-white mt-2">
            {sessionStats.drowsinessEvents}
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">
            Threshold warnings triggered
          </div>
        </div>

        {/* Card 3: Longest Eye Closure */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Peak Closure</span>
            <Timer className="h-5 w-5 text-slate-500" />
          </div>
          <p className="text-xs text-slate-400 font-medium">Longest Eye Closure</p>
          <p className="text-2xl font-black font-mono text-slate-400 mt-2">
            {sessionStats.longestEyeClosure}
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">
            Maximum single continuous episode
          </div>
        </div>

        {/* Card 4: Average ML Confidence */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Model Quality</span>
            <BarChart2 className="h-5 w-5 text-slate-500" />
          </div>
          <p className="text-xs text-slate-400 font-medium">Average ML Confidence</p>
          <p className="text-2xl font-black font-mono text-slate-400 mt-2">
            {sessionStats.averageConfidence}
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">
            Mean inference certainty
          </div>
        </div>
      </div>

      {/* Realistic Empty-State Alert */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-8 text-center space-y-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-500">
          <FolderOpen className="h-7 w-7 stroke-[1.5]" />
        </div>
        <h2 className="text-base font-bold font-mono text-slate-200">
          No monitoring sessions recorded yet.
        </h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          In Phase 1, the session storage architecture and metrics contracts are established.
          Live recording will activate when monitoring sessions occur in Phase 8.
        </p>
      </div>

      {/* Planned Future Chart Containers (Phase 8 Roadmap) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono">
              Planned Session Visualizations
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chart containers reserved for telemetry analytics in Phase 8
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
            <Lock className="h-3 w-3" />
            <span>Phase 8 Analytics</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {futureCharts.map((chart) => {
            const Icon = chart.icon;
            return (
              <div
                key={chart.id}
                id={chart.id}
                className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <Icon className="h-4 w-4 text-slate-400" />
                      {chart.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{chart.subtitle}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                    {chart.type}
                  </span>
                </div>

                {/* Visual Chart Blueprint Placeholder Wireframe */}
                <div className="my-6 h-36 w-full rounded-lg border border-dashed border-slate-800 bg-slate-950/60 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-full flex items-end justify-between h-20 px-6 opacity-20">
                    <div className="w-4 bg-slate-600 rounded-t h-8" />
                    <div className="w-4 bg-slate-600 rounded-t h-14" />
                    <div className="w-4 bg-slate-600 rounded-t h-10" />
                    <div className="w-4 bg-slate-600 rounded-t h-16" />
                    <div className="w-4 bg-slate-600 rounded-t h-6" />
                    <div className="w-4 bg-slate-600 rounded-t h-12" />
                  </div>
                  <span className="text-xs font-mono text-slate-500 mt-2">
                    Chart rendering engine reserved for Phase 8
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800/60">
                  <span>Data Source: Local Session Log</span>
                  <span>Status: Awaiting Telemetry</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
