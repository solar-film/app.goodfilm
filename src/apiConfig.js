const localHostnames = new Set(['localhost', '127.0.0.1', '::1']);
const isLocalRuntime = typeof window !== 'undefined' && localHostnames.has(window.location.hostname);
const productionFallbackUrl = import.meta.env.DEV || isLocalRuntime ? '' : 'https://nas.goodfilmshop.com';
const configuredBaseUrl = String(import.meta.env.VITE_API_URL || productionFallbackUrl).trim();

export const API_BASE_URL = configuredBaseUrl.replace(/\/$/, '');

export const apiUrl = (path = '') => {
  if (!path) return API_BASE_URL || '';
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const apiFetch = (path, options = {}) => fetch(apiUrl(path), {
  ...options,
  credentials: 'include'
});

export const adminFetch = async (path, options = {}) => {
  const response = await apiFetch(path, options);
  if (response.status === 401 && typeof window !== 'undefined') {
    window.dispatchEvent(new Event('goodfilm:admin-unauthorized'));
  }
  return response;
};

export const assetUrl = (path) => {
  if (!path || /^https?:\/\//i.test(path)) return path;
  return apiUrl(path);
};
