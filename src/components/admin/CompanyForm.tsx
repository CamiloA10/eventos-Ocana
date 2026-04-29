import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { type CompanyFormData } from '@/lib/companies';

interface CompanyFormProps {
  editId: string | null;
  initialData: CompanyFormData;
  onSubmit: (data: CompanyFormData) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
  error?: string;
}

export function CompanyForm({
  editId,
  initialData,
  onSubmit,
  onCancel,
  submitting,
  error
}: CompanyFormProps) {
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
            {editId ? 'Editar Empresa' : 'Nueva Empresa'}
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
                  placeholder="empresa@ejemplo.com"
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
              * Estos datos permiten el acceso de la empresa al panel.
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
              {submitting ? 'Guardando...' : editId ? 'Actualizar' : 'Crear Empresa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
