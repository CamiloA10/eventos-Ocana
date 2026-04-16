import { CalendarDays, MapPin, Tag, Star } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSaveEvent, useSavedEvents, type Event } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

const CATEGORY_COLORS: Record<string, string> = {
  Cultural: 'bg-orange-100 text-orange-700 border-orange-200',
  Deportivo: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Turístico': 'bg-amber-100 text-amber-700 border-amber-200',
};

const CATEGORY_EMOJI: Record<string, string> = {
  Cultural: '🎭',
  Deportivo: '⚽',
  'Turístico': '🗺️',
};

const PLACEHOLDER = 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80';

interface Props {
  event: Event;
}

export default function EventCard({ event }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { user } = useAuth();
  const { data: savedEvents = [] } = useSavedEvents(user?.id);
  const saveEventMutation = useSaveEvent();

  const isSaved = savedEvents.includes(event.id);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return; // Podríamos mostrar un toast de login here
    saveEventMutation.mutate({ userId: user.id, eventId: event.id, isSaved });
  };

  const formattedDate = (() => {
    try {
      return format(parseISO(event.event_date), "d 'de' MMMM 'de' yyyy", { locale: es });
    } catch {
      return event.event_date;
    }
  })();

  return (
    <div className="bg-card rounded-3xl overflow-hidden border border-border card-shadow card-hover-shadow transition-all hover:-translate-y-1 flex flex-col">
      <div className="relative h-48 overflow-hidden bg-muted">
        <img
          src={event.image_url || PLACEHOLDER}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
        />
        {event.featured && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow">
            ⭐ Destacado
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-display text-lg font-bold text-foreground leading-tight line-clamp-2 flex-1">
            {event.title}
          </h3>
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border whitespace-nowrap ${CATEGORY_COLORS[event.category] ?? 'bg-muted text-muted-foreground'}`}>
            {CATEGORY_EMOJI[event.category]} {event.category}
          </span>
        </div>

        <div className="space-y-1.5 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary shrink-0" />
            <span>{formattedDate}{event.event_time ? ` · ${event.event_time.slice(0, 5)}` : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-accent shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        <p className={`text-sm text-foreground/70 mb-4 ${expanded ? '' : 'line-clamp-2'}`}>
          {event.description}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-primary font-semibold text-sm hover:underline"
          >
            {expanded ? 'Ver menos ↑' : 'Ver más →'}
          </button>

          {user && (
            <button
              onClick={toggleSave}
              className={`p-2 rounded-full transition-colors ${
                isSaved 
                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              title={isSaved ? "Quitar de destacados" : "Destacar evento"}
            >
              <Star className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
