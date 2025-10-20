-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create vault_directories table
CREATE TABLE public.vault_directories (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.vault_directories ENABLE ROW LEVEL SECURITY;

-- Create policies for vault_directories
CREATE POLICY "Users can view their own directories"
ON public.vault_directories FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own directories"
ON public.vault_directories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own directories"
ON public.vault_directories FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own directories"
ON public.vault_directories FOR DELETE
USING (auth.uid() = user_id);

-- Create credentials table (stores encrypted credentials)
CREATE TABLE public.credentials (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  directory_id UUID NOT NULL,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  username TEXT NOT NULL,
  encrypted_password TEXT NOT NULL,
  url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_directory FOREIGN KEY (directory_id) REFERENCES public.vault_directories(id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;

-- Create policies for credentials
CREATE POLICY "Users can view their own credentials"
ON public.credentials FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own credentials"
ON public.credentials FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credentials"
ON public.credentials FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credentials"
ON public.credentials FOR DELETE
USING (auth.uid() = user_id);

-- Create activity_log table
CREATE TABLE public.activity_log (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies for activity_log
CREATE POLICY "Users can view their own activity"
ON public.activity_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity"
ON public.activity_log FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for credentials updated_at
CREATE TRIGGER update_credentials_updated_at
BEFORE UPDATE ON public.credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, phone_number)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'phone_number'
  );
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();