import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEvents, useCompanies, useCreateCompany, useDeleteCompany, type Event, type Company } from '@/hooks/useEvents';
import { Plus, Pencil, Trash2, LogOut, CalendarDays, MapPin, X, Check, Image as ImageIcon, Building2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const CATEGORIES = ['Cultural', 'Deportivo', 'Turístico'] as const;
type Category = typeof CATEGORIES[number];

const emptyEventForm = {
  title: '',
  category: 'Cultural' as Category,
  event_date: '',
  event_time: '',
  location: '',
  description: '',
  image_url: '',
  featured: false,
  company_id: '',
};

const emptyCompanyForm = {
  name: '',
  description: '',
};

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading, signOut } = useAuth();
  const qc = useQueryClient();
  const { data: events = [], isLoading: loadingEvents } = useEvents();
  const { data: companies = [], isLoading: loadingCompanies } = useCompanies();
  const createCompany = useCreateCompany();
  const deleteCompany = useDeleteCompany();

  const [activeTab, setActiveTab] = useState<'events' | 'companies'>('events');
  
  const [showEventForm, setShowEventForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [eventForm, setEventForm] = useState(emptyEventForm);
  const [companyForm, setCompanyForm] = useState(emptyCompanyForm);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    navigate('/login');
    return null;
  }

  const resetForms = () => {
    setEventForm(emptyEventForm);
    setCompanyForm(emptyCompanyForm);
    setEditId(null);
    setShowEventForm(false);
    setShowCompanyForm(false);
    setImageFile(null);
    setError('');
  };

  // --- Events Logic ---
  const startEditEvent = (event: Event) => {
    setEventForm({
      title: event.title,
      category: event.category as Category,
      event_date: event.event_date,
      event_time: event.event_time ?? '',
      location: event.location,
      description: event.description,
      image_url: event.image_url ?? '',
      featured: event.featured ?? false,
      company_id: event.company_id ?? '',
    });
    setEditId(event.id);
    setShowEventForm(true);
  };

  const uploadImage = async () => {
    if (!imageFile) return eventForm.image_url;
    const ext = imageFile.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('event-images').upload(path, imageFile);
    if (error) throw error;
    const { data } = supabase.storage.from('event-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const imageUrl = await uploadImage();
      const payload = {
        ...eventForm,
        image_url: imageUrl || null,
        event_time: eventForm.event_time || null,
        company_id: eventForm.company_id || null,
        created_by: user.id,
      };

      if (editId) {
        const { error } = await supabase.from('events').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('events').insert(payload);
        if (error) throw error;
      }

      qc.invalidateQueries({ queryKey: ['events'] });
      resetForms();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar el evento');
    }
    setSubmitting(false);
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('¿Eliminar este evento?')) return;
    await supabase.from('events').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['events'] });
  };

  // --- Companies Logic ---
  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createCompany.mutateAsync(companyForm);
      resetForms();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar la empresa');
    }
    setSubmitting(false);
  };

  const handleDeleteCompany = async (id: string) => {
    if (!confirm('¿Eliminar esta empresa? Esto dejará sin empresa a sus eventos asociados.')) return;
    try {
      await deleteCompany.mutateAsync(id);
    } catch (err) {
      alert('Error eliminando la empresa');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar-style header */}
      <header className="bg-sidebar text-sidebar-foreground px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div>
          <h1 className="font-display text-xl font-bold text-primary">¿Qué hay pa' hacer?</h1>
          <p className="text-xs text-sidebar-foreground/60">Panel de Administración</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm hidden sm:block text-sidebar-foreground/70">{user.email}</span>
          <button
            onClick={() => { signOut(); navigate('/'); }}
            className="flex items-center gap-2 bg-sidebar-accent hover:bg-primary hover:text-primary-foreground text-sidebar-foreground px-4 py-2 rounded-full text-sm font-medium transition-all"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border pb-4">
          <button 
            onClick={() => setActiveTab('events')}
            className={`font-semibold px-4 py-2 rounded-full transition-colors ${activeTab === 'events' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          >
            Eventos
          </button>
          <button 
            onClick={() => setActiveTab('companies')}
            className={`font-semibold px-4 py-2 rounded-full transition-colors ${activeTab === 'companies' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          >
            Empresas
          </button>
        </div>

        {activeTab === 'events' ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {CATEGORIES.map(cat => {
                const count = events.filter(e => e.category === cat).length;
                return (
                  <div key={cat} className="bg-card border border-border rounded-2xl p-4 card-shadow text-center">
                    <p className="text-2xl font-display font-bold text-primary">{count}</p>
                    <p className="text-sm text-muted-foreground">{cat}</p>
                  </div>
                );
              })}
              <div className="bg-primary text-primary-foreground rounded-2xl p-4 card-shadow text-center">
                <p className="text-2xl font-display font-bold">{events.length}</p>
                <p className="text-sm text-primary-foreground/80">Total</p>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground">Eventos</h2>
              <button
                onClick={() => { resetForms(); setShowEventForm(true); }}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-md"
              >
                <Plus className="w-5 h-5" />
                Nuevo Evento
              </button>
            </div>

            {/* Events list */}
            {loadingEvents ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-5xl mb-4">📋</p>
                <p className="text-lg font-medium">No hay eventos creados</p>
                <p className="text-sm mt-1">Crea el primer evento con el botón de arriba</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map(event => {
                  const company = companies.find(c => c.id === event.company_id);
                  return (
                  <div
                    key={event.id}
                    className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 card-shadow hover:border-primary/30 transition-all"
                  >
                    {event.image_url && (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-16 h-16 rounded-xl object-cover hidden sm:block"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-foreground truncate">{event.title}</h4>
                        {event.featured && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">⭐ Destacado</span>}
                      </div>
                      <div className="flex gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {format(parseISO(event.event_date), 'd MMM yyyy', { locale: es })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {event.location}
                        </span>
                        <span className="px-2 py-0.5 bg-muted rounded-full text-xs">{event.category}</span>
                        {company && (
                          <span className="flex items-center gap-1 text-primary">
                            <Building2 className="w-3.5 h-3.5" />
                            {company.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => startEditEvent(event)}
                        className="p-2 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-2 rounded-xl bg-muted hover:bg-destructive hover:text-destructive-foreground transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Companies Tab */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground">Empresas</h2>
              <button
                onClick={() => { resetForms(); setShowCompanyForm(true); }}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-md"
              >
                <Plus className="w-5 h-5" />
                Nueva Empresa
              </button>
            </div>
            
            {loadingCompanies ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-5xl mb-4">🏢</p>
                <p className="text-lg font-medium">No hay empresas creadas</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companies.map(company => (
                  <div key={company.id} className="bg-card border border-border rounded-2xl p-5 flex items-start justify-between card-shadow">
                    <div>
                      <h4 className="font-bold text-lg mb-1">{company.name}</h4>
                      {company.description && <p className="text-sm text-muted-foreground">{company.description}</p>}
                    </div>
                    <button
                      onClick={() => handleDeleteCompany(company.id)}
                      className="p-2 rounded-xl bg-muted hover:bg-destructive hover:text-destructive-foreground transition-all ml-4 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Modal: Event Form */}
        {showEventForm && (
          <div className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
            <div className="bg-card border border-border rounded-3xl w-full max-w-2xl my-8 card-shadow">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="font-display text-xl font-bold text-foreground">
                  {editId ? 'Editar Evento' : 'Nuevo Evento'}
                </h3>
                <button onClick={resetForms} className="p-2 rounded-full hover:bg-muted transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEventSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-1">Título *</label>
                    <input
                      required
                      value={eventForm.title}
                      onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
                      placeholder="Nombre del evento"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Categoría *</label>
                    <select
                      value={eventForm.category}
                      onChange={e => setEventForm({ ...eventForm, category: e.target.value as Category })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
                    >
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-1">Empresa</label>
                    <select
                      value={eventForm.company_id}
                      onChange={e => setEventForm({ ...eventForm, company_id: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="">Ninguna</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Fecha *</label>
                    <input
                      required
                      type="date"
                      value={eventForm.event_date}
                      onChange={e => setEventForm({ ...eventForm, event_date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Hora</label>
                    <input
                      type="time"
                      value={eventForm.event_time}
                      onChange={e => setEventForm({ ...eventForm, event_time: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Lugar *</label>
                    <input
                      required
                      value={eventForm.location}
                      onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
                      placeholder="Lugar del evento"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-1">Descripción *</label>
                    <textarea
                      required
                      rows={3}
                      value={eventForm.description}
                      onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
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
                      value={eventForm.image_url}
                      onChange={e => setEventForm({ ...eventForm, image_url: e.target.value })}
                      className="w-full mt-2 px-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors text-sm"
                      placeholder="O pega una URL de imagen..."
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={eventForm.featured}
                      onChange={e => setEventForm({ ...eventForm, featured: e.target.checked })}
                      className="w-4 h-4 accent-primary"
                    />
                    <label htmlFor="featured" className="text-sm font-semibold">⭐ Evento destacado</label>
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
                    onClick={resetForms}
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
        )}

        {/* Modal: Company Form */}
        {showCompanyForm && (
          <div className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
            <div className="bg-card border border-border rounded-3xl w-full max-w-md my-8 card-shadow">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="font-display text-xl font-bold text-foreground">
                  Nueva Empresa
                </h3>
                <button onClick={resetForms} className="p-2 rounded-full hover:bg-muted transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCompanySubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Nombre *</label>
                  <input
                    required
                    value={companyForm.name}
                    onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Descripción</label>
                  <textarea
                    rows={3}
                    value={companyForm.description}
                    onChange={e => setCompanyForm({ ...companyForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                {error && (
                  <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForms}
                    className="flex-1 py-3 rounded-xl border-2 border-border font-semibold hover:bg-muted transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-60"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
