-- InstaMem Database Setup Script
-- Run this in your Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create tag_keys table
CREATE TABLE IF NOT EXISTS tag_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE CHECK (char_length(name) <= 21),
  description TEXT CHECK (char_length(description) <= 128),
  created_at TIMESTAMP DEFAULT now()
);

-- Create tag_values table
CREATE TABLE IF NOT EXISTS tag_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id UUID NOT NULL REFERENCES tag_keys(id) ON DELETE CASCADE,
  text TEXT NOT NULL CHECK (char_length(text) <= 42),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(tag_id, text)
);

-- Create memories table
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  content TEXT NOT NULL,
  memory_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  url TEXT
);

-- Create memory_tag junction table
CREATE TABLE IF NOT EXISTS memory_tag (
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tag_values(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (memory_id, tag_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tag_keys_name ON tag_keys(name);
CREATE INDEX IF NOT EXISTS idx_tag_values_tag_id ON tag_values(tag_id);
CREATE INDEX IF NOT EXISTS idx_tag_values_text ON tag_values(text);
CREATE INDEX IF NOT EXISTS idx_tag_values_text_trgm ON tag_values USING gin (text gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_memories_user_date ON memories(user_id, memory_date);
CREATE INDEX IF NOT EXISTS idx_memories_content_fts ON memories USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at);
CREATE INDEX IF NOT EXISTS idx_memory_tag_memory_id ON memory_tag(memory_id);
CREATE INDEX IF NOT EXISTS idx_memory_tag_tag_id ON memory_tag(tag_id);

-- Enable Row Level Security
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_tag ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_values ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for memories
CREATE POLICY "Users can read their own memories" ON memories FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own memories" ON memories FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own memories" ON memories FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own memories" ON memories FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for memory_tag
CREATE POLICY "Users can read tags on their memories" ON memory_tag FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM memories m
    WHERE m.id = memory_tag.memory_id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Users can tag their own memories" ON memory_tag FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM memories m
    WHERE m.id = memory_tag.memory_id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove tags from their memories" ON memory_tag FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM memories m
    WHERE m.id = memory_tag.memory_id
    AND m.user_id = auth.uid()
  )
);

-- Create RLS policies for tag tables (shared across users)
CREATE POLICY "Anyone can read tag keys" ON tag_keys FOR SELECT USING (true);
CREATE POLICY "Anyone can read tag values" ON tag_values FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tag keys" ON tag_keys FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can create tag values" ON tag_values FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Seed initial tag keys
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