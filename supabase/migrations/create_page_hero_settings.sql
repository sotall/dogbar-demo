-- Create page_hero_settings table for customizable page backgrounds
CREATE TABLE IF NOT EXISTS page_hero_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT NOT NULL,
  page TEXT NOT NULL CHECK (page IN ('home', 'events', 'menu', 'parties', 'contact')),
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  media_url TEXT,
  height INTEGER DEFAULT 600 CHECK (height >= 400 AND height <= 1000),
  playback_speed DECIMAL(3,2) DEFAULT 1.0 CHECK (playback_speed >= 0.5 AND playback_speed <= 2.0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(location, page)
);

-- Enable RLS
ALTER TABLE page_hero_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can read page_hero_settings"
  ON page_hero_settings
  FOR SELECT
  TO public
  USING (true);

-- Allow admins to manage page_hero_settings
CREATE POLICY "Admins can manage page_hero_settings"
  ON page_hero_settings
  FOR ALL
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- Create index for faster lookups
CREATE INDEX idx_page_hero_settings_location_page ON page_hero_settings(location, page);

-- Add updated_at trigger
CREATE TRIGGER update_page_hero_settings_updated_at
  BEFORE UPDATE ON page_hero_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

