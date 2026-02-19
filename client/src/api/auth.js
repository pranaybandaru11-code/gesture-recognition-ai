export const registerUser = async (email, username, password) => {
  const response = await fetch("/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Registration failed");
  }
  return response.json();
};

export const loginUser = async (email, password) => {
  const response = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username: "placeholder", password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Login failed");
  }
  return response.json();
};