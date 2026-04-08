import { createClient } from '@/utils/supabase/server'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { LucideArrowLeft } from 'lucide-react'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('news_posts')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .single()

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const description = post.excerpt || post.content.substring(0, 160) + '...'
  const url = `/newsroom/${post.slug}`

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      url,
      type: 'article',
      publishedTime: post.published_at,
      images: post.image_url ? [{ url: post.image_url }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.image_url ? [post.image_url] : undefined,
    }
  }
}

export default async function NewsPostPage({ params }: Props) {
  const resolvedParams = await params
  const supabase = await createClient()
  
  const { data: userResponse } = await supabase.auth.getUser()
  const user = userResponse?.user

  let role = null
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    role = profile?.role
  }

  const { data: post } = await supabase
    .from('news_posts')
    .select('*, profiles(full_name)')
    .eq('slug', resolvedParams.slug)
    .single()

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar user={user} role={role} />
      
      <main className="pt-32 pb-24 px-6 lg:px-16 container mx-auto max-w-4xl">
        <Link href="/newsroom" className="inline-flex items-center text-gray-500 hover:text-black transition-colors mb-8 text-sm font-medium">
          <LucideArrowLeft size={16} className="mr-2" /> Back to News
        </Link>
        
        <article>
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
              {post.title}
            </h1>
            <div className="flex items-center text-gray-500 space-x-4 text-sm font-medium">
              <time dateTime={post.published_at}>
                {new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
              {post.profiles?.full_name && (
                <>
                  <span>&bull;</span>
                  <span>By {post.profiles.full_name}</span>
                </>
              )}
            </div>
          </header>

          {post.image_url && (
            <div className="mb-12 rounded-2xl overflow-hidden bg-gray-100 aspect-video relative">
              <img 
                src={post.image_url} 
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}

          <div 
            className="prose prose-lg max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>

      <Footer />
    </div>
  )
}
