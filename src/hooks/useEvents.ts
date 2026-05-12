import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  fetchEvents, 
  fetchEventStats, 
  fetchFeaturedEvents,
  type Event, 
  type Aliado 
} from '@/lib/events';

export type { Event, Aliado };

export function useEvents(category?: string, searchTerm?: string, subCategory?: string) {
  return useQuery({
    queryKey: ['events', category, searchTerm, subCategory],
    queryFn: () => fetchEvents({ category, subCategory, searchTerm }),
  });
}

export function useUpcomingCount() {
  return useQuery({
    queryKey: ['upcoming-count'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { count, error } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gte('event_date', today);
      if (error) throw error;
      return count || 0;
    },
  });
}

export function useFeaturedEvents() {
  return useQuery({
    queryKey: ['featured-events'],
    queryFn: fetchFeaturedEvents,
  });
}

export function useSavedEvents(userId?: string) {
  return useQuery({
    queryKey: ['saved-events', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('saved_events')
        .select('event_id')
        .eq('user_id', userId);
      if (error) throw error;
      return data.map(s => s.event_id);
    },
    enabled: !!userId,
  });
}

export function useSaveEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, userId, isSaved }: { eventId: string; userId: string; isSaved: boolean }) => {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_events')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('saved_events')
          .insert({ event_id: eventId, user_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['saved-events', variables.userId] });
      qc.invalidateQueries({ queryKey: ['events'] });
      qc.invalidateQueries({ queryKey: ['featured-events'] });
    },
  });
}

export function useAliados() {
  return useQuery({
    queryKey: ['aliados'],
    queryFn: async () => {
      const { data, error } = await supabase.from('aliados').select('*');
      if (error) throw error;
      return data as Aliado[];
    },
  });
}

export function useCreateAliado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (aliado: Partial<Aliado>) => {
      const { error } = await supabase.from('aliados').insert(aliado);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['aliados'] })
  });
}

export function useDeleteAliado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('aliados').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['aliados'] })
  });
}
export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: fetchEventStats,
  });
}
