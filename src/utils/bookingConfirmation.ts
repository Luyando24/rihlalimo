import { createHmac, timingSafeEqual } from 'crypto'

const TOKEN_LIFETIME_SECONDS = 7 * 24 * 60 * 60

function getSigningSecret() {
  const secret =
    process.env.BOOKING_CONFIRMATION_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!secret) {
    throw new Error('Booking confirmation signing secret is not configured')
  }

  return secret
}

function signatureFor(payload: string) {
  return createHmac('sha256', getSigningSecret())
    .update(payload)
    .digest('base64url')
}

export function createBookingConfirmationToken(bookingId: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS
  const payload = `${bookingId}.${expiresAt}`
  return `${expiresAt}.${signatureFor(payload)}`
}

export function verifyBookingConfirmationToken(bookingId: string, token: string) {
  const [expiresAtText, providedSignature, ...extra] = token.split('.')
  if (!expiresAtText || !providedSignature || extra.length > 0) return false

  const expiresAt = Number(expiresAtText)
  if (!Number.isSafeInteger(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) {
    return false
  }

  const expectedSignature = signatureFor(`${bookingId}.${expiresAt}`)
  const providedBuffer = Buffer.from(providedSignature)
  const expectedBuffer = Buffer.from(expectedSignature)

  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  )
}

