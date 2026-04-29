import { supabase } from '@/integrations/supabase/client';

/**
 * Uploads a file to a Supabase storage bucket and returns its public URL.
 * 
 * @param file The file to upload.
 * @param bucket The name of the storage bucket (defaults to 'event-images').
 * @returns The public URL of the uploaded file.
 * @throws Error if the upload fails or bucket is inaccessible.
 */
export async function uploadMedia(file: File, bucket: string = 'event-images'): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file);

  if (uploadError) {
    console.error('Storage Upload Error:', uploadError);
    throw new Error(
      `No se pudo subir la imagen al bucket "${bucket}". ` +
      `Asegúrate de que el bucket existe y tiene políticas de RLS activas. ` +
      `Detalle: ${uploadError.message}`
    );
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  
  if (!data.publicUrl) {
    throw new Error('No se pudo generar la URL pública de la imagen subida.');
  }

  return data.publicUrl;
}
