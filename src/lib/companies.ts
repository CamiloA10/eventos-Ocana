import { supabase } from '@/integrations/supabase/client';
import { type Company } from './events';

export type CompanyFormData = {
  name: string;
  description?: string;
  email: string;
  password?: string;
};

/**
 * Creates a new company and its corresponding Auth user.
 * This is a multi-step process to ensure identity and profile are linked.
 */
export async function createCompanyWithAuth(data: CompanyFormData): Promise<Company> {
  // 1. Create the company entry
  const { data: company, error: companyErr } = await supabase
    .from('companies')
    .insert({
      name: data.name,
      description: data.description,
      owner_email: data.email
    })
    .select()
    .single();

  if (companyErr) throw companyErr;

  // 2. Create Auth user for the new company if password provided
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
          company_id: company.id,
          role: 'company'
        }
      }
    });

    if (authErr) throw authErr;

    // 3. Link the new user_id to the company
    if (authData.user) {
      const { error: updateErr } = await supabase
        .from('companies')
        .update({ user_id: authData.user.id })
        .eq('id', company.id);
        
      if (updateErr) throw updateErr;
    }
  }

  return company as Company;
}

/**
 * Updates an existing company profile.
 */
export async function updateCompanyProfile(id: string, data: Partial<CompanyFormData>): Promise<void> {
  const { error } = await supabase
    .from('companies')
    .update({
      name: data.name,
      description: data.description,
      owner_email: data.email,
    })
    .eq('id', id);

  if (error) throw error;
}

/**
 * Deletes a company and cleans up references.
 */
export async function deleteCompanyComplete(id: string): Promise<void> {
  // 1. Unlink events (set company_id to null)
  const { error: eventError } = await supabase
    .from('events')
    .update({ company_id: null })
    .eq('company_id', id);

  if (eventError) throw eventError;

  // 2. Delete company members
  const { error: memberError } = await supabase
    .from('company_members')
    .delete()
    .eq('company_id', id);

  if (memberError) throw memberError;

  // 3. Delete the company entry
  const { error: deleteErr } = await supabase
    .from('companies')
    .delete()
    .eq('id', id);

  if (deleteErr) throw deleteErr;
}
