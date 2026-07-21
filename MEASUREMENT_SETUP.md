# Booking measurement setup

The application distinguishes funnel activity from a real booking. Only a booking that the signed Stripe webhook has changed to `payment_status = paid` and a confirmed operational status can emit the Google Ads purchase conversion.

## Required production environment variables

```text
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-18320205966
NEXT_PUBLIC_GOOGLE_ADS_BOOKING_CONVERSION_LABEL=<label from the Booking confirmed conversion action>
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=<optional GA4 G-... measurement ID>
BOOKING_CONFIRMATION_SECRET=<stable random secret>
STRIPE_WEBHOOK_SECRET=<signing secret for the live endpoint>
```

Do not expose either server-only secret through a `NEXT_PUBLIC_` variable.

## Stripe live endpoint

Create one live webhook endpoint at:

```text
https://www.rihlaride.com/api/webhooks/stripe
```

Subscribe it to:

- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`

Copy its signing secret into the production `STRIPE_WEBHOOK_SECRET` variable and redeploy. The Stripe Dashboard must show successful `2xx` deliveries before ads are resumed.

## Google Ads goal

In Google Ads, create a website conversion action for the `Purchase` goal:

- Name: `Booking confirmed`
- Optimization: Primary
- Value: Use different values for each conversion
- Count: Every

Copy the action's conversion label into `NEXT_PUBLIC_GOOGLE_ADS_BOOKING_CONVERSION_LABEL`. The application sends the verified booking ID as `transaction_id`, so repeated confirmation-page visits are deduplicated.

Make page-view, `/book` visit, button-click, quote, and checkout-start actions Secondary and remove them from account-default bidding goals. Never configure `/book` or `/book/confirmation` as a URL-based primary conversion.

## Funnel analytics

When `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` is configured, the booking flow emits these non-PII events:

- `booking_funnel_started`
- `booking_step_viewed`
- `vehicle_selected`
- `service_selected`
- `quote_generated` or `quote_failed`
- `begin_checkout` or `checkout_initialization_failed`
- `payment_form_viewed`
- `payment_submitted`
- `payment_error` or `payment_accepted_by_stripe`
- `booking_confirmation_pending`
- `booking_confirmed`
- `purchase`

Only the separately labelled Google Ads `conversion` event is used as the primary booking conversion.

## Release verification

1. Test the full flow in Stripe test mode first.
2. Confirm the webhook creates a `payments` row and changes the booking to paid/confirmed.
3. Confirm the browser reaches `/book/confirmation` and renders `Booking Confirmed` only after that database update.
4. Use Google Tag Assistant to verify one `purchase` event and one labelled Google Ads `conversion` event containing the same booking ID and correct USD value.
5. Reload the confirmation page and verify Google Ads deduplicates it by transaction ID.
6. Make one controlled live booking, then verify Stripe, Supabase, confirmation email, and Google Ads all agree before resuming campaign optimization.

