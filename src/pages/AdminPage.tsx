import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEvents, useAliados, useAdminStats, type Event, type Aliado } from '@/hooks/useEvents';
import { Plus, Pencil, Trash2, CalendarDays, MapPin, Building2, Search, Users, Activity, CheckCircle2, Bookmark, Building, ChevronDown, ChevronUp, Star, Trophy, Instagram } from 'lucide-react';
import { TikTokIcon, WhatsAppIcon } from '@/components/SocialIcons';
import { useEventRating, useTopRatedEvents } from '@/hooks/useRatings';
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
import EventCard from '@/components/EventCard';
import { normalizeSportName } from '@/lib/events';

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
  tiktok_url: '',
  instagram_url: '',
  whatsapp_url: '',
};

const emptyAliadoForm: AliadoFormData = {
  name: '',
  description: '',
  category: '',
  sub_category: '',
  email: '',
  password: '',
  tiktok_url: '',
  instagram_url: '',
  whatsapp_url: '',
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

  const { data: topEvents = [], isLoading: loadingTopEvents } = useTopRatedEvents(isAliado ? userAliadoId : undefined);

  const [activeTab, setActiveTab] = useState<'events' | 'aliados' | 'users' | 'ranking'>('events');
  const [overviewFilter, setOverviewFilter] = useState<'active' | 'past' | 'popular' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAliadoId, setSelectedAliadoId] = useState<string | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedTopEvent, setSelectedTopEvent] = useState<any | null>(null);
  const [topEventKey, setTopEventKey] = useState(0);

  const currentUserAliado = isAliado ? aliados.find(a => a.id === userAliadoId) : null;

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
  const [confirmDelete, setConfirmDelete] = useState<{ id: string, type: 'event' } | null>(null);
  const [confirmToggleStatus, setConfirmToggleStatus] = useState<{ id: string, name: string, isDeactivated: boolean } | null>(null);

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

      const finalCategory = currentAliado?.category || payload.category;

      if (!finalCategory || finalCategory.trim() === '') {
        throw new Error("El aliado seleccionado (o tu cuenta) no tiene una Categoría asignada. Por favor, edita los datos del Aliado para asignarle una categoría antes de crear un evento.");
      }

      const eventData = {
        ...payload,
        category: finalCategory,
        sub_category: finalCategory === 'Religioso'
          ? (currentAliado?.category === 'Religioso' ? currentAliado.sub_category : payload.sub_category)
          : (finalCategory === 'Deportivo' ? normalizeSportName(payload.sub_category) : null),
        image_url: imageUrl || null,
        event_time: payload.event_time || null,
        aliado_id: isAliado ? userAliadoId : (payload.aliado_id || null),
        created_by: user.id,
        tiktok_url: payload.tiktok_url || null,
        instagram_url: payload.instagram_url || null,
        whatsapp_url: payload.whatsapp_url || null,
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
        qc.invalidateQueries({ queryKey: ['events'] });
        toast({ title: "Evento eliminado correctamente" });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error al eliminar", description: err.message });
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleToggleAliadoStatus = async () => {
    if (!confirmToggleStatus) return;
    try {
      const { id, name, isDeactivated } = confirmToggleStatus;
      const newName = isDeactivated ? name.replace('[DESACTIVADO] ', '') : `[DESACTIVADO] ${name}`;

      const { error } = await supabase.from('aliados').update({ name: newName }).eq('id', id);
      if (error) throw error;

      qc.invalidateQueries({ queryKey: ['aliados'] });
      toast({ title: isDeactivated ? "Aliado activado correctamente" : "Aliado desactivado correctamente" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error al cambiar estado", description: err.message });
    } finally {
      setConfirmToggleStatus(null);
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
            <>
              <button
                onClick={() => setActiveTab('aliados')}
                className={`font-semibold px-4 py-2 rounded-full transition-colors ${activeTab === 'aliados' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
              >
                Aliados
              </button>
            </>
          )}

          {(isAdmin || isAliado) && (
            <button
              onClick={() => setActiveTab('ranking')}
              className={`font-semibold px-4 py-2 rounded-full transition-colors ${activeTab === 'ranking' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
            >
              Ranking Top 5
            </button>
          )}
        </div>

        {(isAdmin || isAliado) && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 font-display text-foreground">Vista General</h3>
            <div className={`grid gap-4 ${isAdmin ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-3'}`}>
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

              {isAdmin && (
                <>
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
                </>
              )}

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

            <div className={`grid gap-4 mb-8 ${isAdmin ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
              {CATEGORIES.filter(cat => isAliado ? cat === currentUserAliado?.category : true).map(cat => {
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

              {isAdmin && (
                <div
                  onClick={() => setSelectedCategory(null)}
                  className={`cursor-pointer rounded-2xl p-4 card-shadow text-center transition-all ${selectedCategory === null ? 'bg-primary text-primary-foreground border-transparent' : 'bg-card text-primary border border-border hover:border-primary/50'}`}
                >
                  <p className={`text-2xl font-display font-bold ${selectedCategory === null ? 'text-primary-foreground' : 'text-primary'}`}>{eventsForCategory.length}</p>
                  <p className={`text-sm ${selectedCategory === null ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>Total</p>
                </div>
              )}
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
        ) : activeTab === 'ranking' ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-500" />
                Top 5 Mejores Eventos
              </h2>
            </div>

            {loadingTopEvents ? (
              <div className="flex justify-center p-8">
                <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
            ) : topEvents.length === 0 ? (
              <div className="text-center p-8 bg-card rounded-2xl border border-border card-shadow">
                <p className="text-muted-foreground">Aún no hay eventos con calificaciones.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topEvents.map((event: any, index: number) => (
                  <div key={event.id} onClick={() => { setSelectedTopEvent({ ...event, rankingPosition: index + 1 }); setTopEventKey(prev => prev + 1); }} className="bg-card border border-border rounded-2xl p-4 flex gap-4 card-shadow relative overflow-hidden cursor-pointer hover:border-primary/50 transition-all active:scale-[0.98]">
                    {/* Medal ribbon / rank indicator */}
                    <div className={`absolute top-0 left-0 bottom-0 w-2 ${index === 0 ? 'bg-yellow-400' :
                      index === 1 ? 'bg-slate-300' :
                        index === 2 ? 'bg-amber-600' : 'bg-primary/50'
                      }`} />

                    <div className="pl-2 flex items-center justify-center w-12 flex-shrink-0">
                      <span className="font-display text-4xl font-black text-muted/30">
                        #{index + 1}
                      </span>
                    </div>

                    {event.image_url && <img src={event.image_url} alt={event.title} className="w-20 h-20 rounded-xl object-cover hidden sm:block" />}

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="font-bold text-lg text-foreground truncate">{event.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">{event.category} - {event.location}</p>
                    </div>

                    <div className="flex flex-col items-end justify-center min-w-[120px] bg-yellow-50 rounded-xl px-4 py-2 border border-yellow-100">
                      <div className="flex items-center gap-1">
                        <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                        <span className="font-black text-2xl text-yellow-700">{Number(event.averageRating).toFixed(1)}</span>
                      </div>
                      <span className="text-xs font-bold text-yellow-600/70">{event.totalRatings} reseñas</span>
                    </div>
                  </div>
                ))}
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
            {aliados.map(aliado => {
              const isDeactivated = aliado.name.startsWith('[DESACTIVADO]');
              return (
                <div key={aliado.id} className={`bg-card border ${isDeactivated ? 'border-destructive/30 bg-destructive/5' : 'border-border'} rounded-2xl p-5 flex items-start justify-between card-shadow`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-bold text-lg ${isDeactivated ? 'text-destructive' : ''}`}>{aliado.name}</h4>
                      {isDeactivated && <span className="px-2 py-0.5 bg-destructive text-destructive-foreground text-[10px] rounded-full font-black uppercase tracking-wider">Desactivado</span>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{aliado.description}</p>
                    <div className="bg-muted/50 rounded-xl p-3 text-xs text-muted-foreground border border-border">
                      <p><span className="font-bold text-primary">Correo:</span> {(aliado as any).owner_email}</p>

                      {(aliado.tiktok_url || aliado.instagram_url || aliado.whatsapp_url) && (
                        <div className="mt-2 pt-2 border-t border-border flex gap-3">
                          {aliado.tiktok_url && <a href={aliado.tiktok_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline"><TikTokIcon className="w-3.5 h-3.5" /> TikTok</a>}
                          {aliado.instagram_url && <a href={aliado.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline"><Instagram className="w-3.5 h-3.5" /> Instagram</a>}
                          {aliado.whatsapp_url && <a href={aliado.whatsapp_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline"><WhatsAppIcon className="w-3.5 h-3.5" /> WhatsApp</a>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditId(aliado.id);
                        setAliadoFormData({
                          name: isDeactivated ? aliado.name.replace('[DESACTIVADO] ', '') : aliado.name,
                          description: aliado.description || '',
                          category: aliado.category || '',
                          sub_category: aliado.sub_category || '',
                          email: aliado.owner_email || '',
                          password: '',
                          tiktok_url: aliado.tiktok_url || '',
                          instagram_url: aliado.instagram_url || '',
                          whatsapp_url: aliado.whatsapp_url || '',
                        });
                        setShowAliadoForm(true);
                      }}
                      className="p-2 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmToggleStatus({ id: aliado.id, name: aliado.name, isDeactivated })}
                      className={`p-2 rounded-xl bg-muted transition-all ${isDeactivated ? 'hover:bg-emerald-500 hover:text-emerald-50' : 'hover:bg-destructive hover:text-destructive-foreground'}`}
                      title={isDeactivated ? "Activar Aliado" : "Desactivar Aliado"}
                    >
                      {isDeactivated ? <CheckCircle2 className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Hidden EventCard for Top 5 Modal in Admin Panel */}
      {selectedTopEvent && (
        <EventCard key={`admin-top-event-${topEventKey}`} event={selectedTopEvent} initialOpen={true} hideCard={true} />
      )}

      {showEventForm && (
        <EventForm
          editId={editId}
          initialData={eventFormData}
          aliados={aliados}
          isAliado={isAliado}
          currentUserAliado={currentUserAliado}
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
            <AlertDialogTitle>¿Está seguro de eliminar este evento?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer. Se eliminará permanentemente el registro.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!confirmToggleStatus} onOpenChange={() => setConfirmToggleStatus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿{confirmToggleStatus?.isDeactivated ? 'Activar' : 'Desactivar'} a este aliado?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmToggleStatus?.isDeactivated
                ? 'El aliado volverá a tener acceso a la plataforma.'
                : 'El aliado ya no podrá iniciar sesión en la plataforma y sus accesos serán suspendidos.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleAliadoStatus}
              className={confirmToggleStatus?.isDeactivated ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
            >
              {confirmToggleStatus?.isDeactivated ? 'Sí, Activar' : 'Sí, Desactivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
