import { useState } from 'react';
import { X, Check, Image as ImageIcon } from 'lucide-react';
import { type Event, type Company } from '@/lib/events';

const CATEGORIES = ['Cultural', 'Deportivo', 'Turístico', 'Religioso'] as const;
const RELIGIOUS_SUB_CATEGORIES = ['Iglesia Católica', 'Iglesia Evangélica'] as const;
type Category = typeof CATEGORIES[number];

interface EventFormProps {
  editId: string | null;
  initialData: any;
  companies: Company[];
  isCompany: boolean;
  onSubmit: (payload: any, imageFile: File | null) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
  error?: string;
}

export function EventForm({
  editId,
  initialData,
  companies,
  isCompany,
  onSubmit,
  onCancel,
  submitting,
  error
}: EventFormProps) {
  const [form, setForm] = useState(initialData);
  const [imageFile, setImageFile] = useState<File | null>(null);

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

            <div>
              <label className="block text-sm font-semibold mb-1">Categoría *</label>
              <select
                value={form.category}
                onChange={e => {
                  const newCat = e.target.value as Category;
                  setForm({
                    ...form,
                    category: newCat,
                    sub_category: newCat === 'Religioso' ? 'Iglesia Católica' : ''
                  });
                }}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {form.category === 'Religioso' && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                <label className="block text-sm font-semibold mb-1 text-primary">Denominación *</label>
                <select
                  value={form.sub_category}
                  onChange={e => setForm({ ...form, sub_category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-primary/50 bg-primary/5 focus:outline-none focus:border-primary transition-colors"
                >
                  {RELIGIOUS_SUB_CATEGORIES.map(sc => <option key={sc}>{sc}</option>)}
                </select>
              </div>
            )}

            {!isCompany && (
              <div>
                <label className="block text-sm font-semibold mb-1">Empresa</label>
                <select
                  value={form.company_id}
                  onChange={e => setForm({ ...form, company_id: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">Ninguna</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-1">Fecha *</label>
              <input
                required
                type="date"
                value={form.event_date}
                onChange={e => setForm({ ...form, event_date: e.target.value })}
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
