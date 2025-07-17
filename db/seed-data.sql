-- Seed initial data for InstaMem database
-- This file contains the initial tag keys and any startup data

-- Insert initial tag keys
INSERT INTO tag_keys (name, description) VALUES
  ('person', 'People mentioned in memories'),
  ('place', 'Locations and places'),
  ('event', 'Events and occasions'),
  ('project', 'Work projects and tasks'),
  ('feeling', 'Emotions and feelings'),
  ('topic', 'Topics and subjects'),
  ('company', 'Companies and organizations'),
  ('skill', 'Skills and abilities')
ON CONFLICT (name) DO NOTHING;

-- Show what was inserted
SELECT 'Seeded tag keys:' as status;
SELECT name, description FROM tag_keys ORDER BY name;