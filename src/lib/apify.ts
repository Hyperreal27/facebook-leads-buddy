// Apify API utilities

export const getApifyApiKey = (): string | null => {
  return localStorage.getItem('apify_api_key');
};

export const setApifyApiKey = (key: string): void => {
  localStorage.setItem('apify_api_key', key);
};

export const clearApifyApiKey = (): void => {
  localStorage.removeItem('apify_api_key');
};

export const isAuthenticated = (): boolean => {
  return !!getApifyApiKey();
};
