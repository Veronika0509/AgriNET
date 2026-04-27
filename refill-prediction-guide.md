# Refill Prediction Feature

## What it does

When a user opens a moisture sensor chart page, the app calls a prediction API to find out how many days until the sum of soil moisture reaches the refill zone. If the prediction is available, a red warning text is displayed as an overlay on the Sum of Soil Moisture chart.

The text reads: **"Sum chart will reach refill zone in X days without irrigation"**

## API

- **Endpoint:** `GET https://app.agrinet.us/api/predict-moisture/{sensorId}?user={userId}`
- Returns the number of days until refill is needed (`days_to_refill` field in the response)

## Where to display

- The text is overlaid directly on the **Sum of Soil Moisture** chart
- Positioned near the bottom of the chart (about 10% from the bottom edge), horizontally centered
- Red color (`#CC0000`), semi-bold weight
- The text should not block mouse interactions with the chart (clicks/hovers should pass through to the chart underneath)

## When to display

- Fetch the prediction once when the chart page loads
- Only show the text if the API returns a valid response with `days_to_refill >= 0`
- If the API call fails, show nothing — the feature should fail silently
