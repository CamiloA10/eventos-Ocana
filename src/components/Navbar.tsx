import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-display text-xl font-bold text-gradient">
          ¿Qué hay pa' hacer?
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/eventos" className="text-foreground/80 hover:text-primary font-medium transition-colors">
            Eventos
          </Link>
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-1 text-accent hover:text-accent/80 font-medium transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              Panel Admin
            </Link>
          )}
          {user ? (
            <button
              onClick={signOut}
              className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground px-4 py-2 rounded-full font-medium transition-all"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-gradient-to-r from-orange-500 to-primary hover:from-primary hover:to-orange-600 text-white px-6 py-2.5 rounded-full font-extrabold transition-all hover:-translate-y-0.5 shadow-[0_5px_15px_-5px_rgba(255,100,0,0.4)]"
            >
              Iniciar sesión
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background border-t border-border px-4 py-4 flex flex-col gap-3">
          <Link to="/eventos" className="text-foreground/80 hover:text-primary font-medium py-2" onClick={() => setOpen(false)}>Eventos</Link>
          {isAdmin && (
            <Link to="/admin" className="text-accent font-medium py-2" onClick={() => setOpen(false)}>Panel Admin</Link>
          )}
          {user ? (
            <button onClick={() => { signOut(); setOpen(false); }} className="text-left text-foreground/70 font-medium py-2">
              Cerrar sesión
            </button>
          ) : (
            <Link to="/login" className="bg-gradient-to-r from-orange-500 to-primary text-white px-4 py-3 rounded-full text-center font-extrabold shadow-md" onClick={() => setOpen(false)}>
              Iniciar sesión
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
