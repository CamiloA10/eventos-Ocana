import { CalendarDays, MapPin, Tag, Star, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSaveEvent, useSavedEvents, type Event } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';

const CATEGORY_COLORS: Record<string, string> = {
  Cultural: 'bg-blue-50 text-blue-700 border-blue-100',
  Deportivo: 'bg-red-50 text-red-700 border-red-100',
  'Turístico': 'bg-green-50 text-green-700 border-green-100',
};

const PLACEHOLDER = 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80';

interface Props {
  event: Event;
}

export default function EventCard({ event }: Props) {
  const { user } = useAuth();
  const { data: savedEvents = [] } = useSavedEvents(user?.id);
  const saveEventMutation = useSaveEvent();

  const isSaved = savedEvents.includes(event.id);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    saveEventMutation.mutate({ userId: user.id, eventId: event.id, isSaved });
  };

  const formattedDate = (() => {
    try {
      return format(parseISO(event.event_date), "EEE d 'de' MMMM", { locale: es });
    } catch {
      return event.event_date;
    }
  })();

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:border-blue-100 transition-all duration-500 flex flex-col h-full transform hover:-translate-y-2">
      <div className="relative h-56 overflow-hidden">
        <img
          src={event.image_url || PLACEHOLDER}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
        />
        
        {/* Badges Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {event.featured && (
            <div className="bg-blue-600/90 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5">
              <Star className="w-3 h-3 fill-current" />
              Top Event
            </div>
          )}
          <div className="bg-white/90 backdrop-blur-md text-slate-900 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5 border border-white/20">
            <ShieldCheck className="w-3 h-3 text-blue-600" />
            Verificado
          </div>
        </div>

        <button
          onClick={toggleSave}
          className={`absolute top-4 right-4 p-2.5 rounded-xl backdrop-blur-md shadow-lg transition-all duration-300 ${
            isSaved 
              ? 'bg-blue-600 text-white scale-110' 
              : 'bg-white/80 text-slate-400 hover:text-blue-600 hover:bg-white'
          }`}
        >
          <Star className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
           <span className="text-white text-xs font-bold flex items-center gap-2">
             <Clock className="w-4 h-4" /> Ver agenda detallada
           </span>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-1">
        <div className="mb-6 flex justify-between items-center">
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${CATEGORY_COLORS[event.category] ?? 'bg-slate-50 text-slate-500 border-slate-100'}`}>
            {event.category}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase">{event.event_time?.slice(0, 5) || '10:00 AM'}</span>
        </div>

        <h3 className="text-2xl font-bold text-slate-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
          {event.title}
        </h3>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-slate-600 font-medium">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <CalendarDays className="w-4 h-4" />
            </div>
            <span className="capitalize text-sm">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600 font-medium">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="truncate text-sm">{event.location}</span>
          </div>
        </div>

        <p className="text-sm text-slate-500 line-clamp-2 mb-8 leading-relaxed font-medium">
          {event.description}
        </p>

        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
          <div className="flex -space-x-3">
             <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white" />
             <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white" />
             <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold border-2 border-white">+50</div>
          </div>
          <button className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
            Detalles <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
