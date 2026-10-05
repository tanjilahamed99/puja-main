"use server";

import { cookies } from "next/headers";

const LOCALES = ["hi", "en"];

export async function setLocale(locale) {
  if (!LOCALES.includes(locale)) return;
  const store = await cookies();
  store.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
