import { supabase } from '@/integrations/supabase/client';

export type Event = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time?: string;
  location: string;
  image_url: string;
  category: string;
  sub_category?: string;
  featured: boolean;
  company_id: string;
  attendance_count?: { count: number }[];
};

export type EventFilters = {
  category?: string;
  subCategory?: string;
  searchTerm?: string;
};

export type EventStats = {
  events: number;
  companies: number;
  attendance: number;
};

const STATIC_RELIGIOUS_EVENTS: Event[] = [
  {
    id: 'static-1',
    title: "Misa en Honor a la Virgen de la Torcoroma",
    description: "Solemne eucaristía en el Santuario de la Aparición. Una tradición de fe que une a todos los ocañeros en honor a nuestra patrona.",
    event_date: "2026-08-16",
    location: "Santuario de la Torcoroma",
    category: "Religioso",
    sub_category: "Iglesia Católica",
    image_url: "https://laupljykvfcggawtpvnj.supabase.co/storage/v1/object/public/event-images/santuario_torcoroma.png",
    featured: true,
    company_id: ""
  },
  {
    id: 'static-2',
    title: "Procesión de Viernes Santo",
    description: "Recorrido por las principales calles del centro histórico de Ocaña. Una de las manifestaciones religiosas más antiguas y respetadas de la región.",
    event_date: "2026-04-03",
    location: "Centro Histórico",
    category: "Religioso",
    sub_category: "Iglesia Católica",
    image_url: "https://laupljykvfcggawtpvnj.supabase.co/storage/v1/object/public/event-images/procesion_semana_santa.png",
    featured: false,
    company_id: ""
  },
  {
    id: 'static-3',
    title: "Fiesta de San Jorge Patrono",
    description: "Celebración del día de San Jorge, patrono de nuestra ciudad. Misa solemne y actos culturales en la Catedral de Santa Ana.",
    event_date: "2026-04-23",
    location: "Catedral de Santa Ana",
    category: "Religioso",
    sub_category: "Iglesia Católica",
    image_url: "https://laupljykvfcggawtpvnj.supabase.co/storage/v1/object/public/event-images/misa_catedral.png",
    featured: true,
    company_id: ""
  },
  {
    id: 'static-4',
    title: "Congreso de Jóvenes: Pasión por Su Reino",
    description: "Un espacio de alabanza, adoración y formación para la juventud cristiana de la región. Conferencistas invitados y música en vivo.",
    event_date: "2026-06-15",
    location: "Auditorio Central Ocaña",
    category: "Religioso",
    sub_category: "Iglesia Evangélica",
    image_url: "https://laupljykvfcggawtpvnj.supabase.co/storage/v1/object/public/event-images/iglesia_evangelica.png",
    featured: false,
    company_id: ""
  }
];

/**
 * Normalizes event data, handling legacy categories and ensuring 
 * consistent structure.
 */
function normalizeEvent(event: any): Event {
  let category = event.category;
  let sub_category = event.sub_category;

  // Legacy category mapping
  if (category === 'Iglesia Católica') {
    category = 'Religioso';
    sub_category = 'Iglesia Católica';
  } else if (category === 'Iglesia Evangélica') {
    category = 'Religioso';
    sub_category = 'Iglesia Evangélica';
  }

  return {
    ...event,
    category,
    sub_category,
  };
}

/**
 * Fetches events from Supabase and merges them with static test data.
 * Handles normalization, filtering, and deduplication.
 */
export async function fetchEvents(filters: EventFilters = {}): Promise<Event[]> {
  const { category, subCategory, searchTerm } = filters;
  
  let query = supabase.from('events').select('*, attendance_count:saved_events(count)');
  
  if (category && category !== 'Todos') {
    if (category === 'Religioso') {
      // Support legacy categories in query
      query = query.or(`category.eq.Religioso,category.eq.Iglesia Católica,category.eq.Iglesia Evangélica`);
    } else {
      query = query.eq('category', category);
    }
  }

  if (subCategory && subCategory !== 'Todas') {
    query = query.eq('sub_category', subCategory);
  }
  
  if (searchTerm) {
    query = query.ilike('title', `%${searchTerm}%`);
  }
  
  const { data, error } = await query.order('event_date', { ascending: true });
  if (error) throw error;
  
  let dbEvents = (data || []).map(normalizeEvent);
  
  // Merge with static data if relevant
  const shouldIncludeStatic = !category || category === 'Todos' || category === 'Religioso';
  
  if (shouldIncludeStatic) {
    const uniqueStatic = STATIC_RELIGIOUS_EVENTS.filter(staticEvent => {
      // Avoid duplicates by title
      const alreadyInDb = dbEvents.some(dbEvent => 
        dbEvent.title.toLowerCase().trim() === staticEvent.title.toLowerCase().trim()
      );
      if (alreadyInDb) return false;

      // Filter static events manually
      if (!category || category === 'Todos') return true;
      if (category === 'Religioso') {
        if (!subCategory || subCategory === 'Todas') return true;
        return staticEvent.sub_category === subCategory;
      }
      return false;
    });
    
    dbEvents = [...dbEvents, ...uniqueStatic];
  }

  return dbEvents.sort((a, b) => a.event_date.localeCompare(b.event_date));
}

/**
 * Fetches global event and company statistics.
 */
export async function fetchEventStats(): Promise<EventStats> {
  const today = new Date().toISOString().split('T')[0];
  
  const [eventsRes, companiesRes, attendanceRes] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }).gte('event_date', today),
    supabase.from('companies').select('*', { count: 'exact', head: true }),
    supabase.from('saved_events').select('*', { count: 'exact', head: true })
  ]);

  return {
    events: eventsRes.count ?? 0,
    companies: companiesRes.count ?? 0,
    attendance: (attendanceRes.count ?? 0) + 150 // Including baseline for proof-of-concept
  };
}

export async function fetchFeaturedEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*, attendance_count:saved_events(count)')
    .eq('featured', true)
    .order('event_date', { ascending: true })
    .limit(3);
    
  if (error) throw error;
  return (data || []).map(normalizeEvent);
}
