import { sendEmail } from '../src/utils/email'
import { createAdminClient } from '../src/utils/supabase/admin'

async function runTest() {
  console.log('--- SMTP Diagnostic Test ---')
  
  // 1. Check DB Settings
  console.log('Step 1: Fetching settings from database...')
  const adminClient = createAdminClient()
  const { data: dbData, error: dbError } = await adminClient
    .from('system_settings')
    .select('value')
    .eq('key', 'smtp_settings')
    .single()

  if (dbError) {
    console.error('Error fetching settings from DB:', dbError.message)
  } else if (dbData) {
    console.log('Settings found in DB:', JSON.stringify({ ...dbData.value, pass: '****' }, null, 2))
  } else {
    console.log('No settings found in DB.')
  }

  // 2. Check ENV Settings
  console.log('\nStep 2: Checking environment variables...')
  console.log('SMTP_HOST:', process.env.SMTP_HOST || 'not set')
  console.log('SMTP_USER:', process.env.SMTP_USER || 'not set')
  console.log('SMTP_FROM_EMAIL:', process.env.SMTP_FROM_EMAIL || 'not set')

  // 3. Attempt to send
  console.log('\nStep 3: Attempting to send test email...')
  const testEmail = 'luyandochikandula63@gmail.com' // Using the user's reported email for testing
  
  const result = await sendEmail({
    to: testEmail,
    subject: `DIAGNOSTIC TEST: Rihla Limo Status at ${new Date().toLocaleString()}`,
    html: `
      <h1>SMTP Diagnostic Test</h1>
      <p>This email was sent by the diagnostic script.</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
      <p>If you received this, the basic SMTP connection is working.</p>
    `
  })

  if (result.success) {
    if ((result as any).mock) {
      console.log('\nResult: ⚠️ SUCCESS (MOCK MODE). No real email was sent because no credentials were found.')
    } else {
      console.log('\nResult: ✅ SUCCESS! Email sent successfully. Message ID:', result.messageId)
    }
  } else {
    console.error('\nResult: ❌ FAILED!')
    console.error('Error message:', result.error)
    if ((result as any).code) {
      process.stdout.write(`Error code: ${(result as any).code}\n`)
    }
    
    console.log('\nSuggested Resolution:')
    if (result.error?.includes('DKIM') || result.error?.includes('SPF') || result.error?.includes('unauthenticated')) {
      console.log('- Fix DNS records (SPF/DKIM) for the domain.')
    } else if (result.error?.includes('Invalid login') || result.error?.includes('auth')) {
      console.log('- Check SMTP user and password.')
    } else if (result.error?.includes('ETIMEDOUT') || result.error?.includes('ECONNREFUSED')) {
      console.log('- Check SMTP host and port. Ensure outgoing traffic on port 587/465 is allowed.')
    }
  }
}

runTest().catch(err => {
  console.error('Fatal error during test:', err)
})
