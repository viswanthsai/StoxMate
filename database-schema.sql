-- Users Profile Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    date_of_birth DATE,
    phone_number TEXT,
    pan_number TEXT,
    address TEXT,
    risk_profile TEXT DEFAULT 'moderate',
    monthly_investment NUMERIC(15, 2),
    investment_horizon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Investment Goals
CREATE TABLE IF NOT EXISTS investment_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Investment Assets
CREATE TABLE IF NOT EXISTS user_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL, -- 'stock', 'gold', 'fd', 'real_estate', 'bond'
    asset_name TEXT NOT NULL,
    provider TEXT,
    purchase_value NUMERIC(15, 2),
    current_value NUMERIC(15, 2),
    purchase_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market Data
CREATE TABLE IF NOT EXISTS market_data (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    nifty_value NUMERIC(10, 2),
    sensex_value NUMERIC(10, 2),
    bank_nifty_value NUMERIC(10, 2),
    gold_value NUMERIC(10, 2),
    nifty_pe_ratio NUMERIC(6, 2),
    market_mood TEXT, -- 'bearish', 'neutral', 'bullish'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Notifications Settings
CREATE TABLE IF NOT EXISTS notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    whatsapp_enabled BOOLEAN DEFAULT FALSE,
    portfolio_updates BOOLEAN DEFAULT TRUE,
    market_alerts BOOLEAN DEFAULT TRUE,
    investment_recommendations BOOLEAN DEFAULT TRUE,
    educational_content BOOLEAN DEFAULT FALSE,
    account_activity BOOLEAN DEFAULT TRUE,
    frequency TEXT DEFAULT 'daily', -- 'realtime', 'daily', 'weekly'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS (Row Level Security) Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view their own profile" 
ON user_profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = id);

-- Similar policies for other tables
-- ...

-- Function to automatically create a profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
