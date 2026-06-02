import { useAuth } from './useAuth';
import { useSaveEvent, useSavedEvents } from './useEvents';
import { useToast } from './use-toast';
import { type Event } from '@/lib/events';

/**
 * Event Action Module (Deep Module)
 * 
 * Provides a high-leverage interface for interacting with events.
 * Handles auth checks, data persistence, and UI feedback (toasts).
 */
export function useEventActions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const saveMutation = useSaveEvent();
  const { data: savedEvents = [] } = useSavedEvents(user?.id);

  const isSaved = (eventId: string) => savedEvents.includes(eventId);

  const toggleSave = async (event: Event) => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes estar conectado para guardar eventos en tus favoritos.",
        variant: "destructive",
      });
      return;
    }

    const currentlySaved = isSaved(event.id);

    try {
      await saveMutation.mutateAsync({
        eventId: event.id,
        userId: user.id,
        isSaved: currentlySaved,
      });

      toast({
        title: currentlySaved ? "Eliminado de favoritos" : "Guardado en favoritos",
        description: currentlySaved 
          ? `"${event.title}" ya no está en tu lista.` 
          : `"${event.title}" se ha guardado correctamente.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar tu lista de favoritos. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const shareEvent = async (event: Event) => {
    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, ''); // Remove trailing slash if any
    const shareData = {
      title: event.title,
      text: event.description,
      url: `${window.location.origin}${baseUrl}/eventos?id=${event.id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "¡Enlace copiado!",
          description: "El enlace al evento se ha copiado al portapapeles.",
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toast({
          title: "Error al compartir",
          description: "No se pudo completar la acción de compartir.",
          variant: "destructive",
        });
      }
    }
  };

  return {
    toggleSave,
    shareEvent,
    isSaved,
    isPending: saveMutation.isPending,
  };
}
