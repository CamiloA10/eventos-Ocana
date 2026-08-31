import { useState } from 'react';
import { X, Check, Image as ImageIcon, Instagram } from 'lucide-react';
import { TikTokIcon, WhatsAppIcon } from '@/components/SocialIcons';
import { normalizeSportName, type Event, type Aliado } from '@/lib/events';

const CATEGORIES = ['Cultural', 'Deportivo', 'Turístico', 'Religioso'] as const;
const RELIGIOUS_SUB_CATEGORIES = ['Iglesia Católica', 'Iglesia Evangélica'] as const;
const SPORTS_SUB_CATEGORIES = ['Fútbol', 'Fútbol Sala', 'Baloncesto', 'Voleibol', 'Patinaje', 'Ciclismo', 'Atletismo', 'Otros'] as const;
type Category = typeof CATEGORIES[number];

interface EventFormProps {
  editId: string | null;
  initialData: any;
  aliados: Aliado[];
  isAliado: boolean;
  currentUserAliado?: Aliado | null;
  onSubmit: (payload: any, imageFile: File | null) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
  error?: string;
}

export function EventForm({
  editId,
  initialData,
  aliados,
  isAliado,
  currentUserAliado,
  onSubmit,
  onCancel,
  submitting,
  error
}: EventFormProps) {
  const [form, setForm] = useState(initialData);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const currentAliado = isAliado ? currentUserAliado : aliados.find(a => a.id === form.aliado_id);
  const displayCategory = isAliado ? (currentAliado?.category || form.category || 'Tu categoría asignada') : (currentAliado?.category || form.category || 'Esperando selección...');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form, imageFile);
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-3xl w-full max-w-2xl my-8 card-shadow">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="font-display text-xl font-bold text-foreground">
            {editId ? 'Editar Evento' : 'Nuevo Evento'}
          </h3>
          <button onClick={onCancel} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1">Título *</label>
              <input
                required
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
                placeholder="Nombre del evento"
              />
            </div>

            {!isAliado && (
              <div>
                <label className="block text-sm font-semibold mb-1">Aliado Responsable *</label>
                <select
                  required
                  value={form.aliado_id}
                  onChange={e => {
                    const aId = e.target.value;
                    const selected = aliados.find(a => a.id === aId);
                    setForm({
                      ...form,
                      aliado_id: aId,
                      category: selected?.category || form.category,
                      sub_category: selected?.category === 'Religioso' ? selected.sub_category : (selected?.category === 'Deportivo' ? (selected.sub_category || '') : '')
                    });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">Seleccionar aliado...</option>
                  {aliados.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}

            {/* Categoría oculta */}
            <div className="hidden">
              <div>
                <label className="block text-sm font-semibold mb-1">Categoría</label>
                <div className="px-4 py-2.5 rounded-xl border-2 border-border bg-muted/50 font-semibold flex items-center justify-between">
                  <span className={displayCategory === 'Esperando selección...' ? 'text-muted-foreground font-normal' : 'text-foreground'}>
                    {displayCategory}
                  </span>
                  {isAliado && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">Asignada</span>}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {isAliado ? 'Tu categoría es asignada por la administración.' : 'La categoría se hereda del aliado seleccionado.'}
                </p>
              </div>
            </div>

            {displayCategory === 'Religioso' && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                <label className="block text-sm font-semibold mb-1 text-primary">Denominación</label>
                <div className="px-4 py-2.5 rounded-xl border-2 border-primary/20 bg-primary/5 text-foreground font-semibold">
                  {isAliado ? form.sub_category : (currentAliado?.sub_category || form.sub_category)}
                </div>
              </div>
            )}

            {displayCategory === 'Deportivo' && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                <label className="block text-sm font-semibold mb-1 text-primary">Deporte *</label>
                <select
                  required
                  value={
                    SPORTS_SUB_CATEGORIES.includes(form.sub_category as any) && form.sub_category !== 'Otros'
                      ? form.sub_category
                      : (form.sub_category ? 'Otros' : '')
                  }
                  onChange={e => {
                    const nextValue = e.target.value;
                    setForm({ ...form, sub_category: nextValue === 'Otros' ? 'Otros' : normalizeSportName(nextValue) });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-primary/20 bg-primary/5 text-foreground font-semibold focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">Seleccionar deporte...</option>
                  {SPORTS_SUB_CATEGORIES.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                </select>

                {/* Custom sport input if 'Otros' is selected or a custom sport is present */}
                {(form.sub_category && (!SPORTS_SUB_CATEGORIES.includes(form.sub_category as any) || form.sub_category === 'Otros')) ? (
                  <div className="mt-2 animate-in slide-in-from-top-2 duration-300">
                    <input
                      type="text"
                      required
                      placeholder="Escribe el nombre del deporte..."
                      value={form.sub_category === 'Otros' ? '' : form.sub_category}
                      onChange={e => setForm({ ...form, sub_category: e.target.value === '' ? 'Otros' : normalizeSportName(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                ) : null}
              </div>
            )}


            <div>
              <label className="block text-sm font-semibold mb-1">Fecha *</label>
              <input
                required
                type="date"
                min={editId && form.event_date === initialData?.event_date && form.event_date < todayStr ? form.event_date : todayStr}
                value={form.event_date}
                onChange={e => {
                  const newDate = e.target.value;
                  if (newDate !== initialData?.event_date && newDate < todayStr) {
                    alert('Si modificas la fecha, debes seleccionar una fecha que no haya pasado (hoy o a futuro).');
                    return;
                  }
                  setForm({ ...form, event_date: newDate });
                }}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Hora</label>
              <input
                type="time"
                value={form.event_time}
                onChange={e => setForm({ ...form, event_time: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Lugar *</label>
              <input
                required
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
                placeholder="Lugar del evento"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1">Descripción *</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors resize-none"
                placeholder="Describe el evento..."
              />
            </div>

            <div className="md:col-span-2 pt-4 border-t border-border">
              <h4 className="text-sm font-bold text-primary mb-3">Redes Sociales (Opcionales)</h4>
              <p className="text-[10px] text-muted-foreground mb-3">Estos enlaces se mostrarán en la tarjeta de detalles del evento para que los asistentes puedan contactar o ver más sobre el organizador.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    placeholder="https://wa.me/num..."
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1">Imagen</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer bg-muted hover:bg-muted/70 border-2 border-dashed border-border px-4 py-2.5 rounded-xl flex-1 transition-colors">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {imageFile ? imageFile.name : 'Subir imagen'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => setImageFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
              <input
                value={form.image_url}
                onChange={e => setForm({ ...form, image_url: e.target.value })}
                className="w-full mt-2 px-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors text-sm"
                placeholder="O pega una URL de imagen..."
              />
            </div>
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
              {submitting ? 'Guardando...' : editId ? 'Actualizar' : 'Crear Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
