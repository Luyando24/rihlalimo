'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createNewsPost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // Ensure user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Forbidden' }
  }

  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const excerpt = formData.get('excerpt') as string
  const content = formData.get('content') as string
  const image_url = formData.get('image_url') as string
  const published_at = formData.get('published_at') as string || new Date().toISOString()

  if (!title || !slug || !content) {
    return { success: false, error: 'Title, slug, and content are required' }
  }

  const { data, error } = await supabase
    .from('news_posts')
    .insert({
      title,
      slug,
      excerpt,
      content,
      image_url,
      published_at,
      author_id: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating news post:', error)
    // Handle unique constraint violation on slug
    if (error.code === '23505') {
      return { success: false, error: 'Slug already exists. Please choose another.' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/newsroom')
  revalidatePath('/admin')
  return { success: true, post: data }
}

export async function deleteNewsPost(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { success: false, error: 'Forbidden' }

  const { error } = await supabase
    .from('news_posts')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting news post:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/newsroom')
  revalidatePath('/admin')
  return { success: true }
}

export async function updateNewsPost(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { success: false, error: 'Forbidden' }

  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const excerpt = formData.get('excerpt') as string
  const content = formData.get('content') as string
  const image_url = formData.get('image_url') as string
  const published_at = formData.get('published_at') as string || new Date().toISOString()

  if (!title || !slug || !content) {
    return { success: false, error: 'Title, slug, and content are required' }
  }

  const { data, error } = await supabase
    .from('news_posts')
    .update({
      title,
      slug,
      excerpt,
      content,
      image_url,
      published_at
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating news post:', error)
    if (error.code === '23505') {
      return { success: false, error: 'Slug already exists. Please choose another.' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/newsroom')
  revalidatePath('/admin')
  return { success: true, post: data }
}
