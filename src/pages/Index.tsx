import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Music, Dumbbell, Map, LogIn, CalendarDays, UserPlus, Sparkles, ArrowRight, Star, CheckCircle2, Search, Zap, ShieldCheck, Globe, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import heroImg from '@/assets/ocana-hero.jpg';
import { useStats, useEvents } from '@/hooks/useEvents';
import EventCard from '@/components/EventCard';
import Navbar from '@/components/Navbar';

export default function Index() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: stats = { events: 0, companies: 0, attendance: 0 } } = useStats();
  const { data: events = [] } = useEvents('Todos');

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/eventos?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/eventos');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 font-sans antialiased">
      <Navbar />

      {/* Premium Hero with Search */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-8">
                <Zap className="w-4 h-4 text-blue-600 fill-current" />
                <span className="text-xs font-bold uppercase tracking-widest text-blue-700">La Agenda #1 de Ocaña</span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter text-slate-900">
                Todo lo que <br />
                pasa en <span className="text-blue-600">Ocaña</span>
              </h1>

              <p className="text-xl text-slate-600 mb-10 max-w-xl leading-relaxed font-medium">
                Únete a miles de ocañeros que descubren los mejores planes de arte, música, deporte y cultura cada día.
              </p>

              <form onSubmit={handleSearch} className="relative max-w-2xl group mb-10">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="¿Buscas algún evento en especial?"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-32 py-5 bg-white border-2 border-slate-100 rounded-2xl shadow-xl shadow-slate-200 group-hover:border-blue-100 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-lg font-medium"
                />
                <button
                  type="submit"
                  className="absolute right-3 inset-y-3 bg-blue-600 text-white px-8 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                >
                  Buscar
                </button>
              </form>

              <div className="flex flex-wrap gap-12">
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-slate-900 tracking-tighter">{stats.events}+</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Eventos este mes</span>
                </div>
                <div className="w-px h-12 bg-slate-200 hidden sm:block" />
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-blue-600 tracking-tighter">{stats.companies}+</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Aliados / Empresas</span>
                </div>
                <div className="w-px h-12 bg-slate-200 hidden sm:block" />
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-slate-900 tracking-tighter">{stats.attendance}+</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Asistencias</span>
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
                  <p className="text-xs font-black uppercase tracking-[0.2em] mb-2 text-blue-400">Próximamente</p>
                  <h3 className="text-3xl font-bold mb-1">Carnavales de Ocaña</h3>
                  <p className="text-white/60 font-medium">Plaza de Ferias · Enero 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="py-24 px-6 relative overflow-hidden bg-slate-50/50">
        {/* Background Decorations */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl translate-y-1/2" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500 group">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-4 tracking-tight">100% Verificado</h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Filtramos cada publicación para asegurar que la información sea real y actualizada directamente de fuentes oficiales de Ocaña.
              </p>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500 group">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-8 group-hover:scale-110 transition-transform">
                <Globe className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-4 tracking-tight">Todo en un lugar</h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Desde el concierto más grande en la Plaza hasta el taller más pequeño. La agenda más completa de la región en tu mano.
              </p>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500 group">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-8 group-hover:scale-110 transition-transform">
                <UserPlus className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-4 tracking-tight">Comunidad Viva</h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Mira quién asiste, comenta y comparte eventos con tus amigos. Ocaña se vive mejor cuando nos encontramos todos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Categories */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-20 text-center">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-slate-900 uppercase">
              Elige tu <span className="text-blue-600">Aventura</span>
            </h2>
            <div className="h-1.5 w-24 bg-blue-600 rounded-full mb-6" />
            <p className="text-lg text-slate-500 max-w-2xl font-medium">
              Categorías diseñadas para que encuentres exactamente lo que necesitas vivir hoy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'Cultural', tag: 'Arte & Música', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80', count: '12 eventos' },
              { label: 'Deportivo', tag: 'Acción & Salud', img: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80', count: '8 eventos' },
              { label: 'Turístico', tag: 'Rutas & Aventura', img: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80', count: '5 eventos' },
              { label: 'Religioso', tag: 'Fe & Tradición', img: 'https://laupljykvfcggawtpvnj.supabase.co/storage/v1/object/public/event-images/santuario_torcoroma.png', count: '4 eventos' },
            ].map((cat) => (
              <Link
                key={cat.label}
                to={`/eventos?categoria=${cat.label}`}
                className="group relative h-[450px] rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100 bg-slate-100 transition-all hover:-translate-y-2 duration-500"
              >
                <img src={cat.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={cat.label} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                  <div className="bg-blue-600/90 backdrop-blur-md px-4 py-1.5 rounded-full text-white font-bold text-[10px] uppercase tracking-widest w-fit mb-4">
                    {cat.tag}
                  </div>
                  <h3 className="text-4xl font-bold text-white mb-2">{cat.label}</h3>
                  <div className="flex items-center gap-2 text-white/70 font-semibold group-hover:text-white transition-colors">
                    {cat.count} <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Grid */}
      {events.length > 0 && (
        <section className="py-32 px-6 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
                  📅 <span className="text-blue-600">Próximos</span> eventos
                </h2>
                <p className="text-slate-500 font-medium mt-2">Los eventos con mayor asistencia en la región.</p>
              </div>
              <Link to="/eventos" className="group flex items-center gap-2 text-blue-600 font-bold text-lg">
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

      {/* Refined Premium Footer */}
      <footer className="bg-slate-950 text-slate-400 pt-24 pb-12 px-6 font-display">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mb-20">
            <div className="lg:col-span-5 space-y-10">
              <Link to="/" className="flex items-center gap-3 group w-fit">
                <div className="bg-blue-600 rounded-lg p-2 transition-transform group-hover:scale-110">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-3xl font-black tracking-tighter text-white font-display">
                  ¿Hey pa' <span className="text-blue-500">dónde vamos?</span>
                </span>
              </Link>

              <p className="text-lg text-slate-300 leading-relaxed max-w-sm font-medium tracking-tight">
                La plataforma líder que conecta a la comunidad de <span className="text-blue-500 font-bold">Ocaña</span> con las mejores experiencias culturales y deportivas.
              </p>

              <div className="flex gap-4">
                {[
                  { name: 'Facebook', icon: <Facebook className="w-5 h-5" /> },
                  { name: 'Instagram', icon: <Instagram className="w-5 h-5" /> },
                  { name: 'Twitter', icon: <Twitter className="w-5 h-5" /> },
                  { name: 'Youtube', icon: <Youtube className="w-5 h-5" /> },
                ].map((social) => (
                  <button
                    key={social.name}
                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-blue-600 hover:border-blue-500 transition-all duration-300 hover:-translate-y-1 shadow-lg"
                    title={social.name}
                  >
                    {social.icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
              <div className="space-y-8">
                <h4 className="text-white font-black text-xs uppercase tracking-widest font-display border-l-2 border-blue-600 pl-3">Plataforma</h4>
                <ul className="space-y-4 text-base font-bold tracking-tight font-display">
                  <li><Link to="/eventos" className="text-slate-400 hover:text-white transition-colors">Todos los Eventos</Link></li>
                  <li><Link to="/eventos?categoria=Cultural" className="text-slate-400 hover:text-white transition-colors">Agenda Cultural</Link></li>
                  <li><Link to="/eventos?categoria=Deportivo" className="text-slate-400 hover:text-white transition-colors">Planes Deportivos</Link></li>
                </ul>
              </div>

              <div className="space-y-8">
                <h4 className="text-white font-black text-xs uppercase tracking-widest font-display border-l-2 border-blue-600 pl-3">Comunidad</h4>
                <ul className="space-y-4 text-base font-bold tracking-tight font-display">
                  <li><Link to="/login" className="text-slate-400 hover:text-white transition-colors">Acceso VIP</Link></li>
                  <li><Link to="/register" className="text-slate-400 hover:text-white transition-colors">Crear Cuenta</Link></li>
                  <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Soporte 24/7</a></li>
                </ul>
              </div>

              <div className="col-span-2 md:col-span-1 space-y-8">
                <h4 className="text-white font-black text-xs uppercase tracking-widest font-display border-l-2 border-blue-600 pl-3">Boletín</h4>
                <div className="space-y-4">
                  <p className="text-base font-bold text-slate-400 tracking-tight font-display">Suscríbete para recibir novedades exclusivas.</p>
                  <div className="flex flex-col gap-3">
                    <input
                      type="email"
                      placeholder="Correo electrónico"
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-white font-medium transition-all"
                    />
                    <button className="bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-900/40 transform active:scale-95">
                      Suscribirme ahora
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm font-bold text-slate-500 font-display tracking-tight">© 2025 · Ocaña · Pasión por lo nuestro</p>
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse" />
              <span className="text-xs text-white font-bold tracking-tight font-display">Servidor Ocaña Activo</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
