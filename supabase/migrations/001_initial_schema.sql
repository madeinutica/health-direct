-- Healthcare Providers Table
CREATE TABLE healthcare_providers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Hospital', 'MedicalClinic', 'MedicalCenter', 'Physician', 'MedicalLaboratory', 'HealthAndBeautyBusiness')),
    description TEXT,
    address JSONB NOT NULL, -- Can store single address object or array of addresses
    latitude DECIMAL(10,8), -- Latitude coordinate for mapping
    longitude DECIMAL(11,8), -- Longitude coordinate for mapping
    geocoding_accuracy TEXT, -- Quality of geocoding (e.g., 'rooftop', 'street', 'city', 'fallback')
    geocoded_address TEXT, -- Full address returned by geocoding service
    telephone TEXT[], -- Array to handle multiple phone numbers
    website TEXT,
    email TEXT,
    parent_organization JSONB, -- Store organization info as JSON
    medical_specialty TEXT[], -- Array of specialties
    service_type TEXT[], -- Array of services
    has_pos JSONB[], -- Point of service info
    specialty TEXT, -- For individual physicians
    rating DECIMAL(2,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    is_emergency BOOLEAN DEFAULT false,
    is_24_hours BOOLEAN DEFAULT false,
    accepts_insurance TEXT[],
    languages_spoken TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users Table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    location TEXT,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT false
);

-- Reviews Table
CREATE TABLE reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID REFERENCES healthcare_providers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    visit_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community Posts Table
CREATE TABLE community_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('question', 'recommendation', 'experience', 'general')),
    tags TEXT[],
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post Replies Table
CREATE TABLE post_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_reply_id UUID REFERENCES post_replies(id) ON DELETE CASCADE,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post Likes Table
CREATE TABLE post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Reply Likes Table
CREATE TABLE reply_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reply_id UUID REFERENCES post_replies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(reply_id, user_id)
);

-- Chat Sessions Table (for AI concierge)
CREATE TABLE chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages Table
CREATE TABLE chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_healthcare_providers_type ON healthcare_providers(type);
CREATE INDEX idx_healthcare_providers_specialty ON healthcare_providers USING gin(medical_specialty);
CREATE INDEX idx_healthcare_providers_location ON healthcare_providers USING gin(address);
CREATE INDEX idx_healthcare_providers_rating ON healthcare_providers(rating DESC);
CREATE INDEX idx_reviews_provider_id ON reviews(provider_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_community_posts_category ON community_posts(category);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX idx_post_replies_post_id ON post_replies(post_id);

-- Triggers to update review counts and ratings
CREATE OR REPLACE FUNCTION update_provider_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE healthcare_providers
    SET 
        rating = (
            SELECT AVG(rating)::DECIMAL(2,1)
            FROM reviews
            WHERE provider_id = COALESCE(NEW.provider_id, OLD.provider_id)
        ),
        review_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE provider_id = COALESCE(NEW.provider_id, OLD.provider_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.provider_id, OLD.provider_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_provider_stats
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_stats();

-- Trigger to update post reply counts
CREATE OR REPLACE FUNCTION update_post_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE community_posts
    SET 
        reply_count = (
            SELECT COUNT(*)
            FROM post_replies
            WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.post_id, OLD.post_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_reply_count
    AFTER INSERT OR DELETE ON post_replies
    FOR EACH ROW
    EXECUTE FUNCTION update_post_reply_count();

-- RLS (Row Level Security) policies
ALTER TABLE healthcare_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reply_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Public read access for healthcare providers
CREATE POLICY "Public read access for healthcare providers" ON healthcare_providers
    FOR SELECT USING (true);

-- Users can only see their own profile data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Public read access for reviews
CREATE POLICY "Public read access for reviews" ON reviews
    FOR SELECT USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews" ON reviews
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews" ON reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Public read access for community posts
CREATE POLICY "Public read access for community posts" ON community_posts
    FOR SELECT USING (true);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts" ON community_posts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own posts
CREATE POLICY "Users can update own posts" ON community_posts
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts" ON community_posts
    FOR DELETE USING (auth.uid() = user_id);

-- Public read access for post replies
CREATE POLICY "Public read access for post replies" ON post_replies
    FOR SELECT USING (true);

-- Authenticated users can create replies
CREATE POLICY "Authenticated users can create replies" ON post_replies
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own replies
CREATE POLICY "Users can update own replies" ON post_replies
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own replies
CREATE POLICY "Users can delete own replies" ON post_replies
    FOR DELETE USING (auth.uid() = user_id);

-- Users can only see their own chat sessions
CREATE POLICY "Users can view own chat sessions" ON chat_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat sessions" ON chat_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only see messages from their own chat sessions
CREATE POLICY "Users can view own chat messages" ON chat_messages
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM chat_sessions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in own sessions" ON chat_messages
    FOR INSERT WITH CHECK (
        session_id IN (
            SELECT id FROM chat_sessions WHERE user_id = auth.uid()
        )
    );