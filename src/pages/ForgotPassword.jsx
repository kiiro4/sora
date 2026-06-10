import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Cloud, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.auth.resetPasswordRequest(email);
    setSent(true);
    setLoading(false);
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
        <h2 className="font-heading font-bold text-xl text-foreground mb-2">パスワードをリセット</h2>
        {sent ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">メールを送信しました。受信トレイをご確認ください。</p>
            <Link to="/login" className="mt-4 inline-block text-sm text-primary hover:underline">
              ログインに戻る
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <Input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl"
              required
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary text-primary-foreground font-semibold"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '送信する'}
            </Button>
          </form>
        )}
      </div>
      <Link to="/login" className="mt-6 text-sm text-muted-foreground hover:text-primary transition-colors">
        ← ログインに戻る
      </Link>
    </div>
  );
}