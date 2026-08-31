import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { type Event } from '@/hooks/useEvents';

export function useEventRating(eventId: string, userId?: string) {
    return useQuery({
        queryKey: ['ratings', eventId, userId],
        queryFn: async () => {
            let userRating = 0;
            let averageRating = 0;
            let totalRatings = 0;

            try {
                // Obtenemos todas las calificaciones del evento
                const { data: allRatings, error: err } = await supabase
                    .from('event_ratings')
                    .select('rating')
                    .eq('event_id', eventId);

                if (!err && allRatings) {
                    totalRatings = allRatings.length;
                    if (totalRatings > 0) {
                        const sum = allRatings.reduce((acc, curr) => acc + curr.rating, 0);
                        averageRating = sum / totalRatings;
                    }
                }

                // Si hay usuario logueado, vemos si ya votó
                if (userId) {
                    const { data: userData, error: userErr } = await supabase
                        .from('event_ratings')
                        .select('rating')
                        .eq('event_id', eventId)
                        .eq('user_id', userId)
                        .maybeSingle();

                    if (!userErr && userData) {
                        userRating = userData.rating;
                    }
                }
            } catch (e) {
                console.warn('La tabla event_ratings no existe aún.');
            }

            return { userRating, averageRating, totalRatings };
        },
        staleTime: 1000 * 60,
    });
}

export function useSubmitRating() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async ({ eventId, userId, rating, isUpdating }: { eventId: string; userId: string; rating: number; isUpdating: boolean }) => {
            if (isUpdating) {
                const { error } = await supabase
                    .from('event_ratings')
                    .update({ rating })
                    .eq('event_id', eventId)
                    .eq('user_id', userId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('event_ratings')
                    .insert({ event_id: eventId, user_id: userId, rating });
                if (error) throw error;
            }
        },
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: ['ratings', variables.eventId] });
        },
    });
}

export function useTopRatedEvents(aliadoId?: string) {
    return useQuery({
        queryKey: ['top-rated-events', aliadoId],
        queryFn: async () => {
            try {
                // Get all ratings first to calculate average per event
                const { data: allRatings, error: err } = await supabase
                    .from('event_ratings')
                    .select('event_id, rating');

                if (err || !allRatings || allRatings.length === 0) return [];

                // Group by event
                const eventMap = new Map<string, { total: number, count: number }>();
                for (const r of allRatings) {
                    if (!r.event_id) continue;
                    const stats = eventMap.get(r.event_id) || { total: 0, count: 0 };
                    stats.total += r.rating;
                    stats.count += 1;
                    eventMap.set(r.event_id, stats);
                }

                const averages = Array.from(eventMap.entries()).map(([event_id, stats]) => ({
                    event_id,
                    avg: stats.total / stats.count,
                    count: stats.count
                }));

                // Sort by average desc, minimum 1 rating
                averages.sort((a, b) => b.avg - a.avg);
                const top5 = averages.slice(0, 5);

                if (top5.length === 0) return [];

                const eventIds = averages.map(a => a.event_id);

                // Fetch details for these events
                let query = supabase.from('events').select('*').in('id', eventIds);
                if (aliadoId) {
                    query = query.eq('aliado_id', aliadoId);
                }

                const { data: eventsData, error: eventsErr } = await query;

                if (eventsErr || !eventsData) return [];

                // Filter averages to only those matching our fetched events
                const validEventIds = new Set(eventsData.map((e: any) => e.id));
                const validAverages = averages.filter(a => validEventIds.has(a.event_id));

                // Sort by average desc and take top 5
                validAverages.sort((a, b) => b.avg - a.avg);
                const finalTop5 = validAverages.slice(0, 5);

                if (finalTop5.length === 0) return [];

                // Map matching our top5 array
                const result = finalTop5.map(t => {
                    const evt = eventsData.find((e: any) => e.id === t.event_id);
                    return {
                        ...evt,
                        averageRating: t.avg,
                        totalRatings: t.count
                    };
                }).filter(e => e.id); // removes undefined if event was deleted but rating exists

                return result;
            } catch (e) {
                console.warn('La tabla event_ratings no existe aún o hay un error.');
                return [];
            }
        },
        staleTime: 1000 * 60,
    });
}
