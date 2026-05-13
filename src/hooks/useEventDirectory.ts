import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  fetchEvents, 
  type Event, 
  type EventFilters 
} from '@/lib/events';

/**
 * Event Directory Module (Deep Module)
 */
export function useEventDirectory(filters: EventFilters & { userId?: string, showFavorites?: boolean } = {}) {
  const { category, subCategory, searchTerm, userId, showFavorites } = filters;

  return useQuery({
    queryKey: ['events-directory', category, subCategory, searchTerm, userId, showFavorites],
    queryFn: async () => {
      // Fetch base events
      let events = await fetchEvents({ category, subCategory, searchTerm });

      // Filter out past events for public view
      const today = new Date().toISOString().split('T')[0];
      events = events.filter(e => e.event_date >= today);

      // If showFavorites is enabled, we filter by saved events
      if (showFavorites && userId) {
        const { data: saved, error } = await supabase
          .from('saved_events')
          .select('event_id')
          .eq('user_id', userId);
        
        if (error) throw error;
        const savedIds = saved.map(s => s.event_id);
        events = events.filter(e => savedIds.includes(e.id));
      }
      
      return events;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useFeaturedEvents() {
  return useQuery({
    queryKey: ['events-directory', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*, attendance_count:saved_events(count)')
        .eq('featured', true)
        .order('event_date', { ascending: true })
        .limit(3);
        
      if (error) throw error;
      return data || [];
    },
  });
}
