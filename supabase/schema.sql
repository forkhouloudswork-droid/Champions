-- 1. Profiles Table (Extends Supabase auth.users)
CREATE TABLE public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  points numeric(10,2) default 0,
  golden_balls_count integer default 5,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING ( auth.uid() = id );

-- 2. Matches Table (Stores API Data locally)
CREATE TABLE public.matches (
  id text primary key, -- Match ID from the public API
  home_team text not null,
  away_team text not null,
  home_team_code text not null, -- Two-letter country code for flagcdn (e.g., 'ua')
  away_team_code text not null,
  start_time timestamp with time zone not null,
  home_score integer,
  away_score integer,
  status text not null default 'upcoming' -- 'upcoming', 'in_progress', 'finished'
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Matches are viewable by everyone."
  ON matches FOR SELECT
  USING ( true );

-- 3. Predictions Table
CREATE TABLE public.predictions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  match_id text references public.matches(id) not null,
  home_score integer not null,
  away_score integer not null,
  modifications integer default 0, -- Tracks number of times updated to calculate penalty
  used_golden_ball boolean default false,
  points_awarded numeric(10,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, match_id) -- One prediction per match per user
);

ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all predictions."
  ON predictions FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own predictions."
  ON predictions FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update their own predictions."
  ON predictions FOR UPDATE
  USING ( auth.uid() = user_id );

-- 4. Triggers and Functions

-- Function to handle auth user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger to update updated_at on predictions
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_predictions_modtime
BEFORE UPDATE ON predictions
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
