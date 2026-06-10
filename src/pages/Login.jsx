import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Cloud, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Login() {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await base44.auth.loginViaEmailPassword(email, password);
    window.location.href = '/';
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }
    setLoading(true);
    await base44.auth.register({ email, password });
    setOtpStep(true);
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await base44.auth.verifyOtp({ email, otpCode: otp });
    base44.auth.setToken(res.access_token);
    window.location.href = '/';
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg mb-3">
          <Cloud className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-heading font-bold text-3xl text-foreground">SoraNi</h1>
        <p className="text-muted-foreground text-sm mt-1">空の写真だけを共有するSNS</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        {/* Tabs */}
        {!otpStep && (
          <div className="flex rounded-xl bg-muted p-1 mb-6">
            {['login', 'register'].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                  tab === t ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'
                }`}
              >
                {t === 'login' ? 'ログイン' : '新規登録'}
              </button>
            ))}
          </div>
        )}

        {/* OTP step */}
        {otpStep ? (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-muted-foreground text-center mb-4">
              {email} に確認コードを送信しました
            </p>
            <Input
              type="text"
              placeholder="確認コード"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="rounded-xl text-center text-lg tracking-widest"
              maxLength={6}
            />
            {error && <p className="text-destructive text-xs text-center">{error}</p>}
            <Button
              type="submit"
              disabled={loading || !otp}
              className="w-full rounded-xl bg-primary text-primary-foreground font-semibold"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '確認する'}
            </Button>
            <button
              type="button"
              className="w-full text-xs text-muted-foreground hover:text-primary transition-colors"
              onClick={() => base44.auth.resendOtp(email)}
            >
              コードを再送する
            </button>
          </form>
        ) : tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl"
              required
            />
            <Input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl"
              required
            />
            {error && <p className="text-destructive text-xs">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary text-primary-foreground font-semibold"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ログイン'}
            </Button>
            <div className="text-center">
              <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                パスワードをお忘れですか？
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl"
              required
            />
            <Input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl"
              required
            />
            <Input
              type="password"
              placeholder="パスワード（確認）"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-xl"
              required
            />
            {error && <p className="text-destructive text-xs">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary text-primary-foreground font-semibold"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '登録する'}
            </Button>
          </form>
        )}
      </div>

      <Link to="/" className="mt-6 text-sm text-muted-foreground hover:text-primary transition-colors">
        ← トップに戻る
      </Link>
    </div>
  );
}