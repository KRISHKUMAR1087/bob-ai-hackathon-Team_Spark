-- ==============================================================================
-- PortPulse AI — Supabase Database Architecture & Row Level Security (RLS)
-- ==============================================================================

-- 1. Create Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'ship-agent')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Automatic Profile Creation Trigger on Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'admin')
    )
    ON CONFLICT (id) DO UPDATE
    SET
        name = EXCLUDED.name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if already exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Row Level Security for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current authenticated user is an Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies:
-- Users can view their own profile; Admins can view all profiles
CREATE POLICY "Users can view own profile or admin can view all"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- 4. Row Level Security for Berth Requests
ALTER TABLE IF EXISTS public."BerthRequest" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Port Admins can view and review all berth requests"
    ON public."BerthRequest"
    FOR ALL
    USING (public.is_admin());

CREATE POLICY "Ship Agents can view their own berth requests"
    ON public."BerthRequest"
    FOR SELECT
    USING ("ownerId" = auth.uid()::text);

CREATE POLICY "Ship Agents can insert their own berth requests"
    ON public."BerthRequest"
    FOR INSERT
    WITH CHECK ("ownerId" = auth.uid()::text);

CREATE POLICY "Ship Agents can update their own berth requests"
    ON public."BerthRequest"
    FOR UPDATE
    USING ("ownerId" = auth.uid()::text);

-- 5. Row Level Security for Shipping Documents
ALTER TABLE IF EXISTS public."ShippingDocument" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Port Admins can view all shipping documents"
    ON public."ShippingDocument"
    FOR ALL
    USING (public.is_admin());

CREATE POLICY "Ship Agents can view their own shipping documents"
    ON public."ShippingDocument"
    FOR SELECT
    USING ("ownerId" = auth.uid()::text);

CREATE POLICY "Ship Agents can upload their own shipping documents"
    ON public."ShippingDocument"
    FOR INSERT
    WITH CHECK ("ownerId" = auth.uid()::text);

CREATE POLICY "Ship Agents can delete their own shipping documents"
    ON public."ShippingDocument"
    FOR DELETE
    USING ("ownerId" = auth.uid()::text);

-- 6. Row Level Security for Vessels
ALTER TABLE IF EXISTS public."Vessel" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Port Admins can access all vessels"
    ON public."Vessel"
    FOR ALL
    USING (public.is_admin());

CREATE POLICY "Ship Agents can access assigned fleet vessels"
    ON public."Vessel"
    FOR SELECT
    USING ("ownerId" IS NULL OR "ownerId" = auth.uid()::text);

CREATE POLICY "Ship Agents can add vessels to their agency"
    ON public."Vessel"
    FOR INSERT
    WITH CHECK ("ownerId" = auth.uid()::text);

CREATE POLICY "Ship Agents can update their agency vessels"
    ON public."Vessel"
    FOR UPDATE
    USING ("ownerId" = auth.uid()::text);
