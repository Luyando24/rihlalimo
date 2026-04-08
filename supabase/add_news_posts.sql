-- Create news_posts table
CREATE TABLE public.news_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;

-- Public can read all news posts
CREATE POLICY "Public can view news posts" 
    ON public.news_posts 
    FOR SELECT 
    USING (true);

-- Only admins can insert/update/delete news posts
CREATE POLICY "Admins can manage news posts" 
    ON public.news_posts 
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
