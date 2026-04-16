import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleSession = async (session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        try {
          const { data } = await supabase.rpc('has_role', {
            _user_id: session.user.id,
            _role: 'admin',
          });
          setIsAdmin(!!data);
        } catch (err) {
          console.error("Error fetching role:", err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
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

  return { user, session, isAdmin, loading, signOut };
}
