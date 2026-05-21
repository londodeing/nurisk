import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface Step1Data {
  name: string;
  nik: string;
  birthDate: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const INITIAL_DATA: Step1Data = {
  name: '',
  nik: '',
  birthDate: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

interface RegisterStep1Props {
  data: Step1Data;
  onChange: (data: Step1Data) => void;
  errors: Partial<Record<keyof Step1Data, string>>;
}

export function RegisterStep1({ data, onChange, errors }: RegisterStep1Props) {
  const update = (field: keyof Step1Data, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-sm font-medium">Nama Lengkap</Label>
        <Input
          id="name"
          placeholder="Nama sesuai KTP"
          value={data.name}
          onChange={(e) => update('name', e.target.value)}
          className={errors.name ? 'border-danger-red' : ''}
        />
        {errors.name && <p className="text-xs text-danger-red mt-1">{errors.name}</p>}
      </div>

      <div>
        <Label htmlFor="nik" className="text-sm font-medium">NIK (16 digit)</Label>
        <Input
          id="nik"
          placeholder="3324010101990001"
          value={data.nik}
          onChange={(e) => update('nik', e.target.value.replace(/\D/g, '').slice(0, 16))}
          maxLength={16}
          className={errors.nik ? 'border-danger-red' : ''}
        />
        {data.nik.length > 0 && (
          <p className={`text-xs mt-1 ${data.nik.length === 16 ? 'text-safe-green' : 'text-slate-400'}`}>
            {data.nik.length}/16 digit
          </p>
        )}
        {errors.nik && <p className="text-xs text-danger-red mt-1">{errors.nik}</p>}
      </div>

      <div>
        <Label htmlFor="birthDate" className="text-sm font-medium">Tanggal Lahir</Label>
        <Input
          id="birthDate"
          type="date"
          value={data.birthDate}
          onChange={(e) => update('birthDate', e.target.value)}
          className={errors.birthDate ? 'border-danger-red' : ''}
        />
        {errors.birthDate && <p className="text-xs text-danger-red mt-1">{errors.birthDate}</p>}
      </div>

      <div>
        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="email@example.com"
          value={data.email}
          onChange={(e) => update('email', e.target.value)}
          className={errors.email ? 'border-danger-red' : ''}
        />
        {errors.email && <p className="text-xs text-danger-red mt-1">{errors.email}</p>}
      </div>

      <div>
        <Label htmlFor="phone" className="text-sm font-medium">Nomor HP</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="081234567890"
          value={data.phone}
          onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 14))}
          className={errors.phone ? 'border-danger-red' : ''}
        />
        <p className="text-xs text-slate-400 mt-1">Contoh: 081234567890</p>
        {errors.phone && <p className="text-xs text-danger-red mt-1">{errors.phone}</p>}
      </div>

      <div>
        <Label htmlFor="password" className="text-sm font-medium">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Minimal 8 karakter"
          value={data.password}
          onChange={(e) => update('password', e.target.value)}
          className={errors.password ? 'border-danger-red' : ''}
        />
        {errors.password && <p className="text-xs text-danger-red mt-1">{errors.password}</p>}
      </div>

      <div>
        <Label htmlFor="confirmPassword" className="text-sm font-medium">Konfirmasi Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Masukkan ulang password"
          value={data.confirmPassword}
          onChange={(e) => update('confirmPassword', e.target.value)}
          className={errors.confirmPassword ? 'border-danger-red' : ''}
        />
        {data.confirmPassword && data.password !== data.confirmPassword && (
          <p className="text-xs text-danger-red mt-1">Password tidak cocok</p>
        )}
        {errors.confirmPassword && <p className="text-xs text-danger-red mt-1">{errors.confirmPassword}</p>}
      </div>
    </div>
  );
}

export { INITIAL_DATA as INITIAL_STEP1_DATA };
export default RegisterStep1;
