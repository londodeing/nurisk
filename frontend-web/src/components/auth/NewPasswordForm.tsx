import { useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import api from '@/services/api';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  { label: 'Minimal 8 karakter', test: (p) => p.length >= 8 },
  { label: 'Mengandung huruf besar', test: (p) => /[A-Z]/.test(p) },
  { label: 'Mengandung huruf kecil', test: (p) => /[a-z]/.test(p) },
  { label: 'Mengandung angka', test: (p) => /\d/.test(p) },
  { label: 'Mengandung simbol', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export default function NewPasswordForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const email = location.state?.email as string | undefined;
  const phone = location.state?.phone as string | undefined;

  // Password strength calculation
  const strength = useMemo(() => {
    const passed = requirements.filter(r => r.test(password)).length;
    if (passed === 0) return { score: 0, label: '', color: '' };
    if (passed <= 2) return { score: passed, label: 'Lemah', color: 'bg-danger-red' };
    if (passed <= 3) return { score: passed, label: 'Sedang', color: 'bg-warning-yellow' };
    if (passed <= 4) return { score: passed, label: 'Kuat', color: 'bg-nu-green' };
    return { score: passed, label: 'Sangat Kuat', color: 'bg-safe-green' };
  }, [password]);

  const isValid = password.length >= 8 && password === confirmPassword;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValid) {
      setError('Password tidak valid atau tidak cocok');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = email 
        ? { email, password: password } 
        : { phone: phone?.replace(/^0/, '+62'), password: password };
      
      await api.post('/auth/reset-password/confirm', payload);
      
      toast({ title: 'Password berhasil diubah', variant: 'success' });
      navigate('/login');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengubah password';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [email, phone, password, isValid, navigate, toast]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Password Baru</CardTitle>
        <CardDescription>
          Masukkan password baru yang kuat
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password">Password Baru</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password baru"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Strength indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div 
                      key={i} 
                      className={`h-1 flex-1 rounded ${
                        i <= strength.score ? strength.color : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs ${
                  strength.label === 'Sangat Kuat' ? 'text-safe-green' :
                  strength.label === 'Kuat' ? 'text-nu-green' :
                  strength.label === 'Sedang' ? 'text-warning-yellow' :
                  'text-danger-red'
                }`}>
                  Kekuatan: {strength.label}
                </p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Masukkan ulang password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {confirmPassword && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${
                password === confirmPassword ? 'text-safe-green' : 'text-danger-red'
              }`}>
                {password === confirmPassword ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                {password === confirmPassword ? 'Cocok' : 'Tidak cocok'}
              </p>
            )}
          </div>

          {/* Requirements checklist */}
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs font-medium mb-2">Password harus memenuhi:</p>
            <ul className="space-y-1">
              {requirements.map((req, i) => (
                <li key={i} className={`text-xs flex items-center gap-1 ${
                  req.test(password) ? 'text-safe-green' : 'text-slate-400'
                }`}>
                  {req.test(password) ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {req.label}
                </li>
              ))}
            </ul>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}