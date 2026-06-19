import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useEventAttendance(eventId: string, userId?: string) {
    return useQuery({
        queryKey: ['attendance', eventId, userId],
        queryFn: async () => {
            let isAttending = false;
            let count = 0;

            try {
                // Obtenemos el conteo total
                const { count: totalCount, error: countError } = await supabase
                    .from('event_attendances')
                    .select('*', { count: 'exact', head: true })
                    .eq('event_id', eventId);

                if (!countError) {
                    count = totalCount || 0;
                }

                // Vemos si el usuario actual asiste
                if (userId) {
                    const { data, error } = await supabase
                        .from('event_attendances')
                        .select('id')
                        .eq('event_id', eventId)
                        .eq('user_id', userId)
                        .maybeSingle();

                    if (!error && data) {
                        isAttending = true;
                    }
                }
            } catch (e) {
                // Falla silenciosa si la tabla aún no existe
                console.warn('La tabla event_attendances no existe aún.');
            }

            return { count, isAttending };
        },
        // No hacer refetch tan seguido para evitar spam de errores si no existe la tabla
        staleTime: 1000 * 60,
    });
}

export function useToggleAttendance() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async ({ eventId, userId, isAttending }: { eventId: string; userId: string; isAttending: boolean }) => {
            if (isAttending) {
                const { error } = await supabase
                    .from('event_attendances')
                    .delete()
                    .eq('event_id', eventId)
                    .eq('user_id', userId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('event_attendances')
                    .insert({ event_id: eventId, user_id: userId });
                if (error) throw error;
            }
        },
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: ['attendance', variables.eventId] });
        },
    });
}
