-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  country TEXT DEFAULT 'Egypt',
  early_access_status TEXT DEFAULT 'pending' CHECK (early_access_status IN ('pending', 'approved', 'rejected')),
  identity_verified BOOLEAN DEFAULT false,
  wallet_created BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create early access requests table
CREATE TABLE public.early_access_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  country TEXT DEFAULT 'Egypt',
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for early access requests
ALTER TABLE public.early_access_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit early access requests
CREATE POLICY "Anyone can submit early access request" 
ON public.early_access_requests 
FOR INSERT 
WITH CHECK (true);

-- Only authenticated users can view their own requests
CREATE POLICY "Users can view their own requests" 
ON public.early_access_requests 
FOR SELECT 
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_early_access_requests_updated_at
  BEFORE UPDATE ON public.early_access_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create admin policies (for future admin panel)
CREATE POLICY "Service role can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (current_setting('role') = 'service_role');

CREATE POLICY "Service role can manage all early access requests" 
ON public.early_access_requests 
FOR ALL 
USING (current_setting('role') = 'service_role');