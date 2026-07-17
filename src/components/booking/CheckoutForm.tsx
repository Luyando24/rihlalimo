'use client'

import { useState, useEffect } from 'react'
import {
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js'

export default function CheckoutForm({
    clientSecret,
    amount,
    onPaymentSubmitted
}: {
    clientSecret: string
    amount: number
    onPaymentSubmitted: (status: 'succeeded' | 'processing') => void
}) {
    const stripe = useStripe()
    const elements = useElements()

    const [message, setMessage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!stripe) {
            return
        }

        if (!clientSecret) {
            return
        }

        stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
            if (!paymentIntent) return
            switch (paymentIntent.status) {
                case 'succeeded':
                    setMessage('Payment succeeded!')
                    break
                case 'processing':
                    setMessage('Your payment is processing.')
                    break
                case 'requires_payment_method':
                    // Just waiting for input
                    break
                default:
                    setMessage('Something went wrong.')
                    break
            }
        })
    }, [stripe, clientSecret])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!stripe || !elements) {
            // Stripe.js hasn't yet loaded.
            return
        }

        setIsLoading(true)

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + '/dashboard',
            },
            redirect: 'if_required',
        })

        if (error) {
            if (error.type === 'card_error' || error.type === 'validation_error') {
                setMessage(error.message ?? 'An unexpected error occurred.')
            } else {
                setMessage('An unexpected error occurred.')
            }
        } else if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
            // This only advances the browser UI. The signed Stripe webhook is the
            // sole authority that marks the database booking paid and confirmed.
            onPaymentSubmitted(paymentIntent.status)
        } else {
            setMessage('Stripe has not confirmed the payment. Please try again.')
        }

        setIsLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <PaymentElement className="mb-6" />
            <button
                disabled={isLoading || !stripe || !elements}
                className="w-full btn-primary py-3 flex justify-center items-center disabled:opacity-50"
            >
                <span className="font-bold">
                    {isLoading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
                </span>
            </button>
            {message && <div className="text-red-500 mt-4 text-center">{message}</div>}
        </form>
    )
}
