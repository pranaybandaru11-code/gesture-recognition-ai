export const getGestureHistory = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/v1/gestures/history", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch history");
  return response.json();
};

export const getAnalyticsSummary = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/v1/analytics/summary", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch analytics");
  return response.json();
};