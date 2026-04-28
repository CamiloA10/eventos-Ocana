import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X, LogOut, LayoutDashboard, Sparkles, Bell, Heart } from 'lucide-react';
import NotificationPreferences from './NotificationPreferences';

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled
        ? 'bg-white shadow-md border-b border-slate-100 py-3'
        : 'bg-white/90 backdrop-blur-sm py-4'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 rounded-lg p-1.5 transition-transform group-hover:scale-110">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            ¿Hey pa' <span className="text-blue-600">dónde vamos?</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/eventos" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-wider">
            Eventos
          </Link>

          {user && (
            <Link to="/eventos?categoria=Favoritos" className="flex items-center gap-2 text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              Mis Favoritos
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-2 text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              Panel Admin
            </Link>
          )}

          <div className="h-6 w-px bg-slate-200" />

          <div className="flex items-center gap-4">
            <NotificationPreferences />
            {user ? (
              <button
                onClick={signOut}
                className="flex items-center gap-2 text-slate-500 hover:text-red-600 font-semibold text-sm transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors px-4 py-2"
                >
                  Ingresar
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 text-slate-900" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 px-6 py-8 flex flex-col gap-6 animate-in slide-in-from-top-4 duration-200">
          <Link to="/eventos" className="text-xl font-bold text-slate-900" onClick={() => setOpen(false)}>Eventos</Link>
          {user && (
            <Link to="/eventos?categoria=Favoritos" className="flex items-center gap-3 text-xl font-bold text-slate-900" onClick={() => setOpen(false)}>
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              Mis Favoritos
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="text-xl font-bold text-blue-600" onClick={() => setOpen(false)}>Administrar</Link>
          )}
          <div className="flex items-center gap-4 py-2">
            <NotificationPreferences />
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Avisos Inteligentes</span>
          </div>
          <hr className="border-slate-100" />
          {user ? (
            <button onClick={() => { signOut(); setOpen(false); }} className="text-left font-bold text-red-500">
              Cerrar sesión
            </button>
          ) : (
            <div className="flex flex-col gap-4">
              <Link to="/login" className="text-center py-4 font-bold text-slate-600" onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" className="bg-blue-600 text-white py-4 rounded-xl text-center font-bold" onClick={() => setOpen(false)}>Crear Cuenta</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
