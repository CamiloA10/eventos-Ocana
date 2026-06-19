import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
