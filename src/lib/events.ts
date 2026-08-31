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

  if (subCategory && subCategory !== 'Todas') {
    query = query.eq('sub_category', subCategory);
  }

  if (searchTerm) {
    query = query.ilike('title', `%${searchTerm}%`);
  }

  const { data, error } = await query.order('event_date', { ascending: true });
  if (error) throw error;

  let dbEvents = (data || []).map(normalizeEvent);

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
