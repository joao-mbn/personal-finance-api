export function parseCookieString(cookieString?: string) {
  const cookies: Record<string, string> = {};

  cookieString?.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    acc[name] = decodeURIComponent(value);
    return acc;
  }, cookies);

  return cookies;
}
