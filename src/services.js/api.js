const API_BASE_URL = "http://localhost:8000/api";

export const fetchParkingSpots = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/spots`);
    if (!res.ok) throw new Error("Failed to fetch spots");
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const bookSpot = async (spotId, bookingData) => {
  const res = await fetch(`${API_BASE_URL}/spots/${spotId}/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingData),
  });
  return res.json();
};

export const checkoutSpot = async (spotId) => {
  const res = await fetch(`${API_BASE_URL}/spots/${spotId}/checkout`, {
    method: "POST",
  });
  return res.json();
};

export const fetchBookingHistory = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/history`);
    return await res.json();
  } catch (err) {
    return [];
  }
};