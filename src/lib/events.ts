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
  aliado_id: string;
  attendance_count?: { count: number }[];
  tiktok_url?: string | null;
  instagram_url?: string | null;
  whatsapp_url?: string | null;
};

export type Aliado = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  sub_category: string | null;
  created_at: string;
  owner_email?: string;
  user_id?: string;
  tiktok_url?: string | null;
  instagram_url?: string | null;
  whatsapp_url?: string | null;
};

export type EventFilters = {
  category?: string;
  subCategory?: string;
  searchTerm?: string;
};

export type EventStats = {
  events: number;
  aliados: number;
  attendance: number;
};

const SPORT_ALIASES: Record<string, string> = {
  futbol: 'Fútbol',
  'futbol sala': 'Fútbol Sala',
  futbolsala: 'Fútbol Sala',
  baloncesto: 'Baloncesto',
  voleibol: 'Voleibol',
  patinaje: 'Patinaje',
  ciclismo: 'Ciclismo',
  atletismo: 'Atletismo',
};

export function normalizeSportName(value: string | null | undefined): string {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return '';

  const normalizedKey = trimmed
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  if (SPORT_ALIASES[normalizedKey]) {
    return SPORT_ALIASES[normalizedKey];
  }

  return trimmed
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function normalizeCatalogValue(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function sportNamesMatch(left: string | null | undefined, right: string | null | undefined): boolean {
  if (!left && !right) return true;
  return normalizeCatalogValue(left) === normalizeCatalogValue(right);
}

export function dedupeSportNames(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();

  return values
    .map(value => normalizeSportName(value))
    .filter(Boolean)
    .filter(value => {
      const key = normalizeCatalogValue(value);

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.localeCompare(b));
}

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

  if (category === 'Deportivo' && sub_category) {
    sub_category = normalizeSportName(sub_category);
  }

  const attendance_count = event.saved_events || event.attendance_count;

  return {
    ...event,
    category,
    sub_category,
    attendance_count,
  };
}

/**
 * Fetches events from Supabase and merges them with static test data.
 * Handles normalization, filtering, and deduplication.
 */
export async function fetchEvents(filters: EventFilters = {}): Promise<Event[]> {
  const { category, subCategory, searchTerm } = filters;

  let query = supabase.from('events').select('*, saved_events(count)');

  if (category && category !== 'Todos') {
    if (category === 'Religioso') {
      // Support legacy categories in query
      query = query.or(`category.eq.Religioso,category.eq.Iglesia Católica,category.eq.Iglesia Evangélica`);
    } else {
      query = query.eq('category', category);
    }
  }

  if (searchTerm) {
    query = query.ilike('title', `%${searchTerm}%`);
  }

  const { data, error } = await query.order('event_date', { ascending: true });
  if (error) throw error;

  let dbEvents = (data || []).map(normalizeEvent);

  if (subCategory && subCategory !== 'Todas') {
    dbEvents = dbEvents.filter(event => {
      if (event.category === 'Deportivo' || event.category === 'Religioso') {
        return sportNamesMatch(event.sub_category, subCategory);
      }
      return true;
    });
  }

  return dbEvents.sort((a, b) => a.event_date.localeCompare(b.event_date));
}

/**
 * Fetches global event and aliado statistics.
 */
export async function fetchEventStats(): Promise<EventStats> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const pad = (n: number) => String(n).padStart(2, '0');
  const startOfMonth = `${year}-${pad(month + 1)}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endOfMonth = `${year}-${pad(month + 1)}-${pad(lastDay)}`;

  const [eventsRes, aliadosRes, attendanceRes] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }).gte('event_date', startOfMonth).lte('event_date', endOfMonth),
    supabase.from('aliados').select('*', { count: 'exact', head: true }),
    supabase.from('saved_events').select('*', { count: 'exact', head: true })
  ]);

  return {
    events: eventsRes.count ?? 0,
    aliados: aliadosRes.count ?? 0,
    attendance: attendanceRes.count ?? 0
  };
}

export async function fetchAdminStats() {
  const today = new Date().toISOString().split('T')[0];

  const [activeEventsRes, pastEventsRes, usersRes, aliadosRes, savedRes] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }).gte('event_date', today),
    supabase.from('events').select('*', { count: 'exact', head: true }).lt('event_date', today),
    supabase.from('user_roles').select('*', { count: 'exact', head: true }),
    supabase.from('aliados').select('*', { count: 'exact', head: true }),
    supabase.from('saved_events').select('*', { count: 'exact', head: true })
  ]);

  return {
    activeEvents: activeEventsRes.count ?? 0,
    pastEvents: pastEventsRes.count ?? 0,
    users: usersRes.count ?? 0,
    aliados: aliadosRes.count ?? 0,
    savedEvents: savedRes.count ?? 0
  };
}

export async function fetchFeaturedEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*, saved_events(count)')
    .eq('featured', true)
    .order('event_date', { ascending: true })
    .limit(3);

  if (error) throw error;
  return (data || []).map(normalizeEvent);
}
