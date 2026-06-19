import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEvents, useAliados, useAdminStats, type Event, type Aliado } from '@/hooks/useEvents';
import { Plus, Pencil, Trash2, CalendarDays, MapPin, Building2, Search, Users, Activity, CheckCircle2, Bookmark, Building, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { useEventRating } from '@/hooks/useRatings';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// Modules & Components
import { uploadMedia } from '@/lib/storage';
import { createAliadoWithAuth, updateAliadoProfile, deleteAliadoComplete, type AliadoFormData } from '@/lib/aliados';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { EventForm } from '@/components/admin/EventForm';
import { AliadoForm } from '@/components/admin/AliadoForm';
import { useEventAttendance } from '@/hooks/useAttendance';

function EventAdminStats({ eventId }: { eventId: string }) {
  const { data } = useEventAttendance(eventId);
  return (
    <span className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full text-xs" title="Asistentes Confirmados">
      <Users className="w-3.5 h-3.5" />
      {data?.count || 0} Confirmados
    </span>
  );
}

function AdminEventSummaryCard({ event, aliados, todayStr, onEdit, onDelete }: any) {
  const [expanded, setExpanded] = useState(false);
  const { data: ratingData } = useEventRating(event.id);

  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-4 card-shadow hover:border-primary/30 transition-all cursor-pointer" onClick={() => setExpanded(!expanded)}>
      <div className="flex items-center gap-4">
        {event.image_url && <img src={event.image_url} alt={event.title} className="w-16 h-16 rounded-xl object-cover hidden sm:block" />}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">{event.title}</h4>
          <div className="flex gap-4 mt-1 text-sm text-muted-foreground flex-wrap items-center">
            <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />{format(parseISO(event.event_date), 'd MMM yyyy', { locale: es })}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.location}</span>
            <span className="px-2 py-0.5 bg-muted rounded-full text-xs">{event.category}</span>
            {event.event_date < todayStr && (
              <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse">Finalizado</span>
            )}
            {aliados.find((c: any) => c.id === event.aliado_id) && (
              <span className="flex items-center gap-1 text-primary">
                <Building2 className="w-3.5 h-3.5" />
                {aliados.find((c: any) => c.id === event.aliado_id)?.name}
              </span>
            )}
            <EventAdminStats eventId={event.id} />
          </div>
        </div>
        <div className="flex gap-2 items-center" onClick={(e) => { e.stopPropagation(); }}>
          <button onClick={onEdit} className="p-2 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all"><Pencil className="w-4 h-4" /></button>
          <button onClick={onDelete} className="p-2 rounded-xl bg-muted hover:bg-destructive hover:text-destructive-foreground transition-all"><Trash2 className="w-4 h-4" /></button>
          <div className="p-2 ml-1 pointer-events-none">
            {expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-2 pt-4 border-t border-border flex flex-col gap-4 text-sm" onClick={(e) => e.stopPropagation()}>
          {event.description && <p className="text-muted-foreground">{event.description}</p>}

          <div className="flex items-center gap-2 bg-yellow-50 text-yellow-800 p-3 rounded-xl border border-yellow-100 w-fit">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-bold">Calificación:</span>
            <span>
              {ratingData && ratingData.totalRatings > 0
                ? `${ratingData.averageRating.toFixed(1)} de ${ratingData.totalRatings} reseñas`
                : 'Sin calificaciones aún'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

const CATEGORIES = ['Cultural', 'Deportivo', 'Turístico', 'Religioso'] as const;

const emptyEventForm = {
  title: '',
  category: '',
  sub_category: '',
  event_date: '',
  event_time: '',
  location: '',
  description: '',
  image_url: '',
  aliado_id: '',
};

const emptyAliadoForm: AliadoFormData = {
  name: '',
  description: '',
  category: '',
  sub_category: '',
  email: '',
  password: '',
};

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, isAdmin, isAliado, userAliadoId, loading, signOut } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  const rawEvents = useEvents();
  const events = isAdmin
    ? (rawEvents.data || [])
    : (rawEvents.data || []).filter(e => e.aliado_id === userAliadoId);

  const { data: aliados = [], isLoading: loadingAliados } = useAliados();
  const { data: adminStats } = useAdminStats();

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_roles').select('*');
      if (error) throw error;
      return data;
    },
    enabled: isAdmin
  });

  const [activeTab, setActiveTab] = useState<'events' | 'aliados' | 'users'>('events');
  const [overviewFilter, setOverviewFilter] = useState<'active' | 'past' | 'popular' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAliadoId, setSelectedAliadoId] = useState<string | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Base events for overview cards (ignoring overviewFilter)
  const eventsForOverview = events
    .filter(e => selectedCategory ? e.category === selectedCategory : true)
    .filter(e => selectedAliadoId !== 'all' ? e.aliado_id === selectedAliadoId : true)
    .filter(e => searchTerm ? (e.title.toLowerCase().includes(searchTerm.toLowerCase()) || (e.description?.toLowerCase().includes(searchTerm.toLowerCase()))) : true);

  const activeEventsCount = eventsForOverview.filter(e => e.event_date >= todayStr).length;
  const pastEventsCount = eventsForOverview.filter(e => e.event_date < todayStr).length;
  const popularEventsCount = eventsForOverview.filter(e => (e.attendance_count?.[0]?.count || 0) > 0).length;

  // Base events for category cards (ignoring selectedCategory)
  const eventsForCategory = events
    .filter(e => {
      if (!overviewFilter) return true;
      if (overviewFilter === 'active') return e.event_date >= todayStr;
      if (overviewFilter === 'past') return e.event_date < todayStr;
      if (overviewFilter === 'popular') return (e.attendance_count?.[0]?.count || 0) > 0;
      return true;
    })
    .filter(e => selectedAliadoId !== 'all' ? e.aliado_id === selectedAliadoId : true)
    .filter(e => searchTerm ? (e.title.toLowerCase().includes(searchTerm.toLowerCase()) || (e.description?.toLowerCase().includes(searchTerm.toLowerCase()))) : true);

  const renderedEvents = eventsForOverview.filter(e => {
    if (!overviewFilter) return true;
    if (overviewFilter === 'active') return e.event_date >= todayStr;
    if (overviewFilter === 'past') return e.event_date < todayStr;
    if (overviewFilter === 'popular') return (e.attendance_count?.[0]?.count || 0) > 0;
    return true;
  });
  const [showEventForm, setShowEventForm] = useState(false);
  const [showAliadoForm, setShowAliadoForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [eventFormData, setEventFormData] = useState(emptyEventForm);
  const [aliadoFormData, setAliadoFormData] = useState(emptyAliadoForm);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string, type: 'event' | 'aliado' } | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (!isAdmin && !isAliado) {
        navigate('/eventos');
      }
    }
  }, [user, isAdmin, isAliado, loading, navigate]);

  useEffect(() => {
    if (isAliado && activeTab === 'aliados') {
      setActiveTab('events');
    }
  }, [isAliado, activeTab]);

  if (loading || !user || (!isAdmin && !isAliado)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }


  const resetForms = () => {
    setEventFormData(emptyEventForm);
    setAliadoFormData(emptyAliadoForm);
    setEditId(null);
    setShowEventForm(false);
    setShowAliadoForm(false);
    setError('');
  };

  const handleEventSubmit = async (payload: any, imageFile: File | null) => {
    setError('');
    setSubmitting(true);
    try {
      let imageUrl = payload.image_url;
      if (imageFile) {
        imageUrl = await uploadMedia(imageFile);
      }

      // If it's a partner creating an event, we inherit THEIR category
      const currentAliado = isAliado ? aliados.find(a => a.id === userAliadoId) : aliados.find(a => a.id === payload.aliado_id);

      const eventData = {
        ...payload,
        category: currentAliado?.category || payload.category,
        sub_category: currentAliado?.category === 'Religioso' ? currentAliado.sub_category : (payload.category === 'Religioso' ? payload.sub_category : null),
        image_url: imageUrl || null,
        event_time: payload.event_time || null,
        aliado_id: isAliado ? userAliadoId : (payload.aliado_id || null),
        created_by: user.id,
      };

      if (editId) {
        const { error } = await supabase.from('events').update(eventData).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('events').insert(eventData);
        if (error) throw error;
      }

      qc.invalidateQueries({ queryKey: ['events'] });
      toast({ title: editId ? "Evento actualizado" : "Evento creado" });
      resetForms();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAliadoSubmit = async (data: AliadoFormData) => {
    setError('');
    setSubmitting(true);
    try {
      if (editId) {
        await updateAliadoProfile(editId, data);
      } else {
        await createAliadoWithAuth(data);
      }
      qc.invalidateQueries({ queryKey: ['aliados'] });
      toast({ title: editId ? "Aliado actualizado" : "Aliado creado" });
      resetForms();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.type === 'event') {
        const { error } = await supabase.from('events').delete().eq('id', confirmDelete.id);
        if (error) throw error;
      } else {
        await deleteAliadoComplete(confirmDelete.id);
      }
      qc.invalidateQueries({ queryKey: [confirmDelete.type === 'event' ? 'events' : 'aliados'] });
      toast({ title: "Eliminado correctamente" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error al eliminar", description: err.message });
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-background font-bold antialiased">
      <AdminHeader userEmail={user.email} signOut={signOut} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8 border-b border-border pb-4">
          <button
            onClick={() => setActiveTab('events')}
            className={`font-semibold px-4 py-2 rounded-full transition-colors ${activeTab === 'events' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          >
            Eventos
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('aliados')}
              className={`font-semibold px-4 py-2 rounded-full transition-colors ${activeTab === 'aliados' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
            >
              Aliados
            </button>
          )}
        </div>

        {isAdmin && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 font-display text-foreground">Vista General</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div
                onClick={() => { setActiveTab('events'); setOverviewFilter(overviewFilter === 'active' ? null : 'active'); }}
                className={`cursor-pointer border rounded-2xl p-4 card-shadow flex flex-col items-center justify-center text-center transition-all ${activeTab === 'events' && overviewFilter === 'active' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'bg-card border-border hover:border-primary/50'}`}
              >
                <Activity className="w-5 h-5 text-blue-500 mb-2" />
                <p className="text-2xl font-display font-black text-primary">{activeEventsCount}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Eventos Activos</p>
              </div>
              <div
                onClick={() => { setActiveTab('events'); setOverviewFilter(overviewFilter === 'past' ? null : 'past'); }}
                className={`cursor-pointer border rounded-2xl p-4 card-shadow flex flex-col items-center justify-center text-center transition-all ${activeTab === 'events' && overviewFilter === 'past' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'bg-card border-border hover:border-primary/50'}`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-2" />
                <p className="text-2xl font-display font-black text-primary">{pastEventsCount}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Finalizados</p>
              </div>
              <div
                onClick={() => { setActiveTab('users'); setOverviewFilter(null); }}
                className={`cursor-pointer border transition-all rounded-2xl p-4 card-shadow flex flex-col items-center justify-center text-center ${activeTab === 'users' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'bg-card border-border hover:border-primary/50'}`}
              >
                <Users className="w-5 h-5 text-indigo-500 mb-2" />
                <p className="text-2xl font-display font-black text-primary">{users.length}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Usuarios</p>
              </div>
              <div
                onClick={() => { setActiveTab('aliados'); setOverviewFilter(null); }}
                className={`cursor-pointer border transition-all rounded-2xl p-4 card-shadow flex flex-col items-center justify-center text-center ${activeTab === 'aliados' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'bg-card border-border hover:border-primary/50'}`}
              >
                <Building className="w-5 h-5 text-orange-500 mb-2" />
                <p className="text-2xl font-display font-black text-primary">{aliados.length}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Aliados</p>
              </div>
              <div
                onClick={() => { setActiveTab('events'); setOverviewFilter(overviewFilter === 'popular' ? null : 'popular'); }}
                className={`cursor-pointer border rounded-2xl p-4 card-shadow flex flex-col items-center justify-center text-center transition-all ${activeTab === 'events' && overviewFilter === 'popular' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'bg-card border-border hover:border-primary/50'}`}
              >
                <Bookmark className="w-5 h-5 text-rose-500 mb-2" />
                <p className="text-2xl font-display font-black text-primary">{popularEventsCount}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Favoritos</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' ? (
          <>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
              <div className="flex-1 w-full relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar evento por título o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                />
              </div>
              {isAdmin && (
                <div className="w-full sm:w-auto">
                  <select
                    value={selectedAliadoId}
                    onChange={(e) => setSelectedAliadoId(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                  >
                    <option value="all">Todos los aliados</option>
                    {aliados.map(aliado => (
                      <option key={aliado.id} value={aliado.id}>{aliado.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {CATEGORIES.map(cat => {
                const count = eventsForCategory.filter(e => e.category === cat).length;
                return (
                  <div
                    key={cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                    className={`cursor-pointer bg-card border rounded-2xl p-4 card-shadow text-center transition-all ${selectedCategory === cat ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border hover:border-primary/50'}`}
                  >
                    <p className="text-2xl font-display font-bold text-primary">{count}</p>
                    <p className="text-sm text-muted-foreground">{cat}</p>
                  </div>
                );
              })}
              <div
                onClick={() => setSelectedCategory(null)}
                className={`cursor-pointer rounded-2xl p-4 card-shadow text-center transition-all ${selectedCategory === null ? 'bg-primary text-primary-foreground border-transparent' : 'bg-card text-primary border border-border hover:border-primary/50'}`}
              >
                <p className={`text-2xl font-display font-bold ${selectedCategory === null ? 'text-primary-foreground' : 'text-primary'}`}>{eventsForCategory.length}</p>
                <p className={`text-sm ${selectedCategory === null ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>Total</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-3xl font-black tracking-tight text-foreground">Eventos</h2>
              <button
                onClick={() => { resetForms(); setShowEventForm(true); }}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-md"
              >
                <Plus className="w-5 h-5" />
                Nuevo Evento
              </button>
            </div>

            <div className="space-y-3">
              {renderedEvents.map(event => (
                <AdminEventSummaryCard
                  key={event.id}
                  event={event}
                  aliados={aliados}
                  todayStr={todayStr}
                  onEdit={() => { setEditId(event.id); setEventFormData(event as any); setShowEventForm(true); }}
                  onDelete={() => setConfirmDelete({ id: event.id, type: 'event' })}
                />
              ))}
            </div>
          </>
        ) : activeTab === 'users' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-full flex items-center justify-between mb-2">
              <h2 className="font-display text-2xl font-bold text-foreground">Usuarios Registrados</h2>
            </div>
            {users.map(u => (
              <div key={u.user_id} className="bg-card border border-border rounded-2xl p-5 flex items-start justify-between card-shadow">
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-1">ID de Usuario: {u.user_id.split('-')[0]}</h4>
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">{u.role}</span>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="col-span-full py-8 text-center text-muted-foreground bg-muted/20 rounded-2xl border border-border/50">
                No se encontraron usuarios.
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-full flex items-center justify-between mb-2">
              <h2 className="font-display text-2xl font-bold text-foreground">Aliados</h2>
              <button
                onClick={() => { resetForms(); setShowAliadoForm(true); }}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-md"
              >
                <Plus className="w-5 h-5" />
                Nuevo Aliado
              </button>
            </div>
            {aliados.map(aliado => (
              <div key={aliado.id} className="bg-card border border-border rounded-2xl p-5 flex items-start justify-between card-shadow">
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-1">{aliado.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{aliado.description}</p>
                  <div className="bg-muted/50 rounded-xl p-3 text-xs text-muted-foreground border border-border">
                    <p><span className="font-bold text-primary">Correo:</span> {(aliado as any).owner_email}</p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => {
                      setEditId(aliado.id);
                      setAliadoFormData({
                        name: aliado.name,
                        description: aliado.description || '',
                        category: aliado.category || '',
                        sub_category: aliado.sub_category || '',
                        email: aliado.owner_email || '',
                        password: ''
                      });
                      setShowAliadoForm(true);
                    }}
                    className="p-2 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setConfirmDelete({ id: aliado.id, type: 'aliado' })} className="p-2 rounded-xl bg-muted hover:bg-destructive hover:text-destructive-foreground transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showEventForm && (
        <EventForm
          editId={editId}
          initialData={eventFormData}
          aliados={aliados}
          isAliado={isAliado}
          onSubmit={handleEventSubmit}
          onCancel={resetForms}
          submitting={submitting}
          error={error}
        />
      )}

      {showAliadoForm && (
        <AliadoForm
          editId={editId}
          initialData={aliadoFormData}
          onSubmit={handleAliadoSubmit}
          onCancel={resetForms}
          submitting={submitting}
          error={error}
        />
      )}

      <AlertDialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer. Se eliminará permanentemente el registro.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
