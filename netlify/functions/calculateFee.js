const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    const body = JSON.parse(event.body);
    const { restaurantAddress, customerAddress } = body;

    if (!restaurantAddress || !customerAddress) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing address inputs." })
      };
    }

    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    const endpoint = "https://maps.googleapis.com/maps/api/distancematrix/json";
    const url = `${endpoint}?origins=${encodeURIComponent(restaurantAddress)}&destinations=${encodeURIComponent(customerAddress)}&key=${GOOGLE_API_KEY}&units=imperial`;

    const res = await fetch(url);
    const data = await res.json();

    // 🔍 Add logging to debug output
    console.log("Distance Matrix Response:", JSON.stringify(data));

    if (data.status !== "OK" || data.rows[0].elements[0].status !== "OK") {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Could not calculate distance.", details: data })
      };
    }

    const distanceText = data.rows[0].elements[0].distance.text;
    const miles = parseFloat(distanceText.replace("mi", "").trim());

    let fee = 5.0;
    if (miles > 5) {
      const extra = miles - 5;
      const rounded = Math.ceil(extra * 4) / 4; // nearest 0.25
      fee = 5.0 + rounded;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        distance: miles.toFixed(2),
        fee: fee.toFixed(2)
      })
    };
  } catch (err) {
    console.error("Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
