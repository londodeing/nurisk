import { Check } from 'lucide-react';

const STEPS = [
  { label: 'Akun', description: 'Data Diri' },
  { label: 'Peran', description: 'Role & Organisasi' },
  { label: 'Verifikasi', description: 'OTP & Selesai' },
];

interface RegisterProgressProps {
  currentStep: number;
}

export function RegisterProgress({ currentStep }: RegisterProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={step.label} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-nu-green text-white'
                      : isActive
                      ? 'bg-nu-green text-white ring-4 ring-nu-green/20'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check size={18} /> : stepNumber}
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-xs font-semibold ${isActive ? 'text-nu-green' : 'text-slate-500'}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-400 hidden sm:block">{step.description}</p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 mt-[-1.5rem] transition-colors duration-300 ${
                    isCompleted ? 'bg-nu-green' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RegisterProgress;
