const API_URL = "http://localhost:8000/api/v1";

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};
