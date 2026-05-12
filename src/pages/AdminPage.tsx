import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEvents, useAliados, type Event, type Aliado } from '@/hooks/useEvents';
import { Plus, Pencil, Trash2, CalendarDays, MapPin, Building2 } from 'lucide-react';
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

const CATEGORIES = ['Cultural', 'Deportivo', 'Turístico', 'Religioso'] as const;

const emptyEventForm = {
  title: '',
  category: 'Cultural' as const,
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

  const [activeTab, setActiveTab] = useState<'events' | 'aliados'>('events');
  const [showEventForm, setShowEventForm] = useState(false);
  const [showAliadoForm, setShowAliadoForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [eventFormData, setEventFormData] = useState(emptyEventForm);
  const [aliadoFormData, setAliadoFormData] = useState(emptyAliadoForm);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string, type: 'event' | 'aliado' } | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user || (!isAdmin && !isAliado)) {
    navigate('/login');
    return null;
  }

  if (isAliado && activeTab === 'aliados') {
    setActiveTab('events');
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

        {activeTab === 'events' ? (
          <>
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
              {events.map(event => (
                <div key={event.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 card-shadow hover:border-primary/30 transition-all">
                  {event.image_url && <img src={event.image_url} alt={event.title} className="w-16 h-16 rounded-xl object-cover hidden sm:block" />}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">{event.title}</h4>
                    <div className="flex gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />{format(parseISO(event.event_date), 'd MMM yyyy', { locale: es })}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.location}</span>
                      <span className="px-2 py-0.5 bg-muted rounded-full text-xs">{event.category}</span>
                      {aliados.find(c => c.id === event.aliado_id) && (
                        <span className="flex items-center gap-1 text-primary">
                          <Building2 className="w-3.5 h-3.5" />
                          {aliados.find(c => c.id === event.aliado_id)?.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditId(event.id); setEventFormData(event as any); setShowEventForm(true); }} className="p-2 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setConfirmDelete({ id: event.id, type: 'event' })} className="p-2 rounded-xl bg-muted hover:bg-destructive hover:text-destructive-foreground transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
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
