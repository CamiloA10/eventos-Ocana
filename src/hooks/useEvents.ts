import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type Event = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  image_url: string;
  category: string;
  featured: boolean;
  company_id: string;
  attendance_count?: { count: number }[];
};

export type Company = {
  id: string;
  name: string;
  logo_url: string;
  category: string;
};

export function useEvents(category?: string, searchTerm?: string) {
  return useQuery({
    queryKey: ['events', category, searchTerm],
    queryFn: async () => {
      let query = supabase.from('events').select('*, attendance_count:saved_events(count)');
      
      if (category && category !== 'Todos') {
        query = query.eq('category', category);
      }
      
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }
      
      const { data, error } = await query.order('event_date', { ascending: true });
      if (error) throw error;
      return data as Event[];
    },
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
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*, attendance_count:saved_events(count)')
        .eq('featured', true)
        .order('event_date', { ascending: true })
        .limit(3);
      if (error) throw error;
      return data as Event[];
    },
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
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gte('event_date', today);

      const { count: companiesCount } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });

      const { count: attendanceCount } = await supabase
        .from('saved_events')
        .select('*', { count: 'exact', head: true });

      return {
        events: eventsCount ?? 0,
        companies: companiesCount ?? 0,
        attendance: (attendanceCount ?? 0) + 150
      };
    },
  });
}
