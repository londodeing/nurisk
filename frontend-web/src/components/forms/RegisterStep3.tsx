import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, Phone } from 'lucide-react';

export interface Step3Data {
  otp: string;
}

const INITIAL_DATA: Step3Data = {
  otp: '',
};

interface RegisterStep3Props {
  data: Step3Data;
  onChange: (data: Step3Data) => void;
  errors: Partial<Record<keyof Step3Data, string>>;
  email: string;
  phone: string;
  onResendOtp: () => void;
  isResending: boolean;
  countdown: number;
}

export function RegisterStep3({
  data,
  onChange,
  errors,
  email,
  phone,
  onResendOtp,
  isResending,
  countdown,
}: RegisterStep3Props) {
  const update = (field: keyof Step3Data, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 mx-auto text-nu-green mb-4" />
        <h3 className="text-lg font-semibold text-slate-800">Verifikasi Data</h3>
        <p className="text-sm text-slate-500 mt-1">
          Kami telah mengirim kode verifikasi ke:
        </p>
      </div>

      <div className="bg-slate-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Mail size={18} className="text-slate-400 shrink-0" />
          <span className="text-sm font-medium text-slate-700">{email}</span>
        </div>
        <div className="flex items-center gap-3">
          <Phone size={18} className="text-slate-400 shrink-0" />
          <span className="text-sm font-medium text-slate-700">{phone}</span>
        </div>
      </div>

      <div>
        <Label htmlFor="otp" className="text-sm font-medium">Kode OTP (6 digit)</Label>
        <Input
          id="otp"
          placeholder="000000"
          value={data.otp}
          onChange={(e) => update('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
          maxLength={6}
          className={`text-center text-2xl tracking-[0.5em] font-mono ${
            errors.otp ? 'border-danger-red' : ''
          }`}
        />
        {errors.otp && <p className="text-xs text-danger-red mt-1">{errors.otp}</p>}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onResendOtp}
        disabled={isResending || countdown > 0}
        className="w-full"
      >
        {isResending
          ? 'Mengirim...'
          : countdown > 0
          ? `Kirim Ulang (${countdown}s)`
          : 'Kirim Ulang OTP'}
      </Button>
    </div>
  );
}

export { INITIAL_DATA as INITIAL_STEP3_DATA };
export default RegisterStep3;
