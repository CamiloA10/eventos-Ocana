import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Sparkles } from 'lucide-react';

interface AdminHeaderProps {
  userEmail?: string;
  signOut: () => void;
}

export function AdminHeader({ userEmail, signOut }: AdminHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="bg-sidebar text-sidebar-foreground px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          ¿Hey pa' <span className="text-blue-600">dónde vamos?</span>
        </h1>
        <p className="text-xs text-sidebar-foreground/60">Panel de Administración</p>
      </div>
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 bg-sidebar-accent hover:bg-primary hover:text-primary-foreground text-sidebar-foreground px-4 py-2 rounded-full text-sm font-medium transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Ver Sitio
        </Link>
        <span className="text-sm hidden sm:block text-sidebar-foreground/70">{userEmail}</span>
        <button
          onClick={() => { signOut(); navigate('/'); }}
          className="flex items-center gap-2 bg-sidebar-accent hover:bg-primary hover:text-primary-foreground text-sidebar-foreground px-4 py-2 rounded-full text-sm font-medium transition-all"
        >
          <LogOut className="w-4 h-4" />
          Salir
        </button>
      </div>
    </header>
  );
}
