import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type Event = Database['public']['Tables']['events']['Row'];
export type Company = Database['public']['Tables']['companies']['Row'];

export function useEvents(category?: string, search?: string) {
  return useQuery({
    queryKey: ['events', category, search],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (category && category !== 'Todos') {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Event[];
    },
  });
}

export function useFeaturedEvents() {
  return useQuery({
    queryKey: ['events', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('featured', true)
        .order('event_date', { ascending: true })
        .limit(3);
      if (error) throw error;
      return data as Event[];
    },
  });
}

export function useUpcomingCount() {
  return useQuery({
    queryKey: ['events', 'upcoming-count'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { count, error } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gte('event_date', today);
      if (error) throw error;
      return count ?? 0;
    },
  });
}

export function useSavedEvents(userId: string | undefined) {
  return useQuery({
    queryKey: ['saved_events', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_events')
        .select('event_id')
        .eq('user_id', userId!);
      if (error) throw error;
      return data.map(s => s.event_id) as string[];
    }
  });
}

export function useSaveEvent() {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, eventId, isSaved }: { userId: string, eventId: string, isSaved: boolean }) => {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_events')
          .delete()
          .eq('user_id', userId)
          .eq('event_id', eventId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('saved_events')
          .insert({ user_id: userId, event_id: eventId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved_events'] });
    }
  });
}

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Company[];
    }
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (company: { name: string; description: string }) => {
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
