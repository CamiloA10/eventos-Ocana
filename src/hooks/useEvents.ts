import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  fetchEvents, 
  fetchEventStats, 
  fetchFeaturedEvents,
  type Event, 
  type Company 
} from '@/lib/events';

export type { Event, Company };

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

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase.from('companies').select('*');
      if (error) throw error;
      return data as Company[];
    },
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (company: Partial<Company>) => {
      const { error } = await supabase.from('companies').insert(company);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['companies'] })
  });
}

export function useDeleteCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('companies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['companies'] })
  });
}
export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: fetchEventStats,
  });
}
