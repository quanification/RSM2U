const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  let body;

  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON" }),
    };
  }

  const { restaurantAddress, customerAddress } = body;

  if (!restaurantAddress || !customerAddress) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing address inputs." }),
    };
  }

  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  const endpoint = "https://maps.googleapis.com/maps/api/distancematrix/json";
  const url = `${endpoint}?origins=${encodeURIComponent(restaurantAddress)}&destinations=${encodeURIComponent(customerAddress)}&key=${GOOGLE_API_KEY}&units=imperial`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK" || data.rows[0].elements[0].status !== "OK") {
      throw new Error("Could not calculate distance.");
    }

    const distanceText = data.rows[0].elements[0].distance.text; // e.g., "6.2 mi"
    const miles = parseFloat(distanceText.replace("mi", "").trim());

    let fee = 5.0;
    if (miles > 5) {
      const extra = miles - 5;
      const rounded = Math.ceil(extra * 4) / 4; // round up to nearest $0.25
      fee = 5.0 + rounded;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        distance: miles.toFixed(2),
        fee: fee.toFixed(2),
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not calculate distance.", details: err.message }),
    };
  }
};
