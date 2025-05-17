const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    const { email, restaurant, deliveryFee, tip } = JSON.parse(event.body);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Delivery from ${restaurant}`,
            },
            unit_amount: Math.round((parseFloat(deliveryFee) + parseFloat(tip)) * 100), // in cents
          },
          quantity: 1,
        }
      ],
      customer_email: email,
      success_url: 'https://rsm2u.netlify.app/success.html',
      cancel_url: 'https://rsm2u.netlify.app/review.html',
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error('Stripe Checkout error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
