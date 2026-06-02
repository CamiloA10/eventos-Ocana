import { useState, useEffect } from 'react';
import { CalendarDays, MapPin, Star, ArrowRight, ShieldCheck, Clock, Check, Share2, Heart, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { type Event } from '@/hooks/useEvents';
import { useEventActions } from '@/hooks/useEventActions';
import { Asset } from '@/lib/assets';
import { ImageWithLoader } from './ui/ImageWithLoader';

const CATEGORY_COLORS: Record<string, string> = {
  Cultural: 'bg-blue-50 text-blue-700 border-blue-100',
  Deportivo: 'bg-red-50 text-red-700 border-red-100',
  'Turístico': 'bg-green-50 text-green-700 border-green-100',
  'Religioso': 'bg-purple-50 text-purple-700 border-purple-100',
};

interface Props {
  event: Event;
  initialOpen?: boolean;
}

export default function EventCard({ event, initialOpen = false }: Props) {
  const [showDetails, setShowDetails] = useState(initialOpen);

  useEffect(() => {
    if (initialOpen) {
      setShowDetails(true);
    }
  }, [initialOpen]);
  const { toggleSave, shareEvent, isSaved, isPending } = useEventActions();

  const saved = isSaved(event.id);
  const attendanceCount = event.attendance_count?.[0]?.count ?? 0;

  const onToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave(event);
  };

  const onShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    shareEvent(event);
  };

  const formattedDate = (() => {
    try {
      return format(parseISO(event.event_date), "EEE d 'de' MMMM", { locale: es });
    } catch {
      return event.event_date;
    }
  })();

  // Use the Asset module for optimized images
  const cardImage = Asset.getImageUrl(event.image_url, 'event', { size: 'sm' });
  const modalImage = Asset.getImageUrl(event.image_url, 'event', { size: 'lg' });

  return (
    <>
      <div
        onClick={() => setShowDetails(true)}
        className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.1)] hover:border-blue-100 transition-all duration-500 flex flex-col h-full transform hover:-translate-y-2 cursor-pointer"
      >
        <div className="relative h-64 overflow-hidden">
          <ImageWithLoader
            src={cardImage}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            fallbackSrc={Asset.getPlaceholder('event')}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

          <div className="absolute top-6 left-6 flex flex-col gap-2">
            <div className="bg-white/90 backdrop-blur-md text-slate-900 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5 border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Verificado
            </div>
          </div>

          <div className="absolute top-6 right-6 flex gap-2">
            <button
              onClick={onShare}
              className="p-3 rounded-2xl backdrop-blur-md bg-white/80 text-slate-400 hover:text-blue-600 hover:bg-white shadow-lg transition-all duration-300"
              title="Compartir"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleSave}
              disabled={isPending}
              className={`p-3 rounded-2xl backdrop-blur-md shadow-lg transition-all duration-300 ${saved
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/80 text-slate-400 hover:text-blue-600 hover:bg-white'
                } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {saved ? <Check className="w-4 h-4 stroke-[3px]" /> : <Heart className="w-4 h-4" />}
            </button>
          </div>

          <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center">
            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md shadow-sm ${CATEGORY_COLORS[event.category] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
              {event.category}
            </div>
          </div>
        </div>

        <div className="p-8 flex flex-col flex-grow">
          <div className="flex items-center gap-3 mb-4 text-slate-400">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-xl border border-slate-100">
              <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-black uppercase tracking-tighter">{formattedDate}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-200" />
            <span className="text-[10px] font-black uppercase tracking-widest">{event.event_time?.slice(0, 5) || 'TODO EL DÍA'}</span>
          </div>

          <h3 className="text-2xl font-black mb-4 leading-[1.1] group-hover:text-blue-600 transition-colors uppercase tracking-tighter italic">{event.title}</h3>

          <a 
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.location + ', Ocaña, Norte de Santander')}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 mb-6 text-slate-500 hover:text-blue-600 transition-colors w-fit group/loc"
          >
            <MapPin className="w-4 h-4 text-blue-500/50 shrink-0 group-hover/loc:text-blue-600 transition-colors" />
            <span className="text-sm font-bold line-clamp-1 tracking-tight underline-offset-4 group-hover/loc:underline">{event.location}</span>
          </a>

          <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                    <img src={Asset.getImageUrl(null, 'avatar')} className="w-full h-full object-cover grayscale-[0.3]" />
                  </div>
                ))}
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {attendanceCount > 0 ? `+${attendanceCount} interesados` : 'Sé el primero'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest group/btn py-2 rounded-xl transition-all">
              <span className="group-hover/btn:mr-2 transition-all">Ver Más</span>
              <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] md:rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col md:flex-row animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowDetails(false); }}
              className="absolute top-4 right-4 md:top-6 md:right-6 z-10 p-3 md:p-4 bg-black/10 hover:bg-black/20 backdrop-blur-md rounded-full transition-all transform active:scale-95"
            >
              <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </button>

            <div className="md:w-[45%] relative bg-slate-100 min-h-[250px] h-[250px] md:h-auto md:min-h-full shrink-0">
              <ImageWithLoader
                src={modalImage}
                className="w-full h-full object-cover"
                alt={event.title}
                fallbackSrc={Asset.getPlaceholder('event')}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10">
                <div className={`w-fit px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border mb-4 md:mb-6 backdrop-blur-md shadow-2xl ${CATEGORY_COLORS[event.category]}`}>
                  {event.category}
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-[0.85] uppercase italic">{event.title}</h2>
              </div>
            </div>

            <div className="md:w-[55%] p-6 md:p-10 overflow-y-auto custom-scrollbar bg-white flex flex-col">
              <div className="space-y-6 md:space-y-8 flex-grow">
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div className="flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-2xl md:rounded-3xl bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner shrink-0">
                      <CalendarDays className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Fecha</p>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{formattedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-2xl md:rounded-3xl bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner shrink-0">
                      <Clock className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Hora</p>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{event.event_time?.slice(0, 5) || 'Todo el día'}</p>
                    </div>
                  </div>
                </div>

                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.location + ', Ocaña, Norte de Santander')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-2xl md:rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-600 hover:shadow-xl hover:shadow-blue-100 transition-all group/location cursor-pointer"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-green-100 flex items-center justify-center text-green-600 shadow-inner group-hover/location:bg-green-600 group-hover/location:text-white transition-colors shrink-0">
                    <MapPin className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Ubicación</p>
                    <p className="text-sm font-black text-slate-900 leading-tight uppercase tracking-tight group-hover/location:text-blue-600 transition-colors">
                      {event.location}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-400 opacity-0 group-hover/location:opacity-100 transition-all transform translate-x-2 group-hover/location:translate-x-0">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </a>

                <div>
                  <h4 className="text-[10px] uppercase font-black text-blue-600 tracking-[0.3em] mb-3 md:mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Detalles del Evento
                  </h4>
                  <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">
                    {event.description || "Descubre una experiencia única en el corazón de Ocaña. No te pierdas este evento especial diseñado para ti."}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 md:mt-8 md:pt-8 border-t border-slate-100 flex flex-col gap-5 md:gap-6 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="flex -space-x-2 md:-space-x-3">
                      {[1, 2, 3, 4].map(i => (
                        <img key={i} src={Asset.getImageUrl(null, 'avatar')} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 md:border-[3px] border-white bg-slate-100" />
                      ))}
                    </div>
                    <p className="text-xs font-bold text-slate-500">
                      <span className="text-slate-950 font-black mr-1">+{attendanceCount + 42}</span> personas interesadas
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 md:gap-6">
                  <button
                    onClick={onToggleSave}
                    disabled={isPending}
                    className={`flex-grow py-4 md:py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-2 md:gap-3 ${saved ? 'bg-slate-100 text-slate-900 hover:bg-slate-200' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                      } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {saved ? (
                      <>
                        <Check className="w-4 h-4 md:w-5 md:h-5 stroke-[3px]" />
                        En Favoritos
                      </>
                    ) : (
                      <>
                        <Heart className="w-5 h-5" />
                        Guardar Evento
                      </>
                    )}
                  </button>
                  <button
                    onClick={onShare}
                    className="p-4 md:p-5 bg-slate-50 rounded-2xl hover:bg-slate-100 text-slate-400 transition-all hover:text-blue-600 border border-slate-100 shadow-sm shrink-0"
                  >
                    <Share2 className="w-5 h-5 md:w-6 md:h-6" />
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
