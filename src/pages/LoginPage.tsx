import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LogIn, Eye, EyeOff, Lock, Check } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password change state
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (needsPasswordChange) {
        // Validate new password rules
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
          setError('La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y un símbolo.');
          setLoading(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setError('Las contraseñas no coinciden.');
          setLoading(false);
          return;
        }

        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
          data: { needs_password_change: false }
        });

        if (updateError) {
          setError('Error al actualizar la contraseña: ' + updateError.message);
          setLoading(false);
          return;
        }

        // Password updated successfully
        navigate('/admin');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          setError('Correo o contraseña incorrectos');
          setLoading(false);
        } else {
          // Check if this user is a deactivated Aliado
          if (data.user?.user_metadata?.role === 'aliado') {
            const { data: checkAliado } = await supabase.from('aliados').select('name').eq('owner_email', email).maybeSingle();
            if (checkAliado && checkAliado.name.startsWith('[DESACTIVADO]')) {
              await supabase.auth.signOut();
              setError('Tu cuenta ha sido desactivada del sistema por un administrador.');
              setLoading(false);
              return;
            }
          }

          // Check if user needs a password change
          if (data.user?.user_metadata?.needs_password_change) {
            setNeedsPasswordChange(true);
            setLoading(false);
          } else {
            navigate('/admin');
          }
        }
      }
    } catch (err) {
      setError('Ocurrió un error inesperado');
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico primero para recuperar la contraseña.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      alert('Se ha enviado un enlace de recuperación a tu correo electrónico.');
    } catch (err: any) {
      if (err.message?.includes('Error sending recovery email') || err.message?.includes('rate limit')) {
        setError('El servicio de correo está temporalmente saturado o desactivado en Supabase. Intenta nuevamente más tarde o contacta al administrador.');
      } else {
        setError(err.message || 'Error al enviar el correo de recuperación');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md z-10 p-4">
        <div className="text-center mb-8">
          <Link to="/" className="flex justify-center mb-6">
            <img src={`${import.meta.env.BASE_URL}assets/logo.png`} alt="¿Hey pa' dónde vamos?" className="h-24 w-auto brightness-0 invert filter-none" style={{ filter: "invert(0)" }} />
          </Link>
          <h1 className="font-display text-3xl font-bold text-foreground mt-4 mb-2">
            {needsPasswordChange ? 'Cambio de Contraseña' : 'Iniciar Sesión'}
          </h1>
          <p className="text-muted-foreground">
            {needsPasswordChange
              ? 'Por seguridad, debes crear una nueva contraseña para continuar.'
              : 'Accede al panel de administración'}
          </p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 card-shadow">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!needsPasswordChange ? (
              <>
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
                  <div className="flex justify-end mt-2">
                    <button type="button" onClick={handleResetPassword} className="text-xs text-primary font-bold hover:underline">
                      ¿Has olvidado tu contraseña?
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Nueva Contraseña</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nueva contraseña"
                      className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Debe incluir mayúsculas, minúsculas y un símbolo. Mínimo 8 caracteres.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Confirmar Contraseña</label>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmar contraseña"
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </>
            )}

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
                needsPasswordChange ? <Check className="w-5 h-5" /> : <LogIn className="w-5 h-5" />
              )}
              {loading ? (needsPasswordChange ? 'Guardando...' : 'Ingresando...') : (needsPasswordChange ? 'Guardar y Continuar' : 'Iniciar Sesión')}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-muted-foreground text-sm">
          {needsPasswordChange ? (
            <button onClick={() => { supabase.auth.signOut(); setNeedsPasswordChange(false); }} className="text-primary font-medium hover:underline">
              Cancelar y salir
            </button>
          ) : (
            <Link to="/" className="text-primary font-medium hover:underline">← Volver al inicio</Link>
          )}
        </p>
      </div>
    </div>
  );
}
