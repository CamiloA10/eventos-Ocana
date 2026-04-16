-- Create companies table
CREATE TABLE public.companies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT companies_pkey PRIMARY KEY (id)
);

-- Note: We are adding this to the existing events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;

-- Create saved_events table for users to highlight events
CREATE TABLE public.saved_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT saved_events_pkey PRIMARY KEY (id),
  CONSTRAINT saved_events_user_id_event_id_key UNIQUE (user_id, event_id)
);

-- Trigger to automatically add a new user to the user_roles table with 'user' role
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS for companies and saved_events
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_events ENABLE ROW LEVEL SECURITY;

-- Policies for companies
CREATE POLICY "Admins can manage companies" ON public.companies
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Anyone can view companies" ON public.companies
  FOR SELECT
  USING (true);

-- Policies for saved_events
CREATE POLICY "Users can view their own saved events" ON public.saved_events
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved events" ON public.saved_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved events" ON public.saved_events
  FOR DELETE
  USING (auth.uid() = user_id);
