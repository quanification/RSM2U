const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async function(event) {
  try {
    const { email, amount } = JSON.parse(event.body);

    // ✅ Validate inputs
    if (!email || typeof amount !== "number" || isNaN(amount)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid or missing email/amount." }),
      };
    }

    // ✅ Create Stripe session (assuming amount is already in cents)
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
            unit_amount: amount, // already in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://rsm2u.netlify.app/success.html",
      cancel_url: "https://rsm2u.netlify.app/cancel.html",
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };

  } catch (err) {
    console.error("❌ Stripe Error:", err); // This will show the real issue in Netlify logs
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Stripe error", details: err.message }),
    };
  }
};
