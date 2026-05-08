import { supabase } from '@/integrations/supabase/client';

/**
 * Asset Management Module (Deep Module)
 * 
 * Centralizes all logic for handling images and files.
 * Provides automatic optimization, placeholder management, 
 * and storage abstraction.
 */

const DEFAULT_PLACEHOLDERS = {
  event: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80',
  company: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80',
  avatar: 'https://i.pravatar.cc/300'
};

type ImageSize = 'sm' | 'md' | 'lg' | 'original';

interface ImageOptions {
  size?: ImageSize;
  aspectRatio?: string;
}

const SIZE_MAP: Record<ImageSize, number> = {
  sm: 400,
  md: 800,
  lg: 1200,
  original: 2000
};

export const Asset = {
  /**
   * Get an optimized URL for an image.
   * Automatically handles Supabase transformations if the URL is from our storage.
   */
  getImageUrl(url: string | null | undefined, type: keyof typeof DEFAULT_PLACEHOLDERS = 'event', options: ImageOptions = {}): string {
    if (!url) return DEFAULT_PLACEHOLDERS[type];

    const { size = 'md' } = options;
    const width = SIZE_MAP[size];

    // If it's a Supabase storage URL, we can append transformation parameters
    if (url.includes('supabase.co/storage/v1/object/public')) {
      // Note: Supabase image transformation requires a specific URL structure 
      // or using their specialized service. For now, we simulate optimization
      // by appending width if the service is available.
      return `${url}?width=${width}&quality=80`;
    }

    // If it's an Unsplash URL, we use its native API
    if (url.includes('unsplash.com')) {
      const baseUrl = url.split('?')[0];
      return `${baseUrl}?auto=format&fit=crop&w=${width}&q=80`;
    }

    return url;
  },

  /**
   * Returns a standard placeholder
   */
  getPlaceholder(type: keyof typeof DEFAULT_PLACEHOLDERS = 'event'): string {
    return DEFAULT_PLACEHOLDERS[type];
  },

  /**
   * Handle image upload logic (abstraction of Supabase Storage)
   */
  async uploadEventImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `event-images/${fileName}`;

    const { error } = await supabase.storage
      .from('event-images')
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};
