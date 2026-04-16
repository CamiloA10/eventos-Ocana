import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCompany, setIsCompany] = useState(false);
  const [userCompanyId, setUserCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleSession = async (session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        try {
          // Check for admin role
          const { data: roleData } = await supabase.rpc('has_role', {
            _user_id: session.user.id,
            _role: 'admin',
          });
          setIsAdmin(!!roleData);

          // Check for company association in metadata or a specific claim
          const companyId = session.user.user_metadata?.company_id;
          if (companyId) {
            setIsCompany(true);
            setUserCompanyId(companyId);
          } else {
            setIsCompany(false);
            setUserCompanyId(null);
          }
        } catch (err) {
          console.error("Error fetching role:", err);
          setIsAdmin(false);
          setIsCompany(false);
        }
      } else {
        setIsAdmin(false);
        setIsCompany(false);
        setUserCompanyId(null);
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

  return { user, session, isAdmin, isCompany, userCompanyId, loading, signOut };
}
