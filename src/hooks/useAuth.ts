import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAliado, setIsAliado] = useState(false);
  const [userAliadoId, setUserAliadoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleSession = async (session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        try {
          // 1. Check for admin role
          const { data: roleData } = await supabase.rpc('has_role', {
            _user_id: session.user.id,
            _role: 'admin',
          });
          setIsAdmin(!!roleData);

          // 2. Check for aliado association - query the table directly for robustness
          const { data: aliadoData, error: aliadoError } = await supabase
            .from('aliados')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (aliadoData) {
            setIsAliado(true);
            setUserAliadoId(aliadoData.id);
          } else {
            // Fallback to metadata for backward compatibility during transition
            const metadataId = session.user.user_metadata?.aliado_id;
            if (metadataId) {
              setIsAliado(true);
              setUserAliadoId(metadataId);
            } else {
              setIsAliado(false);
              setUserAliadoId(null);
            }
          }
        } catch (err) {
          console.error("Error fetching role:", err);
          setIsAdmin(false);
          setIsAliado(false);
        }
      } else {
        setIsAdmin(false);
        setIsAliado(false);
        setUserAliadoId(null);
      }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        handleSession(session);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = () => supabase.auth.signOut();

  return { user, session, isAdmin, isAliado, userAliadoId, loading, signOut };
}
