export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )token=([^;]+)/);
  if (m) return decodeURIComponent(m[1]);
  return localStorage.getItem("token");
}

export function getSession() {
  const token = getToken();
  if (!token) return null;
  return { token };
}

export function clearSession() {
  if (typeof window === "undefined") return;
  document.cookie = "token=; Max-Age=0; path=/";
  localStorage.removeItem("token");
}
