import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldAlert,
  Cpu,
  Layers,
  CheckCircle2,
  FileText,
  AlertOctagon,
  Terminal,
  BookOpen,
  Code,
  Sparkles,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'viva' | 'phases'>('overview');

  const techStack = [
    { category: 'Frontend Presentation', tech: 'HTML5, CSS3, Modern TypeScript / JavaScript, Tailwind CSS' },
    { category: 'Backend Web Server', tech: 'Python 3.10+, Flask REST / Socket pipeline' },
    { category: 'Computer Vision', tech: 'OpenCV (cv2), MediaPipe Face Mesh / Haar Cascades' },
    { category: 'Machine Learning', tech: 'TensorFlow / Keras (CNN), NumPy, Pandas, Scikit-learn' },
    { category: 'Model Target', tech: 'Binary Supervised Classification: OPEN vs CLOSED eye patches' },
    { category: 'Temporal Safety Logic', tech: 'Stateful continuous closure duration accumulator (Default 5.0s)' },
  ];

  const vivaTopics = [
    { num: '01', title: 'Problem Statement', desc: 'Driver fatigue and microsleep contribute to a large proportion of preventable vehicular accidents worldwide.' },
    { num: '02', title: 'Existing Systems', desc: 'Commercial automotive DMS rely on expensive infrared steering sensors or proprietary cameras inaccessible to budget vehicles.' },
    { num: '03', title: 'Proposed Solution', desc: 'An affordable, non-intrusive webcam-based visual monitoring pipeline analyzing facial landmarks and classified eye states.' },
    { num: '04', title: 'System Architecture', desc: 'Webcam feed → Face detection → Landmark extraction → Eye image patch → CNN Classifier → Temporal state machine → Alert.' },
    { num: '05', title: 'Dataset Strategy (Phase 4)', desc: 'Benchmark eye datasets (MRL Eye, Closed Eyes In The Wild - CEW) with balanced open/closed samples.' },
    { num: '06', title: 'Preprocessing (Phase 4)', desc: 'Grayscale conversion, histogram equalization, bounding-box cropping, and resizing to fixed CNN inputs (e.g., 24x24 or 32x32).' },
    { num: '07', title: 'Model Architecture (Phase 5)', desc: 'Convolutional Neural Network (Conv2D, MaxPooling2D, Dropout, Dense with Sigmoid/Softmax activation).' },
    { num: '08', title: 'Training & Validation', desc: 'Binary cross-entropy loss, Adam optimizer, train/val/test splits, early stopping to prevent overfitting.' },
    { num: '09', title: 'Real-Time Inference (Phase 6)', desc: 'Continuous frame ingestion with sliding window smoothing to prevent single-frame blink misclassifications.' },
    { num: '10', title: 'Temporal 5s Logic (Phase 7)', desc: 'Blinds are normal (0.1–0.4s). Drowsiness is continuous closure exceeding the 5.0-second safety threshold.' },
    { num: '11', title: 'Limitations', desc: 'Extreme head rotation, low ambient illumination, and heavy reflective eyewear require specialized handling.' },
    { num: '12', title: 'Future Enhancements', desc: 'Yawn detection, head pose estimation (PERCLOS metric), and embedded Raspberry Pi deployment.' },
  ];

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Title & Project Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-mono font-medium text-emerald-400">
            <GraduationCap className="h-3.5 w-3.5" />
            ACADEMIC PROJECT
          </span>
          <span className="text-xs text-slate-400 font-mono">
            BCA Final Year Capstone Project
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
          DriveSafe<span className="text-emerald-400"> AI</span>
        </h1>

        <p className="text-base text-slate-300 font-medium mt-1">
          Real-Time Driver Drowsiness Detection Using Computer Vision and Machine Learning
        </p>

        <p className="text-xs text-slate-400 leading-relaxed mt-4 max-w-3xl">
          DriveSafe AI is an academic prototype combining web development, computer vision and
          machine learning to investigate real-time driver drowsiness detection through webcam-based
          eye-state analysis.
        </p>

        {/* Mandatory Academic & Safety Disclaimer */}
        <div className="mt-6 rounded-lg border-2 border-red-500/40 bg-red-950/20 p-4 text-xs text-red-200">
          <div className="flex items-center gap-2 font-bold font-mono uppercase text-red-400 mb-1">
            <ShieldAlert className="h-4 w-4" />
            <span>Important Academic Prototype Disclaimer</span>
          </div>
          <p className="leading-relaxed">
            This application is an educational prototype and is not a certified automotive safety
            system. It cannot guarantee accident prevention, determine sleep with medical
            certainty, or replace professional driver-monitoring hardware.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        {[
          { id: 'overview', label: 'Technical Objectives & Stack', icon: Cpu },
          { id: 'viva', label: 'College Viva & Report Framework', icon: BookOpen },
          { id: 'phases', label: '10-Phase Project Protocol', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3 px-1 text-xs font-mono font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-emerald-400 text-emerald-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: Overview & Stack */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Core Objectives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
              <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider block mb-1">
                Objective 1
              </span>
              <h3 className="text-sm font-bold text-white font-mono">
                Machine-Learning Classification Objective
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Classify extracted eye regions of interest (ROI) into binary discrete states:
              </p>
              <div className="mt-3 flex gap-3 font-mono text-xs">
                <span className="px-3 py-1.5 rounded bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-bold">
                  OPEN
                </span>
                <span className="px-3 py-1.5 rounded bg-red-950/80 border border-red-500/60 text-red-300 font-bold">
                  CLOSED
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
              <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider block mb-1">
                Objective 2
              </span>
              <h3 className="text-sm font-bold text-white font-mono">
                Temporal Safety Detection Objective
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Track continuous eye-closure duration and generate multi-modal audio + visual
                warnings when threshold is breached:
              </p>
              <div className="mt-3 flex items-center gap-2 font-mono text-xs">
                <span className="px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-200">
                  Default Threshold: <strong className="text-emerald-400">5.0 seconds</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Technology Stack Matrix */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Primary Technology Stack
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {techStack.map((item) => (
                <div
                  key={item.category}
                  className="rounded-lg border border-slate-800 bg-slate-950/60 p-3.5"
                >
                  <span className="text-[11px] font-mono text-slate-500 uppercase block mb-1">
                    {item.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">{item.tech}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: Viva Topics */}
      {activeTab === 'viva' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 font-mono">
              12 Essential Topics for College Viva Evaluation & Project Dissertation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vivaTopics.map((topic) => (
              <div
                key={topic.num}
                className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 mb-1">
                  <span>TOPIC {topic.num}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-200">{topic.title}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">{topic.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: 10 Phases */}
      {activeTab === 'phases' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400 font-mono mb-2">
            Structured 10-Phase Development Protocol (Disciplined Iteration)
          </p>

          <div className="space-y-2">
            {[
              { phase: 'PHASE 1', name: 'Project Architecture & Frontend Foundation', status: 'ACTIVE / COMPLETED', desc: 'Architecture, requirements, UI/UX system, state management, and future integration contracts.' },
              { phase: 'PHASE 2', name: 'Webcam Access & Browser Pipeline', status: 'PENDING', desc: 'Local mediaStream camera connection, mirror options, frame rate handling.' },
              { phase: 'PHASE 3', name: 'Face and Eye Detection Using Computer Vision', status: 'PENDING', desc: 'OpenCV / MediaPipe facial landmark localization and eye region cropping.' },
              { phase: 'PHASE 4', name: 'Dataset Preparation & Preprocessing', status: 'PENDING', desc: 'Eye image dataset collection, labeling, augmentation, and normalization.' },
              { phase: 'PHASE 5', name: 'ML Model Development & Training', status: 'PENDING', desc: 'CNN training for OPEN vs CLOSED binary classification with loss evaluation.' },
              { phase: 'PHASE 6', name: 'Real-Time ML Inference Integration', status: 'PENDING', desc: 'Connecting trained model to incoming frame stream with probability confidence.' },
              { phase: 'PHASE 7', name: 'Temporal Drowsiness Logic & Alerts', status: 'PENDING', desc: 'Continuous 5.0-second timer algorithm, threshold triggers, audio-visual warning.' },
              { phase: 'PHASE 8', name: 'Analytics, Session History & Dashboard', status: 'PENDING', desc: 'Session metrics telemetry, graphs, events log, and vigilance scoring.' },
              { phase: 'PHASE 9', name: 'Testing, Edge Cases & Performance', status: 'PENDING', desc: 'Lighting variations, glasses, head pose angles, latency benchmarking.' },
              { phase: 'PHASE 10', name: 'Final Integration & Viva Preparation', status: 'PENDING', desc: 'Documentation, presentation slides, report compilation, and deployment.' },
            ].map((p, idx) => (
              <div
                key={p.phase}
                className={`rounded-lg border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono ${
                  idx === 0
                    ? 'border-emerald-500/80 bg-emerald-950/20 text-emerald-300'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{p.phase}: {p.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      idx === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-sans">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
