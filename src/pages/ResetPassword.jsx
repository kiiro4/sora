import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Cloud, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ResetPassword() {
  const params = new URLSearchParams(window.location.search);
  const resetToken = params.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('パスワードが一致しません');
      return;
    }
    setLoading(true);
    await base44.auth.resetPassword({ resetToken, newPassword: password });
    setDone(true);
    setLoading(false);
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg mb-3">
          <Cloud className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-heading font-bold text-3xl text-foreground">SoraNi</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h2 className="font-heading font-bold text-xl text-foreground mb-4">新しいパスワード</h2>
        {done ? (
          <p className="text-sm text-muted-foreground text-center">パスワードを変更しました</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="新しいパスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl"
              required
            />
            <Input
              type="password"
              placeholder="パスワード（確認）"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="rounded-xl"
              required
            />
            {error && <p className="text-destructive text-xs">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary text-primary-foreground font-semibold"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '変更する'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}