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

-- Mirror Supabase Auth users into the legacy public."User" table used by
-- operational foreign keys such as "Vessel"."ownerId".
CREATE TABLE IF NOT EXISTS public."User" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT,
    "photoUrl" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "authProvider" TEXT NOT NULL DEFAULT 'email',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
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

    INSERT INTO public."User" ("id", "name", "email", "photoUrl", "role", "authProvider")
    VALUES (
        NEW.id::text,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'admin'),
        COALESCE(NEW.raw_app_meta_data->>'provider', 'email')
    )
    ON CONFLICT ("id") DO UPDATE
    SET
        "name" = EXCLUDED."name",
        "email" = EXCLUDED."email",
        "photoUrl" = EXCLUDED."photoUrl",
        "role" = EXCLUDED."role",
        "authProvider" = EXCLUDED."authProvider";

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

ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own user row or admin can view all" ON public."User";
DROP POLICY IF EXISTS "Users can update own user row" ON public."User";
DROP POLICY IF EXISTS "Users can insert own user row" ON public."User";

CREATE POLICY "Users can view own user row or admin can view all"
    ON public."User"
    FOR SELECT
    USING ("id" = auth.uid()::text OR public.is_admin());

CREATE POLICY "Users can update own user row"
    ON public."User"
    FOR UPDATE
    USING ("id" = auth.uid()::text);

CREATE POLICY "Users can insert own user row"
    ON public."User"
    FOR INSERT
    WITH CHECK ("id" = auth.uid()::text);

-- Backfill mirrored rows for existing auth users before the trigger existed.
INSERT INTO public."User" ("id", "name", "email", "photoUrl", "role", "authProvider", "createdAt")
SELECT
    au.id::text,
    COALESCE(au.raw_user_meta_data->>'name', au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    au.email,
    COALESCE(au.raw_user_meta_data->>'avatar_url', au.raw_user_meta_data->>'picture'),
    COALESCE(au.raw_user_meta_data->>'role', p.role, 'admin'),
    COALESCE(au.raw_app_meta_data->>'provider', 'email'),
    au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
ON CONFLICT ("id") DO UPDATE
SET
    "name" = EXCLUDED."name",
    "email" = EXCLUDED."email",
    "photoUrl" = EXCLUDED."photoUrl",
    "role" = EXCLUDED."role",
    "authProvider" = EXCLUDED."authProvider";

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

-- 7. Supabase Storage Buckets & Policies for Vessel Documents
-- Ensure storage extension and schema are ready
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage policies if re-running
DROP POLICY IF EXISTS "Authenticated users can upload vessel documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view vessel documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;

-- Allow authenticated users (Ship Agents and Admins) to upload files into documents/uploads
CREATE POLICY "Authenticated users can upload vessel documents"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id IN ('documents', 'uploads'));

-- Allow authenticated users to view/download vessel documents
CREATE POLICY "Users can view vessel documents"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id IN ('documents', 'uploads'));

-- Allow document owners to delete their files
CREATE POLICY "Users can delete own documents"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id IN ('documents', 'uploads') AND auth.uid()::text = (storage.foldername(name))[1]);

-- 8. Persistent Notification Read State
CREATE TABLE IF NOT EXISTS public."NotificationRead" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "readAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "NotificationRead_user_notification_key" UNIQUE ("userId", "notificationId")
);

ALTER TABLE public."NotificationRead" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notification reads" ON public."NotificationRead";
DROP POLICY IF EXISTS "Users can insert own notification reads" ON public."NotificationRead";
DROP POLICY IF EXISTS "Users can delete own notification reads" ON public."NotificationRead";

-- Users can only view their own read markers (Admins can view all)
CREATE POLICY "Users can view own notification reads"
    ON public."NotificationRead"
    FOR SELECT
    USING ("userId" = auth.uid()::text OR public.is_admin());

-- Users can mark notifications as read for themselves
CREATE POLICY "Users can insert own notification reads"
    ON public."NotificationRead"
    FOR INSERT
    WITH CHECK ("userId" = auth.uid()::text);

-- Users can unmark / toggle notifications as unread
CREATE POLICY "Users can delete own notification reads"
    ON public."NotificationRead"
    FOR DELETE
    USING ("userId" = auth.uid()::text);

