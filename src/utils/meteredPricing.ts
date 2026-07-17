export interface MeteredPricingRule {
  baseFare: number
  perMile: number
  perMinute: number
  minimumFare: number
  waitPerMinute: number
  complimentaryWaitMinutes: number
}

export interface MeteredFareInput {
  distanceMiles: number
  durationMinutes: number
  waitMinutes?: number
  rule: MeteredPricingRule
}

export interface MeteredFareBreakdown {
  baseFare: number
  distanceCharge: number
  timeCharge: number
  meteredFare: number
  rideFare: number
  billableWaitMinutes: number
  waitCharge: number
  total: number
}

function requireNonNegativeFinite(value: number, field: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be a non-negative number`)
  }
  return value
}

export function calculateMeteredFare({
  distanceMiles,
  durationMinutes,
  waitMinutes = 0,
  rule
}: MeteredFareInput): MeteredFareBreakdown {
  const safeDistanceMiles = requireNonNegativeFinite(distanceMiles, 'distanceMiles')
  const safeDurationMinutes = requireNonNegativeFinite(durationMinutes, 'durationMinutes')
  const safeWaitMinutes = requireNonNegativeFinite(waitMinutes, 'waitMinutes')
  const baseFare = requireNonNegativeFinite(rule.baseFare, 'baseFare')
  const perMile = requireNonNegativeFinite(rule.perMile, 'perMile')
  const perMinute = requireNonNegativeFinite(rule.perMinute, 'perMinute')
  const minimumFare = requireNonNegativeFinite(rule.minimumFare, 'minimumFare')
  const waitPerMinute = requireNonNegativeFinite(rule.waitPerMinute, 'waitPerMinute')
  const complimentaryWaitMinutes = requireNonNegativeFinite(
    rule.complimentaryWaitMinutes,
    'complimentaryWaitMinutes'
  )

  const distanceCharge = safeDistanceMiles * perMile
  const timeCharge = safeDurationMinutes * perMinute
  const meteredFare = baseFare + distanceCharge + timeCharge
  const rideFare = Math.max(meteredFare, minimumFare)
  const billableWaitMinutes = Math.max(0, safeWaitMinutes - complimentaryWaitMinutes)
  const waitCharge = billableWaitMinutes * waitPerMinute

  return {
    baseFare,
    distanceCharge,
    timeCharge,
    meteredFare,
    rideFare,
    billableWaitMinutes,
    waitCharge,
    total: rideFare + waitCharge
  }
}
