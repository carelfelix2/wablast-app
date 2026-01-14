import Cookies from 'js-cookie';

const TOKEN_KEY = 'wablast_token';
const COOKIE_OPTIONS = {
  httpOnly: false, // Note: HttpOnly can't be set from client-side, handle on backend
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60, // 7 days
};

export const setAuthToken = (token: string) => {
  Cookies.set(TOKEN_KEY, token, COOKIE_OPTIONS);
  localStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = () => {
  return Cookies.get(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
};

export const removeAuthToken = () => {
  Cookies.remove(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};
