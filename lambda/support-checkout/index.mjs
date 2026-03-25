/**
 * Lambda: sphinx-support-checkout
 * Creates a Stripe Checkout Session for custom-amount research contributions.
 *
 * Environment variables:
 *   STRIPE_SECRET_KEY  — sk_live_... from Stripe dashboard
 *
 * Deploy:
 *   1. cd lambda/support-checkout
 *   2. npm init -y && npm install stripe
 *   3. zip -r function.zip .
 *   4. aws lambda create-function \
 *        --function-name sphinx-support-checkout \
 *        --runtime nodejs20.x \
 *        --handler index.handler \
 *        --zip-file fileb://function.zip \
 *        --role arn:aws:iam::692859945539:role/lambda-basic-execution \
 *        --environment Variables="{STRIPE_SECRET_KEY=sk_live_YOUR_KEY}" \
 *        --region us-east-1
 *   5. Create API Gateway route: POST /support/checkout → this Lambda
 *   6. Update CHECKOUT_API in blog/contribute.html with the API Gateway URL
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': 'https://sphinxagent.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
};

export const handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { amount, name, email, focus, message, mailingList } = body;

        // Validate
        if (!amount || !Number.isFinite(amount) || amount < 5 || amount > 500000) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Amount must be between $5 and $500,000.' })
            };
        }

        if (!email || !name) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Name and email are required.' })
            };
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: email,
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Research Contribution',
                        description: focus || 'General Research Fund',
                    },
                    unit_amount: Math.round(amount * 100), // cents
                },
                quantity: 1,
            }],
            metadata: {
                contributor_name: name,
                contributor_email: email,
                research_focus: focus || 'General Research Fund',
                research_message: (message || '').substring(0, 500),
                mailing_list: mailingList ? 'yes' : 'no',
                source: 'sphinxagent-com-contribute',
            },
            success_url: 'https://sphinxagent.com/blog/contribute.html?success=true&session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'https://sphinxagent.com/blog/contribute.html?canceled=true',
        });

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ url: session.url, sessionId: session.id })
        };

    } catch (err) {
        console.error('Checkout error:', err);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Failed to create checkout session. Please try again.' })
        };
    }
};
