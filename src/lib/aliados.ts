import { supabase } from '@/integrations/supabase/client';
import { type Aliado } from './events';

export type AliadoFormData = {
  name: string;
  description?: string;
  category?: string;
  sub_category?: string;
  email: string;
  password?: string;
};

/**
 * Creates a new aliado and its corresponding Auth user.
 * This is a multi-step process to ensure identity and profile are linked.
 */
export async function createAliadoWithAuth(data: AliadoFormData): Promise<Aliado> {
  // 1. Create the aliado entry
  const { data: aliado, error: aliadoErr } = await supabase
    .from('aliados')
    .insert({
      name: data.name,
      description: data.description,
      category: data.category,
      sub_category: data.sub_category,
      owner_email: data.email
    })
    .select()
    .single();

  if (aliadoErr) throw aliadoErr;

  // 2. Create Auth user for the new aliado if password provided
  if (data.email && data.password) {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    // We use a temporary client without persistence for the signup
    const tempClient = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    const { data: authData, error: authErr } = await tempClient.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          aliado_id: aliado.id,
          role: 'aliado'
        }
      }
    });

    if (authErr) throw authErr;

    // 3. Link the new user_id to the aliado
    if (authData.user) {
      const { error: updateErr } = await supabase
        .from('aliados')
        .update({ user_id: authData.user.id })
        .eq('id', aliado.id);
        
      if (updateErr) throw updateErr;
    }
  }

  return aliado as Aliado;
}

/**
 * Updates an existing aliado profile.
 */
export async function updateAliadoProfile(id: string, data: Partial<AliadoFormData>): Promise<void> {
  const { error } = await supabase
    .from('aliados')
    .update({
      name: data.name,
      description: data.description,
      category: data.category,
      sub_category: data.sub_category,
      owner_email: data.email,
    })
    .eq('id', id);

  if (error) throw error;
}

/**
 * Deletes a aliado and cleans up references.
 */
export async function deleteAliadoComplete(id: string): Promise<void> {
  // 1. Unlink events (set aliado_id to null)
  const { error: eventError } = await supabase
    .from('events')
    .update({ aliado_id: null })
    .eq('aliado_id', id);

  if (eventError) throw eventError;

  // 2. Delete aliado members
  const { error: memberError } = await supabase
    .from('aliados_members')
    .delete()
    .eq('aliado_id', id);

  if (memberError) throw memberError;

  // 3. Delete the aliado entry
  const { error: deleteErr } = await supabase
    .from('aliados')
    .delete()
    .eq('id', id);

  if (deleteErr) throw deleteErr;
}
