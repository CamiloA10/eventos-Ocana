import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Music, Dumbbell, Map, LogIn, CalendarDays, UserPlus, Sparkles, ArrowRight, Star, CheckCircle2, Search, Zap, ShieldCheck, Globe, Facebook, Instagram, Twitter, Youtube, Trophy } from 'lucide-react';
import heroImg from '@/assets/ocana-hero.jpg';
import { useStats } from '@/hooks/useEvents';
import { useEventDirectory } from '@/hooks/useEventDirectory';
import { useTopRatedEvents } from '@/hooks/useRatings';
import EventCard from '@/components/EventCard';
import Navbar from '@/components/Navbar';
import { Asset } from '@/lib/assets';
import { dedupeSportNames } from '@/lib/events';

export default function Index() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: stats = { events: 0, aliados: 0, attendance: 0 } } = useStats();

  // Use the Unified Event Directory for the homepage preview
  const { data: events = [] } = useEventDirectory({ category: 'Todos' });
  const { data: topEvents = [], isLoading: loadingTopEvents } = useTopRatedEvents();
  const [selectedTopEvent, setSelectedTopEvent] = useState<any | null>(null);
  const [topEventKey, setTopEventKey] = useState(0);

  const customSportsList = dedupeSportNames(
    events
      .filter(e => e.category === 'Deportivo' && e.sub_category && !['Fútbol', 'Fútbol Sala', 'Baloncesto', 'Voleibol', 'Patinaje', 'Ciclismo', 'Atletismo', 'Otros'].includes(e.sub_category))
      .map(e => e.sub_category as string)
  );

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/eventos?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/eventos');
    }
  };

  useEffect(() => {
    if (window.location.hash === '#ranking') {
      setTimeout(() => {
        document.getElementById('ranking')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, []);

  const [activeCategoryGroup, setActiveCategoryGroup] = useState<'Religioso' | 'Deportivo' | null>(null);

  const categories = [
    { label: 'Cultural', tag: 'Arte & Música', img: Asset.getCategoryImage('Cultural'), count: `${events.filter(e => e.category === 'Cultural').length} eventos` },
    { label: 'Deportivo', tag: 'Acción & Salud', img: Asset.getCategoryImage('Deportivo'), count: `${events.filter(e => e.category === 'Deportivo').length} eventos` },
    { label: 'Turístico', tag: 'Rutas & Aventura', img: Asset.getCategoryImage('Turístico'), count: `${events.filter(e => e.category === 'Turístico').length} eventos` },
    { label: 'Religioso', tag: 'Fe & Tradición', img: Asset.getCategoryImage('Religioso'), count: `${events.filter(e => e.category === 'Religioso').length} eventos` },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 font-jakarta antialiased">
      <Navbar />

      {/* Premium Hero with Search */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-8 shadow-sm">
                <Zap className="w-4 h-4 text-blue-600 fill-current animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">La Agenda #1 de Ocaña</span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.85] tracking-tighter text-slate-900 uppercase italic">
                Todo lo que <br />
                pasa en <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Ocaña</span>
              </h1>

              <p className="text-xl text-slate-500 mb-10 max-w-xl leading-relaxed font-medium">
                Únete a miles de ocañeros que descubren los mejores planes de arte, música, deporte y cultura cada día.
              </p>

              <form onSubmit={handleSearch} className="relative max-w-2xl group mb-10">
                <div className="absolute inset-y-0 left-4 md:left-5 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 md:pl-14 pr-[80px] md:pr-32 py-4 md:py-5 bg-white border-2 border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 group-hover:border-blue-100 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm md:text-lg font-medium"
                />
                <button
                  type="submit"
                  className="absolute right-2 inset-y-2 md:right-3 md:inset-y-3 bg-blue-600 text-white px-4 md:px-8 rounded-xl font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                >
                  Buscar
                </button>
              </form>

              <div className="flex flex-wrap gap-12">
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-slate-900 tracking-tighter">{stats.events}+</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Eventos este mes</span>
                </div>
                <div className="w-px h-12 bg-slate-200 hidden sm:block" />
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-blue-600 tracking-tighter">{stats.aliados}+</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Aliados / Empresas</span>
                </div>
                <div className="w-px h-12 bg-slate-200 hidden sm:block" />
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-slate-900 tracking-tighter">{stats.attendance}+</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Eventos guardados</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative hidden lg:block animate-in fade-in zoom-in-95 duration-1000 delay-200">
              <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] ring-1 ring-slate-200">
                <img
                  src={heroImg}
                  alt="Ocaña Landscape"
                  className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700 transform hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                <div className="absolute bottom-10 left-10 text-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-blue-400">Próximamente</p>
                  <h3 className="text-3xl font-black tracking-tight mb-1">Carnavales de Ocaña</h3>
                  <p className="text-white/60 font-medium">Plaza de Ferias · Enero 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-20 text-center">
            <h2 className="text-5xl font-black tracking-tighter mb-4 text-slate-900 uppercase italic">
              Explora por <span className="text-blue-600">Categoría</span>
            </h2>
            <div className="h-1.5 w-24 bg-blue-600 rounded-full mb-6" />
            <p className="text-lg text-slate-500 max-w-2xl font-medium">
              Diseñado para que encuentres exactamente lo que necesitas vivir hoy en nuestra ciudad.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {!activeCategoryGroup ? (
              categories.map((cat) => (
                <div
                  key={cat.label}
                  onClick={() => {
                    if (cat.label === 'Religioso' || cat.label === 'Deportivo') {
                      setActiveCategoryGroup(cat.label as 'Religioso' | 'Deportivo');
                    } else {
                      navigate(`/eventos?categoria=${cat.label}`);
                    }
                  }}
                  className="group relative h-[450px] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100 bg-slate-100 transition-all hover:-translate-y-2 duration-500 cursor-pointer"
                >
                  <img src={cat.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={cat.label} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/10 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                  <div className="absolute inset-0 p-10 flex flex-col justify-end">
                    <div className="bg-blue-600/90 backdrop-blur-md px-4 py-1.5 rounded-full text-white font-black text-[9px] uppercase tracking-[0.2em] w-fit mb-4">
                      {cat.tag}
                    </div>
                    <h3 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter italic">{cat.label}</h3>
                    <div className="flex items-center gap-2 text-white/70 font-bold group-hover:text-white transition-colors uppercase text-[10px] tracking-widest">
                      {cat.count} <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                {(activeCategoryGroup === 'Religioso' ? [
                  { label: 'Iglesia Católica', tag: 'Fe & Tradición', img: Asset.getCategoryImage('Iglesia Católica') },
                  { label: 'Iglesia Evangélica', tag: 'Alabanza & Vida', img: Asset.getCategoryImage('Iglesia Evangélica') },
                ] : [
                  { label: 'Fútbol', tag: 'Deporte Rey', img: Asset.getCategoryImage('Deportivo') },
                  { label: 'Fútbol Sala', tag: 'Acción Rápida', img: Asset.getCategoryImage('Deportivo') },
                  { label: 'Baloncesto', tag: 'Adrenalina', img: Asset.getCategoryImage('Deportivo') },
                  { label: 'Voleibol', tag: 'Trabajo en Equipo', img: Asset.getCategoryImage('Deportivo') },
                  { label: 'Patinaje', tag: 'Diversión & Salud', img: Asset.getCategoryImage('Deportivo') },
                  { label: 'Ciclismo', tag: 'Nuevas Rutas', img: Asset.getCategoryImage('Deportivo') },
                  { label: 'Atletismo', tag: 'Resistencia', img: Asset.getCategoryImage('Deportivo') },
                  ...customSportsList.map(sportName => ({ label: sportName, tag: 'Nuevo Deporte', img: Asset.getCategoryImage('Deportivo') })),
                  { label: 'Otros', tag: 'Más Deportes', img: Asset.getCategoryImage('Deportivo') },
                ]).map((sub) => {
                  const count = events.filter(e => e.sub_category === sub.label && e.category === activeCategoryGroup).length;
                  // Ocultar subcategorías deportivas que no tienen eventos para no saturar
                  if (activeCategoryGroup === 'Deportivo' && count === 0) return null;

                  return (
                    <Link
                      key={sub.label}
                      to={`/eventos?categoria=${activeCategoryGroup}&subcategoria=${encodeURIComponent(sub.label)}`}
                      className={`group relative h-[350px] rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 bg-slate-100 transition-all hover:-translate-y-2 duration-500 ${activeCategoryGroup === 'Religioso' ? 'sm:col-span-1 lg:col-span-2 h-[450px]' : ''}`}
                    >
                      <img src={sub.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={sub.label} />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                      <div className="absolute inset-0 p-8 flex flex-col justify-end">
                        <div className="bg-blue-600/90 backdrop-blur-md px-4 py-1.5 rounded-full text-white font-black text-[9px] uppercase tracking-[0.2em] w-fit mb-4">
                          {sub.tag}
                        </div>
                        <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter italic">{sub.label}</h3>
                        <div className="flex items-center gap-2 text-white/70 font-bold group-hover:text-white transition-colors uppercase text-[10px] tracking-widest">
                          {count} eventos <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </Link>
                  );
                })}

                {activeCategoryGroup === 'Deportivo' && events.filter(e => e.category === 'Deportivo').length === 0 && (
                  <div className="col-span-full py-20 text-center text-slate-500">
                    Aún no hay eventos deportivos programados.
                  </div>
                )}

                <button
                  onClick={() => setActiveCategoryGroup(null)}
                  className="col-span-full mt-8 text-blue-600 font-black uppercase text-[10px] tracking-widest hover:underline text-center"
                >
                  ← Volver a todas las categorías
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Upcoming Events Grid */}
      {events.length > 0 && (
        <section className="py-32 px-6 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                  📅 <span className="text-blue-600">Próximos</span> eventos
                </h2>
                <p className="text-slate-500 font-medium mt-2">Los planes más esperados en la ciudad.</p>
              </div>
              <Link to="/eventos" className="group flex items-center gap-3 text-blue-600 font-black uppercase text-xs tracking-[0.2em]">
                Ver todo el calendario
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {events.slice(0, 6).map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top 5 Rated Events Grid */}
      {topEvents.length > 0 && (
        <section id="ranking" className="py-24 px-6 bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-32 opacity-5 pointer-events-none">
            <Trophy className="w-96 h-96" />
          </div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col mb-16 text-center items-center">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-4 justify-center">
                <Trophy className="w-10 h-10 text-yellow-500" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-600">Top 5</span> Mejor Calificados
              </h2>
              <div className="h-1.5 w-24 bg-yellow-400 rounded-full my-6" />
              <p className="text-slate-500 font-medium max-w-xl">
                Descubre los eventos que más han encantado a nuestra comunidad. ¡No te quedes sin vivirlos!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {topEvents.map((event: any, index: number) => (
                <div
                  key={event.id}
                  onClick={() => { setSelectedTopEvent(event); setTopEventKey(prev => prev + 1); }}
                  className="group relative bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-yellow-200 hover:-translate-y-2 transition-all flex flex-col h-full cursor-pointer"
                >
                  <div className={`absolute -top-4 -left-4 w-12 h-12 flex items-center justify-center rounded-2xl font-black text-xl shadow-lg border-2 ${index === 0 ? 'bg-yellow-400 text-yellow-900 border-yellow-300' :
                    index === 1 ? 'bg-slate-200 text-slate-700 border-slate-100' :
                      index === 2 ? 'bg-amber-600 text-orange-50 border-amber-500' :
                        'bg-white text-slate-400 border-slate-100'
                    }`}>
                    #{index + 1}
                  </div>

                  {event.image_url ? (
                    <img src={event.image_url} alt={event.title} className="w-full h-40 object-cover rounded-2xl mb-6 shadow-md" />
                  ) : (
                    <div className="w-full h-40 bg-slate-50 rounded-2xl mb-6 flex items-center justify-center">
                      <Star className="w-10 h-10 text-slate-300" />
                    </div>
                  )}

                  <div className="flex-1 flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">{event.category}</span>
                    <h4 className="font-bold text-lg text-slate-900 leading-tight mb-2 flex-1">{event.title}</h4>

                    <div className="pt-4 mt-auto border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-black text-lg text-slate-900">{Number(event.averageRating).toFixed(1)}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{event.totalRatings} Reseñas</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Refined Premium Footer */}

      {/* Hidden EventCard for Top 5 Modal */}
      {selectedTopEvent && (
        <EventCard key={`top-event-${topEventKey}`} event={selectedTopEvent} initialOpen={true} hideCard={true} />
      )}

      <footer className="bg-slate-950 text-slate-400 pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mb-20">
            <div className="lg:col-span-5 space-y-10">
              <Link to="/" className="flex items-center gap-3 group w-fit">
                <img
                  src={`${import.meta.env.BASE_URL}assets/logo.png`}
                  alt="¿Hey pa' dónde vamos?"
                  className="h-20 md:h-54 w-auto transition-transform group-hover:scale-105 brightness-0 invert"
                />
              </Link>

              <p className="text-lg text-slate-400 leading-relaxed max-w-sm font-medium tracking-tight">
                La plataforma líder que conecta a la comunidad de <span className="text-white font-black">Ocaña</span> con las mejores experiencias culturales.
              </p>

              <div className="flex gap-4">
                {[
                  { name: 'Facebook', icon: <Facebook className="w-5 h-5" /> },
                  { name: 'Instagram', icon: <Instagram className="w-5 h-5" /> },
                  { name: 'Twitter', icon: <Twitter className="w-5 h-5" /> },
                ].map((social) => (
                  <button
                    key={social.name}
                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-blue-600 hover:border-blue-500 transition-all duration-300 hover:-translate-y-1 shadow-lg"
                  >
                    {social.icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
              <div className="space-y-8">
                <h4 className="text-white font-black text-[10px] uppercase tracking-[0.3em] border-l-2 border-blue-600 pl-4">Plataforma</h4>
                <ul className="space-y-4 text-sm font-bold tracking-tight">
                  <li><Link to="/eventos" className="text-slate-400 hover:text-white transition-colors">Todos los Eventos</Link></li>
                  <li><Link to="/eventos?categoria=Cultural" className="text-slate-400 hover:text-white transition-colors">Agenda Cultural</Link></li>
                  <li><Link to="/eventos?categoria=Deportivo" className="text-slate-400 hover:text-white transition-colors">Planes Deportivos</Link></li>
                </ul>
              </div>

              <div className="space-y-8">
                <h4 className="text-white font-black text-[10px] uppercase tracking-[0.3em] border-l-2 border-blue-600 pl-4">Comunidad</h4>
                <ul className="space-y-4 text-sm font-bold tracking-tight">
                  <li><Link to="/login" className="text-slate-400 hover:text-white transition-colors">Acceso VIP</Link></li>
                  <li><Link to="/register" className="text-slate-400 hover:text-white transition-colors">Crear Cuenta</Link></li>
                  <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Soporte</a></li>
                </ul>
              </div>

              <div className="col-span-2 md:col-span-1 space-y-8">
                <h4 className="text-white font-black text-[10px] uppercase tracking-[0.3em] border-l-2 border-blue-600 pl-4">Boletín</h4>
                <div className="space-y-4">
                  <p className="text-sm font-bold text-slate-500 tracking-tight">Recibe planes exclusivos.</p>
                  <div className="flex flex-col gap-3">
                    <input
                      type="email"
                      placeholder="Tu correo"
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-white font-medium"
                    />
                    <button className="bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest transition-all">
                      Suscribirme
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs font-bold text-slate-600 tracking-widest uppercase">© 2026 · Ocaña · Pasión por lo nuestro</p>
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/50">CEDIT System Active</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
