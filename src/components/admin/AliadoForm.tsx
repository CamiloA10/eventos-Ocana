import { useState } from 'react';
import { X, Check, Instagram } from 'lucide-react';
import { TikTokIcon, WhatsAppIcon } from '@/components/SocialIcons';
import { type AliadoFormData } from '@/lib/aliados';

interface AliadoFormProps {
  editId: string | null;
  initialData: AliadoFormData;
  onSubmit: (data: AliadoFormData) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
  error?: string;
}

const CATEGORIES = ['Cultural', 'Deportivo', 'Turístico', 'Religioso'] as const;
const RELIGIOUS_SUB_CATEGORIES = ['Iglesia Católica', 'Iglesia Evangélica'] as const;
const SPORTS_SUB_CATEGORIES = ['Fútbol', 'Fútbol Sala', 'Baloncesto', 'Voleibol', 'Patinaje', 'Ciclismo', 'Atletismo', 'Otros'] as const;

export function AliadoForm({
  editId,
  initialData,
  onSubmit,
  onCancel,
  submitting,
  error
}: AliadoFormProps) {
  const [form, setForm] = useState(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-3xl w-full max-w-md my-8 card-shadow">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="font-display text-xl font-bold text-foreground">
            {editId ? 'Editar Aliado' : 'Nuevo Aliado'}
          </h3>
          <button onClick={onCancel} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Nombre *</label>
            <input
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Categoría Principal *</label>
              <select
                required
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value, sub_category: e.target.value === 'Religioso' ? 'Iglesia Católica' : (e.target.value === 'Deportivo' ? 'Fútbol' : '') })}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
              >
                <option value="">Seleccionar categoría...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {form.category === 'Religioso' && (
              <div>
                <label className="block text-sm font-semibold mb-1">Denominación *</label>
                <select
                  value={form.sub_category}
                  onChange={e => setForm({ ...form, sub_category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
                >
                  {RELIGIOUS_SUB_CATEGORIES.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                </select>
              </div>
            )}

            {form.category === 'Deportivo' && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                <label className="block text-sm font-semibold mb-1">Deporte *</label>
                <select
                  required
                  value={
                    SPORTS_SUB_CATEGORIES.includes(form.sub_category as any) && form.sub_category !== 'Otros'
                      ? form.sub_category
                      : (form.sub_category ? 'Otros' : '')
                  }
                  onChange={e => setForm({ ...form, sub_category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
                >
                  {SPORTS_SUB_CATEGORIES.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                </select>

                {(form.sub_category && (!SPORTS_SUB_CATEGORIES.includes(form.sub_category as any) || form.sub_category === 'Otros')) ? (
                  <div className="mt-2 animate-in slide-in-from-top-2 duration-300">
                    <input
                      type="text"
                      required
                      placeholder="Escribe el nombre del deporte..."
                      value={form.sub_category === 'Otros' ? '' : form.sub_category}
                      onChange={e => setForm({ ...form, sub_category: e.target.value === '' ? 'Otros' : e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Descripción</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-bold text-primary mb-3">Redes Sociales (Opcional)</h4>
            <div className="space-y-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold mb-1">
                  <TikTokIcon className="w-4 h-4" /> Enlace de TikTok
                </label>
                <input
                  type="url"
                  value={form.tiktok_url || ''}
                  onChange={e => setForm({ ...form, tiktok_url: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors text-sm"
                  placeholder="https://tiktok.com/@usuario"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold mb-1">
                  <Instagram className="w-4 h-4" /> Enlace de Instagram
                </label>
                <input
                  type="url"
                  value={form.instagram_url || ''}
                  onChange={e => setForm({ ...form, instagram_url: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors text-sm"
                  placeholder="https://instagram.com/usuario"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold mb-1">
                  <WhatsAppIcon className="w-4 h-4" /> Enlace de WhatsApp
                </label>
                <input
                  type="url"
                  value={form.whatsapp_url || ''}
                  onChange={e => setForm({ ...form, whatsapp_url: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors text-sm"
                  placeholder="https://wa.me/numerodetelefono"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-bold text-primary mb-3">Credenciales de Acceso</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors text-sm"
                  placeholder="aliado@ejemplo.com"
                />
              </div>
              {!editId && (
                <div>
                  <label className="block text-xs font-semibold mb-1">Contraseña *</label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors text-sm"
                    placeholder="Min. 6 caracteres"
                  />
                </div>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 italic">
              * Estos datos permiten el acceso del aliado al panel.
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl border-2 border-border font-semibold hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-60"
            >
              {submitting ? (
                <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Check className="w-5 h-5" />
              )}
              {submitting ? 'Guardando...' : editId ? 'Actualizar' : 'Crear Aliado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
