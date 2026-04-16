import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LogIn, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError('Correo o contraseña incorrectos');
        setLoading(false);
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError('Ocurrió un error inesperado al iniciar sesión');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-2xl font-bold text-gradient">
            ¿Qué hay pa' hacer?
          </Link>
          <h1 className="font-display text-3xl font-bold text-foreground mt-4 mb-2">Iniciar Sesión</h1>
          <p className="text-muted-foreground">Accede al panel de administración</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 card-shadow">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Correo electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ocana.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-md disabled:opacity-60 disabled:translate-y-0"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-muted-foreground text-sm">
          <Link to="/" className="text-primary font-medium hover:underline">← Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}

