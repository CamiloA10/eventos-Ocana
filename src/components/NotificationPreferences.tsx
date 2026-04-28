import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, BellRing, Settings, Check, X, Sparkles, LogIn, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

const CATEGORIES = ['Cultural', 'Deportivo', 'Turístico', 'Religioso'];

export default function NotificationPreferences() {
  const [isOpen, setIsOpen] = useState(false);
  const [subscribedCategories, setSubscribedCategories] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Cargar preferencias desde Supabase si el usuario está logueado
  useEffect(() => {
    if (user && isOpen) {
      const fetchPrefs = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('notification_categories')
          .eq('id', user.id)
          .single();

        if (data && !error) {
          setSubscribedCategories(data.notification_categories || []);
        }
      };
      fetchPrefs();
    } else if (!user) {
      // Si no hay usuario, cargar de local por cortesía pero no es el canal oficial
      const saved = localStorage.getItem('notification_prefs');
      if (saved) setSubscribedCategories(JSON.parse(saved));
    }
  }, [user, isOpen]);

  const toggleCategory = (category: string) => {
    setSubscribedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSave = async () => {
    if (!user) return; // Ya se maneja en el UI, pero por seguridad

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          notification_categories: subscribedCategories,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "¡Listo!",
        description: subscribedCategories.length > 0
          ? `Te avisaremos por email (${user.email}) sobre eventos de: ${subscribedCategories.join(', ')}`
          : "Has desactivado todas las alertas.",
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "No pudimos conectar con el servidor. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md overflow-y-auto custom-scrollbar animate-in fade-in duration-300">
      <div className="min-h-screen flex items-start justify-center p-4 pt-[10vh]">
        <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-[0_32px_64px_-15px_rgba(0,0,0,0.3)] border border-slate-100 overflow-hidden transform animate-in zoom-in-95 duration-300 mb-20">

          {!user ? (
            // Vista para usuarios NO logueados
            <div className="p-10 text-center">
              <div className="bg-blue-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600">
                <Mail className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Recibe Alertas en tu Email</h3>
              <p className="text-slate-500 mb-10 leading-relaxed">
                Para suscribirte a las categorías y recibir avisos personalizados en tu correo, necesitas tener una cuenta.
              </p>
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
              >
                <LogIn className="w-5 h-5" />
                Iniciar Sesión
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="mt-6 text-slate-400 font-bold hover:text-slate-600 transition-colors"
              >
                Quizás más tarde
              </button>
            </div>
          ) : (
            // Vista para usuarios logueados
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2.5 rounded-2xl">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Notificaciones</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Avisos por Email</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-slate-500 mb-8 font-medium leading-relaxed text-sm">
                Te enviaremos un correo a <span className="text-blue-600 font-bold">{user.email}</span> apenas se publique un evento de tus categorías favoritas.
              </p>

              <div className="space-y-3">
                {CATEGORIES.map(cat => {
                  const isActive = subscribedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 ${isActive
                          ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                          : 'border-slate-100 bg-white hover:border-blue-200'
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-400'
                          }`}>
                          {cat === 'Cultural' ? '🎭' : cat === 'Deportivo' ? '⚽' : cat === 'Turístico' ? '🗺️' : '⛪'}
                        </div>
                        <span className={`font-bold transition-colors ${isActive ? 'text-blue-900' : 'text-slate-600'}`}>{cat}</span>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isActive ? 'bg-blue-600 border-blue-600' : 'border-slate-200'
                        }`}>
                        {isActive && <Check className="w-3 h-3 text-white stroke-[4px]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full mt-10 bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Guardando...' : 'Guardar Preferencias'}
              </button>
            </div>
          )}

          <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
              Sincronizado con tu cuenta
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-full hover:bg-slate-100 transition-colors group"
        title="Configurar notificaciones"
      >
        {subscribedCategories.length > 0 ? (
          <BellRing className="w-5 h-5 text-blue-600 animate-pulse-slow" />
        ) : (
          <Bell className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
        )}
        {(subscribedCategories.length > 0 && user) && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white animate-bounce-slow" />
        )}
      </button>

      {isOpen && createPortal(modalContent, document.body)}
    </>
  );
}
