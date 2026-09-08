import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  HelpCircle,
  CameraOff,
  Camera,
  UserX,
  EyeOff,
  ServerOff,
} from 'lucide-react';
import { DrowsinessRisk, CameraStatus, FaceStatus, EyeStatus, SystemErrorCode } from '../types/drivesafe';

interface StatusBadgeProps {
  type: 'drowsiness' | 'camera' | 'face' | 'eye' | 'error';
  status: string;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, status, size = 'md', id }) => {
  let label = status;
  let bgClass = 'bg-slate-800/80 border-slate-700 text-slate-300';
  let dotClass = 'bg-slate-400';
  let IconComponent: React.ElementType = HelpCircle;

  if (type === 'drowsiness') {
    const risk = status as DrowsinessRisk;
    switch (risk) {
      case 'ATTENTIVE':
        label = 'ALERT / ATTENTIVE';
        bgClass = 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300';
        dotClass = 'bg-emerald-400';
        IconComponent = CheckCircle2;
        break;
      case 'MONITORING':
        label = 'MONITORING';
        bgClass = 'bg-amber-950/80 border-amber-500/60 text-amber-300';
        dotClass = 'bg-amber-400 animate-pulse';
        IconComponent = Clock;
        break;
      case 'WAITING_FOR_ANALYSIS':
        label = 'WAITING FOR ANALYSIS';
        bgClass = 'bg-amber-950/60 border-amber-600/50 text-amber-300';
        dotClass = 'bg-amber-400 animate-pulse';
        IconComponent = Clock;
        break;
      case 'POSSIBLE_DROWSINESS':
        label = 'POSSIBLE DROWSINESS';
        bgClass = 'bg-orange-950/80 border-orange-500/70 text-orange-300';
        dotClass = 'bg-orange-400';
        IconComponent = AlertTriangle;
        break;
      case 'DROWSINESS_ALERT':
        label = 'DROWSINESS ALERT';
        bgClass = 'bg-red-950/90 border-red-500 text-red-200 shadow-lg shadow-red-900/30';
        dotClass = 'bg-red-500 animate-ping';
        IconComponent = AlertOctagon;
        break;
      case 'NOT_MONITORING':
        label = 'NOT MONITORING';
        bgClass = 'bg-slate-900/80 border-slate-700 text-slate-400';
        dotClass = 'bg-slate-500';
        IconComponent = Clock;
        break;
      default:
        label = status || 'UNKNOWN';
        bgClass = 'bg-slate-900/80 border-slate-700 text-slate-400';
        dotClass = 'bg-slate-500';
        IconComponent = HelpCircle;
    }
  } else if (type === 'camera') {
    const cam = status as CameraStatus;
    switch (cam) {
      case 'CONNECTED':
        label = 'CONNECTED';
        bgClass = 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300';
        dotClass = 'bg-emerald-400';
        IconComponent = CheckCircle2;
        break;
      case 'REQUESTING_ACCESS':
        label = 'REQUESTING ACCESS';
        bgClass = 'bg-amber-950/80 border-amber-500/60 text-amber-300';
        dotClass = 'bg-amber-400 animate-pulse';
        IconComponent = Camera;
        break;
      case 'INITIALIZING':
        label = 'INITIALIZING';
        bgClass = 'bg-amber-950/80 border-amber-500/60 text-amber-300';
        dotClass = 'bg-amber-400';
        IconComponent = Clock;
        break;
      case 'DISCONNECTED':
        label = 'DISCONNECTED';
        bgClass = 'bg-slate-900/80 border-slate-700 text-slate-400';
        dotClass = 'bg-slate-500';
        IconComponent = CameraOff;
        break;
      case 'ERROR':
        label = 'CAMERA ERROR';
        bgClass = 'bg-red-950/80 border-red-600/70 text-red-300';
        dotClass = 'bg-red-400';
        IconComponent = CameraOff;
        break;
      default:
        label = 'NOT CONNECTED';
        bgClass = 'bg-slate-900/80 border-slate-700 text-slate-400';
        dotClass = 'bg-slate-500';
        IconComponent = CameraOff;
    }
  } else if (type === 'face') {
    const face = status as FaceStatus;
    switch (face) {
      case 'WAITING_FOR_DETECTION':
        label = 'WAITING FOR DETECTION';
        bgClass = 'bg-amber-950/60 border-amber-600/50 text-amber-300';
        dotClass = 'bg-amber-400 animate-pulse';
        IconComponent = Clock;
        break;
      case 'DETECTED':
        label = 'DETECTED';
        bgClass = 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300';
        dotClass = 'bg-emerald-400';
        IconComponent = CheckCircle2;
        break;
      case 'NOT_DETECTED':
        label = 'NOT DETECTED';
        bgClass = 'bg-amber-950/80 border-amber-600/60 text-amber-300';
        dotClass = 'bg-amber-400';
        IconComponent = UserX;
        break;
      case 'MULTIPLE_FACES':
        label = 'MULTIPLE FACES';
        bgClass = 'bg-orange-950/80 border-orange-600/60 text-orange-300';
        dotClass = 'bg-orange-400';
        IconComponent = AlertTriangle;
        break;
      case 'POOR_LIGHTING':
        label = 'POOR LIGHTING';
        bgClass = 'bg-orange-950/80 border-orange-600/60 text-orange-300';
        dotClass = 'bg-orange-400';
        IconComponent = AlertTriangle;
        break;
      default:
        label = 'WAITING';
        bgClass = 'bg-slate-900/80 border-slate-700 text-slate-400';
        dotClass = 'bg-slate-500';
        IconComponent = Clock;
    }
  } else if (type === 'eye') {
    const eye = status as EyeStatus;
    switch (eye) {
      case 'WAITING_FOR_DETECTION':
        label = 'WAITING FOR DETECTION';
        bgClass = 'bg-amber-950/60 border-amber-600/50 text-amber-300';
        dotClass = 'bg-amber-400 animate-pulse';
        IconComponent = Clock;
        break;
      case 'DETECTED':
        label = 'TRACKING';
        bgClass = 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300';
        dotClass = 'bg-emerald-400';
        IconComponent = CheckCircle2;
        break;
      case 'NOT_DETECTED':
        label = 'EYE NOT DETECTED';
        bgClass = 'bg-amber-950/80 border-amber-600/60 text-amber-300';
        dotClass = 'bg-amber-400';
        IconComponent = EyeOff;
        break;
      case 'OCCLUDED':
        label = 'OCCLUDED';
        bgClass = 'bg-orange-950/80 border-orange-600/60 text-orange-300';
        dotClass = 'bg-orange-400';
        IconComponent = AlertTriangle;
        break;
      default:
        label = 'WAITING';
        bgClass = 'bg-slate-900/80 border-slate-700 text-slate-400';
        dotClass = 'bg-slate-500';
        IconComponent = Clock;
    }
  } else if (type === 'error') {
    const err = status as SystemErrorCode;
    switch (err) {
      case 'CAMERA_PERMISSION_DENIED':
        label = 'PERMISSION DENIED';
        bgClass = 'bg-red-950/80 border-red-600 text-red-300';
        IconComponent = CameraOff;
        break;
      case 'CAMERA_BUSY':
        label = 'CAMERA BUSY / IN USE';
        bgClass = 'bg-red-950/80 border-red-600 text-red-300';
        IconComponent = CameraOff;
        break;
      case 'MODEL_UNAVAILABLE':
        label = 'MODEL UNAVAILABLE';
        bgClass = 'bg-amber-950/80 border-amber-600 text-amber-300';
        IconComponent = ServerOff;
        break;
      default:
        label = err.replace(/_/g, ' ');
        bgClass = 'bg-red-950/80 border-red-600 text-red-300';
        IconComponent = AlertTriangle;
    }
  }

  const sizeClasses =
    size === 'sm'
      ? 'text-xs px-2.5 py-0.5 gap-1.5'
      : size === 'lg'
      ? 'text-sm font-semibold px-4 py-1.5 gap-2.5'
      : 'text-xs font-medium px-3 py-1 gap-2';

  return (
    <span
      id={id}
      className={`inline-flex items-center rounded-md border font-mono tracking-wider transition-colors ${bgClass} ${sizeClasses}`}
      role="status"
      aria-label={`Status: ${label}`}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} aria-hidden="true" />
      <IconComponent className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span className="whitespace-nowrap uppercase">{label}</span>
    </span>
  );
};
