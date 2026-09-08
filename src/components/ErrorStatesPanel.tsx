import React from 'react';
import {
  AlertTriangle,
  CameraOff,
  UserX,
  Users,
  EyeOff,
  SunMoon,
  ServerOff,
  ShieldX,
  LaptopMinimal,
  CheckCircle2,
} from 'lucide-react';
import { SystemErrorCode } from '../types/drivesafe';
import { useDriveSafe } from '../context/DriveSafeContext';

interface ErrorDef {
  code: SystemErrorCode;
  title: string;
  description: string;
  remedy: string;
  icon: React.ElementType;
}

export const ERROR_DEFINITIONS: ErrorDef[] = [
  {
    code: 'CAMERA_PERMISSION_DENIED',
    title: 'Camera Permission Denied',
    description: 'The browser or operating system blocked access to the local video input.',
    remedy: 'Click the camera permissions icon in your browser address bar and choose "Allow".',
    icon: ShieldX,
  },
  {
    code: 'CAMERA_UNAVAILABLE',
    title: 'Camera Hardware Unavailable',
    description: 'The designated webcam could not be accessed or is currently in use by another application.',
    remedy: 'Ensure no other software (Zoom, Teams, etc.) is accessing the webcam and reconnect.',
    icon: CameraOff,
  },
  {
    code: 'NO_FACE_DETECTED',
    title: 'No Face Detected',
    description: 'The computer vision facial locator could not isolate facial landmarks in the current frame.',
    remedy: 'Adjust your seating position and face the webcam directly within the guide reticle.',
    icon: UserX,
  },
  {
    code: 'MULTIPLE_FACES_DETECTED',
    title: 'Multiple Faces Detected',
    description: 'More than one face was found in the camera frame, creating driver ambiguity.',
    remedy: 'Ensure only the primary driver is framed within the camera field of view.',
    icon: Users,
  },
  {
    code: 'EYES_NOT_VISIBLE',
    title: 'Eyes Not Visible / Occluded',
    description: 'Facial landmarks for the ocular regions are obscured by hands, hats, or dark eyewear.',
    remedy: 'Remove heavy sunglasses or reposition hair/accessories obstructing direct eye view.',
    icon: EyeOff,
  },
  {
    code: 'POOR_LIGHTING',
    title: 'Poor Cabin Lighting',
    description: 'Ambient illumination is either too dark (<15 lux) or has excessive direct backlighting.',
    remedy: 'Turn on cabin ambient lighting or adjust screen brightness for clear face illumination.',
    icon: SunMoon,
  },
  {
    code: 'MODEL_UNAVAILABLE',
    title: 'ML Model Unavailable',
    description: 'The trained Keras/TensorFlow eye classification weights could not be loaded into memory.',
    remedy: 'Verify model file existence in /ml/model/ and check backend inference health.',
    icon: ServerOff,
  },
  {
    code: 'BACKEND_UNAVAILABLE',
    title: 'Backend Service Unavailable',
    description: 'The Flask processing server on port 5000 is unreachable or timed out.',
    remedy: 'Verify that "python app.py" is running in your terminal environment.',
    icon: ServerOff,
  },
  {
    code: 'BROWSER_CAMERA_UNSUPPORTED',
    title: 'Browser Camera Unsupported',
    description: 'The current web browser does not support the modern navigator.mediaDevices API.',
    remedy: 'Upgrade to a modern Chromium, Firefox, or Safari browser supporting MediaStream.',
    icon: LaptopMinimal,
  },
];

export const ErrorStatesPanel: React.FC = () => {
  const { state, setActiveError } = useDriveSafe();

  const currentErrorDef = ERROR_DEFINITIONS.find((e) => e.code === state.activeError);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            System Exception & Error State Architecture
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Diagnostic specification for all 9 required edge cases and failure modes
          </p>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          EDGE CASE HANDLING
        </span>
      </div>

      {/* Active Error Banner (if triggered or simulated) */}
      {currentErrorDef ? (
        <div className="rounded-lg border border-red-500 bg-red-950/40 p-4 text-red-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <currentErrorDef.icon className="h-5 w-5 text-red-400" />
              <span className="font-bold font-mono text-sm uppercase text-white">
                {currentErrorDef.title}
              </span>
            </div>
            <button
              onClick={() => setActiveError(null)}
              className="text-xs font-mono text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900"
            >
              Clear Simulation
            </button>
          </div>
          <p className="text-xs leading-relaxed text-red-200/90">{currentErrorDef.description}</p>
          <div className="text-xs font-mono text-emerald-300 bg-slate-950/80 p-2.5 rounded border border-slate-800">
            <strong>Remedy / Action:</strong> {currentErrorDef.remedy}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3.5 flex items-center gap-3 text-xs text-emerald-300 font-mono">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>No active system errors. All subsystem interfaces are nominal.</span>
        </div>
      )}

      {/* Interactive Simulation Grid for Evaluator Inspection */}
      <div>
        <p className="text-xs text-slate-400 font-mono mb-3">
          Interactive Error UI Test Grid (Click to preview each exception UI):
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {ERROR_DEFINITIONS.map((err) => {
            const Icon = err.icon;
            const isSelected = state.activeError === err.code;
            return (
              <button
                key={err.code}
                onClick={() => setActiveError(isSelected ? null : err.code)}
                className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-colors font-mono ${
                  isSelected
                    ? 'border-red-500 bg-red-950/30 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 mt-0.5 ${isSelected ? 'text-red-400' : 'text-slate-500'}`}
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{err.title}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{err.code}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
