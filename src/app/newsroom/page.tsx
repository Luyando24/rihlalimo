import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/utils/supabase/server'
import { Metadata } from 'next'

import Link from 'next/link'

export const metadata: Metadata = {
  title: 'News',
  description: 'Stay updated with the latest news, announcements, and press releases from Rihla Limo.',
  openGraph: {
    url: '/newsroom',
  },
}

export default async function NewsPage() {
  const supabase = await createClient()
  const { data: userResponse } = await supabase.auth.getUser()
  const user = userResponse?.user

  let role = null
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    role = profile?.role
  }

  // Fetch published news posts
  const { data: posts } = await supabase
    .from('news_posts')
    .select('*')
    .order('published_at', { ascending: false })

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar user={user} role={role} />
      
      <div className="pt-32 pb-20 px-6 lg:px-16 container mx-auto">
         <h1 className="text-4xl md:text-5xl font-bold mb-8">News</h1>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
             <div>
                 <p className="text-xl leading-relaxed text-gray-700 mb-6">
                    Stay updated with the latest news, announcements, and developments from Rihla Limo.
                 </p>
                 <p className="text-gray-600 leading-relaxed mb-6">
                    From new service launches to industry insights, our news section keeps you informed about our journey in redefining luxury transportation.
                 </p>
             </div>
             <div className="bg-gray-100 rounded-2xl h-[400px] flex items-center justify-center">
                 <span className="text-gray-400">News Image</span>
             </div>
         </div>

         <div className="mt-24">
            <h2 className="text-3xl font-bold mb-12 text-center">Latest Updates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts && posts.length > 0 ? (
                    posts.map((post: any) => (
                        <Link href={`/newsroom/${post.slug}`} key={post.id} className="block group">
                            <div className="p-8 bg-gray-50 rounded-xl h-full border border-transparent group-hover:border-gray-200 transition-all group-hover:shadow-sm">
                                {post.image_url && (
                                    <div className="mb-6 rounded-lg overflow-hidden h-40 bg-gray-200">
                                        <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    </div>
                                )}
                                <div className="text-sm text-gray-500 mb-2">
                                    {new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                                <h3 className="text-xl font-bold mb-4 group-hover:text-gray-600 transition-colors">{post.title}</h3>
                                <p className="text-gray-600 line-clamp-3">
                                    {post.excerpt || post.content.substring(0, 150) + '...'}
                                </p>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-500 py-12">
                        No news articles published yet. Check back soon!
                    </div>
                )}
            </div>
         </div>
      </div>
      <Footer />
    </div>
  )
}