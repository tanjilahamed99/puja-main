import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export const LOCALES = ["hi", "en"];
export const DEFAULT_LOCALE = "hi";
export const LOCALE_COOKIE = "NEXT_LOCALE";

// No URL prefix: the language comes from a cookie, Hindi if there is none.
export default getRequestConfig(async () => {
  const store = await cookies();
  const saved = store.get(LOCALE_COOKIE)?.value;
  const locale = LOCALES.includes(saved) ? saved : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
