import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEventDirectory } from '@/hooks/useEventDirectory';
import EventCard from '@/components/EventCard';
import Navbar from '@/components/Navbar';

const CATEGORIES = ['Todos', 'Cultural', 'Deportivo', 'Turístico', 'Religioso'];
const RELIGIOUS_SUB_CATEGORIES = ['Todas', 'Iglesia Católica', 'Iglesia Evangélica'];
const SPORTS_SUB_CATEGORIES = ['Todas', 'Fútbol', 'Fútbol Sala', 'Baloncesto', 'Voleibol', 'Patinaje', 'Ciclismo', 'Atletismo', 'Otros'];

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initCat = searchParams.get('categoria') ?? 'Todos';
  const initSubCat = searchParams.get('subcategoria') ?? 'Todas';
  const initSearch = searchParams.get('search') ?? '';

  const [category, setCategory] = useState(initCat);
  const [subCategory, setSubCategory] = useState(initSubCat);
  const [search, setSearch] = useState(initSearch);

  useEffect(() => {
    setCategory(searchParams.get('categoria') ?? 'Todos');
    setSubCategory(searchParams.get('subcategoria') ?? 'Todas');
    setSearch(searchParams.get('search') ?? '');
  }, [searchParams]);

  const { user } = useAuth();

  // Use the Deep Module for all event retrieval
  const { data: events = [], isLoading } = useEventDirectory({
    category: category === 'Favoritos' ? 'Todos' : category,
    subCategory: (category === 'Religioso' || category === 'Deportivo') ? subCategory : undefined,
    searchTerm: search,
    showFavorites: category === 'Favoritos',
    userId: user?.id
  });

  const { data: customSports = [] } = useQuery({
    queryKey: ['custom-sports'],
    queryFn: async () => {
      const { data } = await supabase
        .from('events')
        .select('sub_category')
        .eq('category', 'Deportivo')
        .not('sub_category', 'is', null);
      if (!data) return [];
      const sports = new Set(data.map(d => d.sub_category).filter(s => s && s !== 'Otros' && !SPORTS_SUB_CATEGORIES.includes(s)));
      return Array.from(sports).sort();
    }
  });

  const allSportFilters = [...SPORTS_SUB_CATEGORIES.filter(s => s !== 'Otros'), ...customSports, 'Otros'];

  const categories = [...CATEGORIES];
  if (user) {
    categories.push('Favoritos');
  }

  return (
    <div className="min-h-screen bg-background font-jakarta">
      <Navbar />

      <div className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-display text-5xl font-black text-slate-950 tracking-tighter uppercase mb-3">Eventos en Ocaña</h1>
          <p className="text-muted-foreground text-lg font-medium">Encuentra el plan perfecto para ti</p>
        </div>

        <div className="space-y-6 mb-10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all shadow-sm focus:shadow-md"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setSubCategory('Todas');
                  }}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${category === cat
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-card border-2 border-border text-slate-500 hover:border-blue-600 hover:text-blue-600'
                    }`}
                >
                  {cat === 'Cultural' ? '🎭' : cat === 'Deportivo' ? '⚽' : cat === 'Turístico' ? '🗺️' : cat === 'Religioso' ? '⛪' : cat === 'Favoritos' ? <Star className="w-4 h-4 fill-current" /> : '📋'}
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {(category === 'Religioso' || category === 'Deportivo') && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest sm:ml-4 whitespace-nowrap">
                {category === 'Deportivo' ? 'Deportes' : 'Sub-categorías'}:
              </span>
              <div className="flex gap-2 flex-wrap">
                {(category === 'Religioso' ? RELIGIOUS_SUB_CATEGORIES : allSportFilters).map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSubCategory(sub)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subCategory === sub
                      ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                      : 'text-slate-400 hover:text-slate-600'
                      }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <p className="text-6xl mb-6">🏜️</p>
            <p className="text-xl text-slate-900 font-black uppercase tracking-tight">No se encontraron eventos</p>
            <p className="text-slate-400 font-medium mt-2">Intenta con otra categoría o términos de búsqueda</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8 px-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                {events.length} Resultado{events.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map(event => (
                <EventCard key={event.id} event={event} initialOpen={event.id === searchParams.get('id')} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
