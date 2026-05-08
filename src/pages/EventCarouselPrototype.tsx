import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarDays, MapPin, Heart, Share2, ArrowRight, Sparkles, Layout, Box, Maximize, Clock, Bookmark } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';
import { useEventActions } from '@/hooks/useEventActions';

const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Festival de la Panela 2026',
    category: 'Cultural',
    date: '15 MAY',
    time: '2:00 PM',
    location: 'Plaza Principal de Ocaña',
    attendees: '+1.2k',
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80',
    description: 'La celebración más dulce del año regresa con artistas invitados y ferias gastronómicas.',
    price: 'Gratis',
    event_date: '2026-05-15'
  },
  {
    id: '2',
    title: 'Trail Run Los Estoraques',
    category: 'Deportivo',
    date: '20 MAY',
    time: '6:00 AM',
    location: 'Área Única Los Estoraques',
    attendees: '450 inscritos',
    image_url: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800&q=80',
    description: 'Desafía tus límites en un paisaje lunar único en el mundo. Categorías 10k y 21k.',
    price: '$45.000',
    event_date: '2026-05-20'
  }
];

// --- VARIANT 1: ULTRA GLASS ---
const GlassCard = ({ event, actions }: { event: any, actions: any }) => (
  <div className="relative group w-[340px] h-[520px] rounded-[3rem] overflow-hidden p-4 transition-all duration-700 hover:-translate-y-4">
    <img src={event.image_url} alt={event.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
    
    <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-10">
      <Badge className="bg-white/20 backdrop-blur-md border-white/30 text-white font-black uppercase tracking-widest px-4 py-1.5 rounded-xl">
        {event.category}
      </Badge>
      <Button 
        onClick={() => actions.toggleSave(event)}
        size="icon" 
        variant="ghost" 
        className={cn(
          "rounded-2xl backdrop-blur-md border border-white/20 transition-all",
          actions.isSaved(event.id) ? "bg-blue-600 text-white border-blue-500" : "bg-white/10 text-white hover:bg-white hover:text-blue-600"
        )}
      >
        <Heart className={cn("w-5 h-5", actions.isSaved(event.id) && "fill-current")} />
      </Button>
    </div>

    <div className="absolute bottom-6 left-6 right-6 z-10">
      <div className="backdrop-blur-3xl bg-white/10 border border-white/20 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 group-hover:bg-white/20 group-hover:border-white/40">
        <h3 className="text-2xl font-black text-white leading-[1.1] mb-4 uppercase tracking-tighter italic">{event.title}</h3>
        <Button 
          onClick={() => actions.shareEvent(event)}
          className="w-full h-14 bg-white text-blue-600 hover:bg-blue-50 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl transition-all group/btn"
        >
          <span>Compartir</span>
          <Share2 className="ml-2 w-4 h-4 transition-transform group-hover/btn:scale-110" />
        </Button>
      </div>
    </div>
  </div>
);

// --- VARIANT 2: EDITORIAL MAGAZINE ---
const EditorialCard = ({ event, actions }: { event: any, actions: any }) => (
  <div className="w-[500px] h-[320px] bg-white group relative rounded-[2rem] shadow-2xl overflow-hidden flex border border-slate-100 transition-all duration-500">
    <div className="w-2/5 relative overflow-hidden">
      <img src={event.image_url} alt={event.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
      <div className="absolute top-6 left-6 flex flex-col items-center">
         <span className="text-4xl font-black text-white leading-none tracking-tighter drop-shadow-lg">{event.date.split(' ')[0]}</span>
      </div>
    </div>
    
    <div className="w-3/5 p-10 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">{event.category}</span>
          <div className="flex gap-2">
            <Heart 
              onClick={() => actions.toggleSave(event)}
              className={cn(
                "w-5 h-5 cursor-pointer transition-all",
                actions.isSaved(event.id) ? "text-blue-600 fill-current" : "text-slate-300 hover:text-blue-600"
              )} 
            />
            <Share2 onClick={() => actions.shareEvent(event)} className="w-5 h-5 text-slate-300 hover:text-blue-600 cursor-pointer" />
          </div>
        </div>
        <h3 className="text-3xl font-black text-slate-900 leading-[1] mb-6 uppercase tracking-tighter italic group-hover:text-blue-600 transition-colors">
          {event.title}
        </h3>
      </div>
      <Button variant="outline" className="rounded-xl border-slate-200 font-black uppercase text-[10px] tracking-widest">
        Ver detalles
      </Button>
    </div>
  </div>
);

export default function EventCarouselPrototype() {
  const [searchParams, setSearchParams] = useSearchParams();
  const variant = searchParams.get('v') || 'glass';
  const actions = useEventActions();

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex flex-col font-jakarta">
      <Navbar />
      <main className="flex-grow pt-32 pb-44">
        <div className="px-6 max-w-7xl mx-auto mb-20">
          <h1 className="text-7xl font-black text-slate-950 tracking-tighter uppercase leading-[0.85] italic mb-4">
            Prototipo <span className="text-blue-600">Funcional</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-md">Ahora con integración real de favoritos y compartir usando el Event Action Module.</p>
        </div>

        <div className="relative">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-8 md:-ml-12 px-8 md:px-24">
              {MOCK_EVENTS.map((event) => (
                <CarouselItem key={event.id} className="pl-8 md:pl-12 basis-auto">
                  {variant === 'glass' && <GlassCard event={event} actions={actions} />}
                  {variant === 'editorial' && <EditorialCard event={event} actions={actions} />}
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:flex absolute -bottom-16 right-24 gap-4">
               <CarouselPrevious className="relative inset-auto h-14 w-14 rounded-2xl bg-white shadow-xl" />
               <CarouselNext className="relative inset-auto h-14 w-14 rounded-2xl bg-white shadow-xl" />
            </div>
          </Carousel>
        </div>

        <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
          <div className="backdrop-blur-3xl bg-slate-950/90 p-2 rounded-[2.5rem] border border-white/20 shadow-2xl flex items-center gap-2">
            <Button onClick={() => setSearchParams({ v: 'glass' })} variant={variant === 'glass' ? 'default' : 'ghost'} className="rounded-full px-8">Glass</Button>
            <Button onClick={() => setSearchParams({ v: 'editorial' })} variant={variant === 'editorial' ? 'default' : 'ghost'} className="rounded-full px-8">Editorial</Button>
          </div>
        </nav>
      </main>
    </div>
  );
}
