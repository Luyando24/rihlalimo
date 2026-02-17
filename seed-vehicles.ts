
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
  console.log('Seeding vehicle types...')

  const vehicleTypes = [
    {
      name: 'Business Class',
      description: 'Mercedes-Benz E-Class, BMW 5 Series, or similar',
      capacity_passengers: 3,
      capacity_luggage: 2,
      image_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=2070',
      base_fare_usd: 45.00,
      price_per_distance_usd: 3.00,
      distance_unit: 'mile',
      price_per_hour_usd: 85.00,
      min_hours_booking: 2
    },
    {
      name: 'First Class',
      description: 'Mercedes-Benz S-Class, BMW 7 Series, or similar',
      capacity_passengers: 3,
      capacity_luggage: 2,
      image_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=2070',
      base_fare_usd: 75.00,
      price_per_distance_usd: 4.50,
      distance_unit: 'mile',
      price_per_hour_usd: 120.00,
      min_hours_booking: 3
    },
    {
      name: 'Business Van',
      description: 'Mercedes-Benz V-Class, Chevrolet Suburban, or similar',
      capacity_passengers: 6,
      capacity_luggage: 6,
      image_url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=2069',
      base_fare_usd: 65.00,
      price_per_distance_usd: 4.00,
      distance_unit: 'mile',
      price_per_hour_usd: 100.00,
      min_hours_booking: 3
    }
  ]

  for (const vt of vehicleTypes) {
    // Check if exists
    const { data: existing } = await supabase
      .from('vehicle_types')
      .select('id')
      .eq('name', vt.name)
      .single()

    if (!existing) {
      const { error } = await supabase.from('vehicle_types').insert(vt)
      if (error) {
        if (error.code === 'PGRST205') {
            console.error(`\n❌ CRITICAL ERROR: Table 'vehicle_types' not found.`)
            console.error(`   Please run the SQL in 'supabase/schema.sql' in your Supabase Dashboard SQL Editor to create the database schema.\n`)
            process.exit(1)
        }
        console.error(`Error inserting ${vt.name}:`, error)
      }
      else console.log(`Inserted ${vt.name}`)
    } else {
      console.log(`Skipped ${vt.name} (already exists)`)
    }
  }
  
  console.log('Seeding completed.')
}

seed()
