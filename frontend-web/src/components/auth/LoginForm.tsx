import { useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, Eye, EyeOff, Chrome, User } from 'lucide-react';
import { useAuthStore } from '@/stores/use-auth-store';

type LoginMethod = 'email' | 'nik';

export default function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isLoading } = useAuthStore();
  const { toast } = useToast();
  
  const [method, setMethod] = useState<LoginMethod>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nik, setNik] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (password.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }
    
    try {
      if (method === 'email') {
        await login(email, password);
      } else {
        // NIK login
        if (nik.length !== 16) {
          setError('NIK harus 16 digit');
          return;
        }
        await login(nik, password);
      }
      
      toast({ title: 'Login berhasil', variant: 'success' });
      navigate(redirectTo);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Email atau password salah';
      setError(message);
      toast({ title: 'Login gagal', description: message, variant: 'destructive' });
    }
  }, [method, email, password, nik, login, navigate, redirectTo, toast]);

  const handleGoogleLogin = useCallback(() => {
    // Redirect to Google OAuth
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Masuk</CardTitle>
        <CardDescription>
          {method === 'email' ? 'Masuk dengan email' : 'Masuk dengan NIK'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Method toggle */}
        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant={method === 'email' ? 'default' : 'outline'}
            onClick={() => setMethod('email')}
            className="flex-1"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
          <Button
            type="button"
            variant={method === 'nik' ? 'default' : 'outline'}
            onClick={() => setMethod('nik')}
            className="flex-1"
          >
            <User className="w-4 h-4 mr-2" />
            NIK
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {method === 'email' ? (
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          ) : (
            <div>
              <Label htmlFor="nik">NIK (Nomor Induk Kependudukan)</Label>
              <Input
                id="nik"
                type="text"
                placeholder="16 digit NIK"
                value={nik}
                onChange={(e) => setNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
                maxLength={16}
                required
              />
              <p className="text-xs text-slate-500 mt-1">Contoh: 3324010101990001</p>
            </div>
          )}

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (min. 8 karakter)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                minLength={8}
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
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <Label htmlFor="remember" className="text-sm cursor-pointer">
              Ingat saya
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Memuat...' : 'Masuk'}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500">atau</span>
          </div>
        </div>

        {/* Social login */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          className="w-full"
        >
          <Chrome className="w-4 h-4 mr-2" />
          Masuk dengan Google
        </Button>

        {/* Links */}
        <div className="mt-4 text-center text-sm">
          <Link to="/forgot-password" className="text-nu-green hover:underline">
            Lupa password?
          </Link>
        </div>

        <p className="mt-4 text-center text-sm text-slate-600">
          Belum punya akun?{' '}
          <Link to="/register" className="text-nu-green hover:underline">
            Daftar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}