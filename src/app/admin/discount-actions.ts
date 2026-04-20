'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createDiscount(data: {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    max_uses?: number | null;
    expires_at?: string | null;
    is_active?: boolean;
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') return { error: 'Unauthorized' }

    const supabaseAdmin = createAdminClient()
    const { data: result, error } = await supabaseAdmin
        .from('discounts')
        .insert([{
            code: data.code.toUpperCase(),
            type: data.type,
            value: data.value,
            max_uses: data.max_uses,
            expires_at: data.expires_at,
            is_active: data.is_active ?? true
        }])
        .select()
        .single()

    if (error) return { error: error.message }

    revalidatePath('/admin')
    return { success: true, discount: result }
}

export async function updateDiscount(id: string, data: Partial<{
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    max_uses: number | null;
    expires_at: string | null;
    is_active: boolean;
}>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') return { error: 'Unauthorized' }

    const supabaseAdmin = createAdminClient()
    const { data: result, error } = await supabaseAdmin
        .from('discounts')
        .update({
            ...data,
            code: data.code?.toUpperCase()
        })
        .eq('id', id)
        .select()
        .single()

    if (error) return { error: error.message }

    revalidatePath('/admin')
    return { success: true, discount: result }
}

export async function deleteDiscount(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') return { error: 'Unauthorized' }

    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin
        .from('discounts')
        .delete()
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin')
    return { success: true }
}

export async function validateDiscountCode(code: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single()

    if (error || !data) {
        return { error: 'Invalid or inactive discount code' }
    }

    // Check expiration
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return { error: 'This discount code has expired' }
    }

    // Check max uses
    if (data.max_uses !== null && data.current_uses >= data.max_uses) {
        return { error: 'This discount code has reached its maximum uses' }
    }

    return { success: true, discount: data }
}
