const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const nodemailer = require("nodemailer");

exports.handler = async function (event) {
  const sig = event.headers["stripe-signature"];

  let session;
  try {
    session = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed.", err.message);
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }

  if (session.type === "checkout.session.completed") {
    const customerEmail = session.data.object.customer_email;
    const amount = (session.data.object.amount_total / 100).toFixed(2);

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail", // or use another email provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"RSM2U Orders" <${process.env.EMAIL_USER}>`,
      to: "youremail@example.com", // your email
      subject: "✅ New Delivery Order Paid",
      text: `A customer has placed a new order.\n\nEmail: ${customerEmail}\nAmount Paid: $${amount}`,
    });
  }

  return {
    statusCode: 200,
    body: "Success",
  };
};
