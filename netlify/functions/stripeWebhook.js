const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  try {
    const payload = JSON.parse(event.body);

    if (payload.type === "checkout.session.completed") {
      const session = payload.data.object;

      // Set up the email transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "rsm2u.delivery@gmail.com",
          pass: "epbu vqbv hqje jgfu" // NOT your Gmail login password — use an App Password
        }
      });

      // Compose the email
      const mailOptions = {
        from: "rsm2u.delivery@gmail.com",
        to: "rsm2u.delivery@gmail.com",
        subject: "🛒 New Order Placed via RSM2U",
        text: `
A customer has completed payment!

Email: ${session.customer_email}
Amount Paid: $${(session.amount_total / 100).toFixed(2)}

View the order in Stripe: https://dashboard.stripe.com/payments
        `
      };

      // Send the email
      await transporter.sendMail(mailOptions);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Email sent successfully." })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Event ignored." })
    };
  } catch (err) {
    console.error("❌ Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" })
    };
  }
};
