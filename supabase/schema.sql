-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_mandatory BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crew Members Table
CREATE TABLE IF NOT EXISTS crew_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  school TEXT NOT NULL,
  grade TEXT NOT NULL,
  major TEXT NOT NULL,
  path TEXT NOT NULL,
  project TEXT NOT NULL,
  gender TEXT NOT NULL,
  motivation TEXT NOT NULL,
  role TEXT DEFAULT 'participant', -- 'participant' or 'staff'
  status TEXT DEFAULT '지원완료',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guests Table
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  school TEXT,
  major TEXT,
  grade TEXT,
  path TEXT,
  project TEXT,
  gender TEXT,
  motivation TEXT,
  is_member BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event Registrations Table
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  crew_id UUID REFERENCES crew_members(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  status TEXT DEFAULT '사전신청', -- '사전신청' or '출석완료'
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  checked_in_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(event_id, COALESCE(crew_id, guest_id))
);

-- Feedbacks Table
CREATE TABLE IF NOT EXISTS feedbacks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  crew_id UUID REFERENCES crew_members(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  score_overall INTEGER CHECK (score_overall >= 1 AND score_overall <= 5),
  score_content INTEGER CHECK (score_content >= 1 AND score_content <= 5),
  score_practice INTEGER CHECK (score_practice >= 1 AND score_practice <= 5),
  score_network INTEGER CHECK (score_network >= 1 AND score_network <= 5),
  good_tags TEXT,
  good_points TEXT,
  bad_tags TEXT,
  bad_points TEXT,
  would_return BOOLEAN DEFAULT false,
  join_interest BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, COALESCE(crew_id, guest_id))
);

-- 1st Class Member Table
CREATE TABLE IF NOT EXISTS 1st_class_member (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  school TEXT NOT NULL,
  grade TEXT NOT NULL,
  major TEXT NOT NULL,
  gender TEXT,
  age TEXT,
  phone TEXT NOT NULL,
  path TEXT,
  project TEXT,
  motivation TEXT,
  history TEXT,
  is_member BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_crew_members_phone ON crew_members(phone);
CREATE INDEX IF NOT EXISTS idx_crew_members_role ON crew_members(role);
CREATE INDEX IF NOT EXISTS idx_guests_phone ON guests(phone);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_crew_id ON event_registrations(crew_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_guest_id ON event_registrations(guest_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_event_id ON feedbacks(event_id);

-- Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow anon key to insert, authenticated to read all)
-- Events
CREATE POLICY "Anyone can read events" ON events FOR SELECT USING (true);
CREATE POLICY "Service role can insert events" ON events FOR INSERT WITH CHECK (true);

-- Crew Members
CREATE POLICY "Anyone can read crew members" ON crew_members FOR SELECT USING (true);
CREATE POLICY "Anyone can insert crew members" ON crew_members FOR INSERT WITH CHECK (true);

-- Guests
CREATE POLICY "Anyone can read guests" ON guests FOR SELECT USING (true);
CREATE POLICY "Anyone can insert guests" ON guests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update guests" ON guests FOR UPDATE WITH CHECK (true);

-- Event Registrations
CREATE POLICY "Anyone can read registrations" ON event_registrations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert registrations" ON event_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update registrations" ON event_registrations FOR UPDATE WITH CHECK (true);

-- Feedbacks
CREATE POLICY "Anyone can read feedbacks" ON feedbacks FOR SELECT USING (true);
CREATE POLICY "Anyone can insert feedbacks" ON feedbacks FOR INSERT WITH CHECK (true);
