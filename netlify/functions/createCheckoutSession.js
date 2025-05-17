const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async function(event) {
  try {
    const { email, amount } = JSON.parse(event.body);

    if (!email || !amount) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing email or amount." }),
      };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "RSM2U Delivery",
              description: "Local driver delivery request",
            },
            unit_amount: amount, // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://rsm2u.netlify.app/success.html",
      cancel_url: "https://rsm2u.netlify.app/review.html",
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error("❌ Stripe Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Stripe error", details: err.message }),
    };
  }
};
