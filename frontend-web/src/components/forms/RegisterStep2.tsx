import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface Step2Data {
  role: string;
  organization: string;
  province: string;
  city: string;
  district: string;
  skills: string[];
}

const INITIAL_DATA: Step2Data = {
  role: '',
  organization: '',
  province: '',
  city: '',
  district: '',
  skills: [],
};

const ROLE_OPTIONS = [
  { value: 'relawan', label: 'Relawan' },
  { value: 'field_staff', label: 'Field Staff' },
  { value: 'admin', label: 'Admin' },
  { value: 'public', label: 'Publik' },
];

const ORGANIZATION_OPTIONS = [
  { value: 'anshor', label: 'Anshor' },
  { value: 'banser', label: 'Banser' },
  { value: 'fatayat', label: 'Fatayat' },
  { value: 'ipnu', label: 'IPNU' },
  { value: 'ippnu', label: 'IPPNU' },
  { value: 'lpbi', label: 'LPBI' },
  { value: 'maarif', label: 'Maarif' },
  { value: 'muslimat', label: 'Muslimat' },
  { value: 'nusantara', label: 'Nusantara' },
  { value: 'pmii', label: 'PMII' },
  { value: 'ra', label: 'Rijalul Ansor' },
  { value: 'sar', label: 'SAR NU' },
  { value: '其他', label: 'Lainnya' },
];

const SKILL_OPTIONS = [
  { value: 'first_aid', label: 'Pertolongan Pertama' },
  { value: 'search_rescue', label: 'Search & Rescue' },
  { value: 'logistics', label: 'Logistik' },
  { value: 'communication', label: 'Komunikasi' },
  { value: 'transportation', label: 'Transportasi' },
  { value: 'it_support', label: 'IT Support' },
  { value: 'medical', label: 'Medis' },
  { value: 'dapur_umum', label: 'Dapur Umum' },
];

interface RegisterStep2Props {
  data: Step2Data;
  onChange: (data: Step2Data) => void;
  errors: Partial<Record<keyof Step2Data, string>>;
}

export function RegisterStep2({ data, onChange, errors }: RegisterStep2Props) {
  const update = (field: keyof Step2Data, value: string | string[]) => {
    onChange({ ...data, [field]: value });
  };

  const toggleSkill = (skill: string) => {
    const skills = data.skills.includes(skill)
      ? data.skills.filter((s) => s !== skill)
      : [...data.skills, skill];
    update('skills', skills);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="role" className="text-sm font-medium">Peran</Label>
        <select
          id="role"
          value={data.role}
          onChange={(e) => update('role', e.target.value)}
          className={`flex h-9 w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-green disabled:cursor-not-allowed disabled:opacity-50 ${
            errors.role ? 'border-danger-red' : 'border-slate-200'
          }`}
        >
          <option value="">Pilih peran...</option>
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {errors.role && <p className="text-xs text-danger-red mt-1">{errors.role}</p>}
      </div>

      <div>
        <Label htmlFor="organization" className="text-sm font-medium">Badan Otonom NU</Label>
        <select
          id="organization"
          value={data.organization}
          onChange={(e) => update('organization', e.target.value)}
          className={`flex h-9 w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-green disabled:cursor-not-allowed disabled:opacity-50 ${
            errors.organization ? 'border-danger-red' : 'border-slate-200'
          }`}
        >
          <option value="">Pilih organisasi...</option>
          {ORGANIZATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {errors.organization && <p className="text-xs text-danger-red mt-1">{errors.organization}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="province" className="text-sm font-medium">Provinsi</Label>
          <Input
            id="province"
            placeholder="Jawa Tengah"
            value={data.province}
            onChange={(e) => update('province', e.target.value)}
            className={errors.province ? 'border-danger-red' : ''}
          />
          {errors.province && <p className="text-xs text-danger-red mt-1">{errors.province}</p>}
        </div>
        <div>
          <Label htmlFor="city" className="text-sm font-medium">Kabupaten/Kota</Label>
          <Input
            id="city"
            placeholder="Kota Semarang"
            value={data.city}
            onChange={(e) => update('city', e.target.value)}
            className={errors.city ? 'border-danger-red' : ''}
          />
          {errors.city && <p className="text-xs text-danger-red mt-1">{errors.city}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="district" className="text-sm font-medium">Kecamatan</Label>
        <Input
          id="district"
          placeholder="Semarang Tengah"
          value={data.district}
          onChange={(e) => update('district', e.target.value)}
          className={errors.district ? 'border-danger-red' : ''}
        />
        {errors.district && <p className="text-xs text-danger-red mt-1">{errors.district}</p>}
      </div>

      <div>
        <Label className="text-sm font-medium">Keahlian</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {SKILL_OPTIONS.map((skill) => (
            <label
              key={skill.value}
              className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                data.skills.includes(skill.value)
                  ? 'border-nu-green bg-nu-green/5 text-nu-green'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={data.skills.includes(skill.value)}
                onChange={() => toggleSkill(skill.value)}
                className="sr-only"
              />
              <span className="text-sm">{skill.label}</span>
            </label>
          ))}
        </div>
        {errors.skills && <p className="text-xs text-danger-red mt-1">{errors.skills}</p>}
      </div>
    </div>
  );
}

export { INITIAL_DATA as INITIAL_STEP2_DATA };
export default RegisterStep2;
