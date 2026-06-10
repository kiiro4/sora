import { Link } from 'react-router-dom';
import { Cloud, Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';

export default function Header({ onUploadClick }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-xl border-b border-border/60 shadow-sm">
      <div className="max-w-4xl mx-auto px-5 h-15 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary via-sky-400 to-accent flex items-center justify-center shadow-md shadow-primary/20">
            <Cloud className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-heading font-bold text-xl tracking-widest text-foreground">SoraNi</span>
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button
                onClick={onUploadClick}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 gap-1.5 font-semibold shadow-md shadow-primary/25 transition-all hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-px"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">投稿する</span>
              </Button>
              <Link to="/mypage">
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            </>
          ) : (
            <Link to="/login">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full px-5 border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground font-semibold transition-all"
              >
                ログイン
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}