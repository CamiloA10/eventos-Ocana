import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import { useEvents, useSavedEvents } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import EventCard from '@/components/EventCard';
import Navbar from '@/components/Navbar';

const CATEGORIES = ['Todos', 'Cultural', 'Deportivo', 'Turístico', 'Religioso'];

export default function EventsPage() {
  const [searchParams] = useSearchParams();
  const initCat = searchParams.get('categoria') ?? 'Todos';
  const initSearch = searchParams.get('search') ?? '';

  const [category, setCategory] = useState(initCat);
  const [search, setSearch] = useState(initSearch);

  const { user } = useAuth();
  const { data: savedEventIds = [] } = useSavedEvents(user?.id);

  const internalCat = category === 'Destacados' ? 'Todos' : category;
  const { data: allEvents = [], isLoading } = useEvents(internalCat, search);

  const events = category === 'Destacados'
    ? allEvents.filter(e => savedEventIds.includes(e.id))
    : allEvents;

  const categories = [...CATEGORIES];
  if (user) {
    categories.push('Destacados');
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-5xl font-black text-gradient mb-3">Eventos en Ocaña</h1>
          <p className="text-muted-foreground text-lg">Encuentra el plan perfecto para ti</p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm transition-all ${category === cat
                    ? 'bg-primary text-primary-foreground shadow-md scale-105'
                    : 'bg-card border-2 border-border text-foreground hover:border-primary'
                  }`}
              >
                {cat === 'Cultural' ? '🎭' : cat === 'Deportivo' ? '⚽' : cat === 'Turístico' ? '🗺️' : cat === 'Religioso' ? '⛪' : cat === 'Destacados' ? <Star className="w-4 h-4" /> : '📋'}
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Events grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">😕</p>
            <p className="text-xl text-muted-foreground font-medium">No se encontraron eventos</p>
            <p className="text-muted-foreground mt-2">Intenta con otra categoría o búsqueda</p>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground mb-6">{events.length} evento{events.length !== 1 ? 's' : ''} encontrado{events.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
