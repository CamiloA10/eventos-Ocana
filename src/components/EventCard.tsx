import { useState } from 'react';
import { CalendarDays, MapPin, Tag, Star, ArrowRight, ShieldCheck, Clock, Check, Share2, Heart, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSaveEvent, useSavedEvents, type Event } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const CATEGORY_COLORS: Record<string, string> = {
  Cultural: 'bg-blue-50 text-blue-700 border-blue-100',
  Deportivo: 'bg-red-50 text-red-700 border-red-100',
  'Turístico': 'bg-green-50 text-green-700 border-green-100',
  'Religioso': 'bg-purple-50 text-purple-700 border-purple-100',
};

const PLACEHOLDER = 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80';

interface Props {
  event: Event;
}

export default function EventCard({ event }: Props) {
  const { user } = useAuth();
  const { data: savedEvents = [] } = useSavedEvents(user?.id);
  const saveEventMutation = useSaveEvent();
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);

  const isSaved = savedEvents.includes(event.id);
  const attendanceCount = event.attendance_count?.[0]?.count ?? 0;

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes estar conectado para confirmar tu asistencia.",
        variant: "destructive"
      });
      return;
    }
    
    saveEventMutation.mutate({ userId: user.id, eventId: event.id, isSaved }, {
      onSuccess: () => {
        toast({
          title: isSaved ? "Ya no asisto" : "¡Confirmado!",
          description: isSaved ? "Has quitado tu asistencia." : "Te hemos anotado para este evento.",
        });
      }
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/eventos?id=${event.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Enlace copiado",
      description: "Comparte este evento con tus amigos.",
    });
  };

  const formattedDate = (() => {
    try {
      return format(parseISO(event.event_date), "EEE d 'de' MMMM", { locale: es });
    } catch {
      return event.event_date;
    }
  })();

  return (
    <>
      <div 
        onClick={() => setShowDetails(true)}
        className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:border-blue-100 transition-all duration-500 flex flex-col h-full transform hover:-translate-y-2 cursor-pointer"
      >
        <div className="relative h-64 overflow-hidden">
          <img
            src={event.image_url || PLACEHOLDER}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
          
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {event.featured && (
              <div className="bg-blue-600/90 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                <Star className="w-3 h-3 fill-current" />
                Destacado
              </div>
            )}
            <div className="bg-white/90 backdrop-blur-md text-slate-900 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5 border border-white/20">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              Verificado
            </div>
          </div>

          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl backdrop-blur-md bg-white/80 text-slate-400 hover:text-blue-600 hover:bg-white shadow-lg transition-all duration-300"
              title="Compartir"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={toggleSave}
              className={`p-2.5 rounded-xl backdrop-blur-md shadow-lg transition-all duration-300 ${
                isSaved 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/80 text-slate-400 hover:text-blue-600 hover:bg-white'
              }`}
            >
              {isSaved ? <Check className="w-4 h-4 stroke-[3px]" /> : <Heart className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center">
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md shadow-sm ${CATEGORY_COLORS[event.category] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
              {event.category}
            </div>
          </div>
        </div>

        <div className="p-8 flex flex-col flex-grow">
          <div className="flex items-center gap-3 mb-4 text-slate-400">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
              <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-bold">{formattedDate}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-200" />
            <span className="text-[10px] font-black uppercase tracking-widest">{event.event_time?.slice(0, 5) || 'TODO EL DÍA'}</span>
          </div>

          <h3 className="text-xl font-black mb-4 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">{event.title}</h3>
          
          <div className="flex items-center gap-2 mb-6 text-slate-500">
            <MapPin className="w-4 h-4 text-slate-300 shrink-0" />
            <span className="text-sm font-medium line-clamp-1">{event.location}</span>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                     <img src={`https://i.pravatar.cc/100?u=${event.id}${i}`} className="w-full h-full object-cover grayscale-[0.3]" />
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {attendanceCount > 0 ? `+${attendanceCount} confirmados` : 'Sé el primero'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm tracking-tight group/btn pl-4 py-2 rounded-xl transition-all">
              <span className="group-hover/btn:mr-2 transition-all">Detalles</span>
              <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-300 relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowDetails(false); }}
              className="absolute top-6 right-6 z-10 p-4 bg-black/10 hover:bg-black/20 backdrop-blur-md rounded-full transition-all transform active:scale-95"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <div className="md:w-1/2 relative bg-slate-100 min-h-[300px] md:min-h-full">
              <img 
                src={event.image_url || PLACEHOLDER} 
                className="w-full h-full object-cover"
                alt={event.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 right-10">
                <div className={`w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border mb-4 backdrop-blur-md shadow-xl ${CATEGORY_COLORS[event.category]}`}>
                  {event.category}
                </div>
                <h2 className="text-4xl font-black text-white tracking-tighter leading-[0.9]">{event.title}</h2>
              </div>
            </div>

            <div className="md:w-1/2 p-12 overflow-y-auto custom-scrollbar bg-white flex flex-col">
              <div className="space-y-10 flex-grow">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4 flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                      <CalendarDays className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Fecha y Hora</p>
                      <p className="text-sm font-bold text-slate-900">{formattedDate} · {event.event_time?.slice(0,5) || 'Todo el día'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Lugar</p>
                    <p className="text-sm font-bold text-slate-900 leading-tight">{event.location}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase font-black text-slate-400 tracking-[0.2em] mb-4 flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Descripción del evento
                  </h4>
                  <p className="text-lg text-slate-600 leading-relaxed font-medium">
                    {event.description || "No hay una descripción detallada disponible para este evento por el momento."}
                  </p>
                </div>
              </div>

              <div className="mt-10 pt-10 border-t border-slate-100 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="flex -space-x-3">
                      {[1, 2, 3].map(i => (
                        <img key={i} src={`https://i.pravatar.cc/100?u=modal${event.id}${i}`} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100" />
                      ))}
                     </div>
                     <p className="text-sm font-bold text-slate-500">
                       <span className="text-slate-900 mr-1">{attendanceCount + 15} personas</span> asisten
                     </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={toggleSave}
                    className={`flex-grow py-5 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${
                      isSaved ? 'bg-slate-100 text-slate-900 hover:bg-slate-200' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <Check className="w-6 h-6 stroke-[3px]" />
                        ¡Asistiré!
                      </>
                    ) : (
                      <>
                        <Heart className="w-6 h-6" />
                        Confirmar Asistencia
                      </>
                    )}
                  </button>
                  <button 
                    onClick={handleShare}
                    className="p-5 bg-slate-50 rounded-2xl hover:bg-slate-100 text-slate-400 transition-all hover:text-blue-600 border border-slate-100"
                  >
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
