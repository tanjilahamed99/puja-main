// lib/useServiceLink.js
"use client";

import { useRouter } from "next/navigation";
import { dashboardPathForRole } from "./dashboardPathForRole";
import { useAuthStore } from "@/features/Useauthstore";

// A single "go to this service" function used by every service CTA.
//   - not logged in              -> guestPath (defaults to /login)
//   - logged in as a student     -> studentPath (the actual feature page)
//   - logged in as teacher/admin -> their own dashboard, since browsing/
//     enrolling isn't something those roles do as a "student" action
export function useServiceLink() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  return function goTo(studentPath, { guestPath = "/login" } = {}) {
    if (!user) {
      router.push(guestPath);
      return;
    }
    router.push(
      user.role === "student" ? studentPath : dashboardPathForRole(user.role),
    );
  };
}
