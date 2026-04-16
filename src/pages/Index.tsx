import { Link } from 'react-router-dom';
import { Music, Dumbbell, Map, LogIn, CalendarDays, UserPlus } from 'lucide-react';
import heroImg from '@/assets/ocana-hero.jpg';
import { useUpcomingCount, useFeaturedEvents } from '@/hooks/useEvents';
import EventCard from '@/components/EventCard';
import Navbar from '@/components/Navbar';

export default function Index() {
  const { data: upcomingCount = 0 } = useUpcomingCount();
  const { data: featured = [] } = useFeaturedEvents();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImg})` }}
        />


        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-2 mb-6 mt-24">
            <span className="text-sm font-medium text-primary-foreground">📍 Ocaña, Norte de Santander</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-primary-foreground mb-6 leading-tight drop-shadow-lg">
            ¿Qué hay
            <span className="block text-primary drop-shadow-none" style={{ WebkitTextStroke: '2px hsl(28 90% 52%)' }}>
              pa' hacer?
            </span>
          </h1>
          <p className="text-lg md:text-2xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Descubre los mejores eventos <strong>culturales, deportivos y turísticos</strong> de Ocaña
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/eventos"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-primary hover:from-primary hover:to-orange-600 text-white font-extrabold text-lg px-8 py-4 rounded-full shadow-[0_10px_30px_-10px_rgba(255,100,0,0.5)] hover:shadow-[0_15px_40px_-10px_rgba(255,100,0,0.6)] transition-all hover:-translate-y-1.5 active:scale-95"
            >
              <CalendarDays className="w-5 h-5 transition-transform group-hover:scale-110" />
              Ver Eventos
            </Link>
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-teal-500 hover:to-emerald-600 text-white font-extrabold text-lg px-8 py-4 rounded-full shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)] hover:shadow-[0_15px_40px_-10px_rgba(16,185,129,0.6)] transition-all hover:-translate-y-1.5 active:scale-95"
            >
              <UserPlus className="w-5 h-5 transition-transform group-hover:scale-110" />
              Obtener cuenta
            </Link>
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/40 text-white font-extrabold text-lg px-8 py-4 rounded-full transition-all hover:-translate-y-1.5 active:scale-95 shadow-lg"
            >
              <LogIn className="w-5 h-5 transition-transform group-hover:scale-110" />
              Ingresar
            </Link>
          </div>

          {/* Counter */}
          <div className="mt-12 inline-flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/20 rounded-3xl px-8 py-5 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-display font-black text-primary drop-shadow-[0_0_15px_rgba(255,140,0,0.4)]">{upcomingCount}</span>
            </div>
            <div className="h-10 w-[1px] bg-white/20" />
            <div className="text-sm font-bold text-white uppercase tracking-wider text-left leading-tight">
              eventos<br /><span className="text-primary tracking-tighter">próximos</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-center text-foreground mb-4">
            Explora por categoría
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">Todo lo que Ocaña tiene para ofrecerte</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Music, label: 'Cultural', desc: 'Festivales, teatro, música y arte', color: 'bg-orange-50 border-orange-200 hover:bg-orange-100', iconColor: 'text-primary', emoji: '🎭' },
              { icon: Dumbbell, label: 'Deportivo', desc: 'Torneos, maratones y competencias', color: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100', iconColor: 'text-accent', emoji: '⚽' },
              { icon: Map, label: 'Turístico', desc: 'Rutas, visitas y aventura', color: 'bg-amber-50 border-amber-200 hover:bg-amber-100', iconColor: 'text-yellow-600', emoji: '🗺️' },
            ].map(({ icon: Icon, label, desc, color, iconColor, emoji }) => (
              <Link
                key={label}
                to={`/eventos?categoria=${label}`}
                className={`group flex flex-col items-center text-center p-8 rounded-3xl border-2 ${color} card-shadow card-hover-shadow transition-all hover:-translate-y-2 cursor-pointer`}
              >
                <span className="text-5xl mb-4">{emoji}</span>
                <Icon className={`w-8 h-8 mb-3 ${iconColor}`} />
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">{label}</h3>
                <p className="text-muted-foreground">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      {featured.length > 0 && (
        <section className="py-20 px-4 bg-muted/40">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                ⭐ Destacados
              </h2>
              <Link to="/eventos" className="text-primary font-semibold hover:underline">
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-foreground text-muted py-10 text-center px-4">
        <h3 className="font-display text-2xl font-bold text-primary mb-2">¿Qué hay pa' hacer?</h3>
        <p className="text-muted-foreground text-sm">© 2025 · Ocaña, Norte de Santander, Colombia 🇨🇴</p>
      </footer>
    </div>
  );
}
