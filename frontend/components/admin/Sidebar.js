"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Radio,
  Flame,
  Users,
  Wallet,
  Menu,
  X,
  LogOut,
  Settings,
  ChevronDown,
  Package,
  CalendarClock,
} from "lucide-react";
import { useAuthStore } from "@/features/Useauthstore";
import { toast } from "sonner";
import Logo from "../Logo";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/free-classes", label: "Free Classes", icon: Radio },
  {
    // Parent — acts as a group, opens submenu
    href: "/admin/specific-puja",
    label: "Specific Puja",
    icon: Flame,
    children: [
      {
        href: "/admin/specific-puja",
        label: "Packages",
        icon: Package,
        exact: true,
      },
      {
        href: "/admin/specific-puja/bookings",
        label: "Bookings",
        icon: CalendarClock,
      },
    ],
  },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/payments", label: "Payments & Donations", icon: Wallet },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null); // href of expanded group

  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  /* Auto-open the submenu that matches the current path */
  useEffect(() => {
    const active = NAV_ITEMS.find(
      (item) =>
        item.children &&
        item.children.some((c) => pathname.startsWith(c.href))
    );
    setOpenSubmenu(active ? active.href : null);
  }, [pathname]);

  const isActive = (href, exact) =>
    exact ? pathname === href : pathname.startsWith(href);

  const onLogout = () => {
    clearAuth();
    toast.success("Logged out.");
    router.push("/");
  };

  const toggleSubmenu = (href) => {
    setOpenSubmenu((cur) => (cur === href ? null : href));
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="lg:hidden fixed top-4 left-4 z-50 bg-[var(--sidebar-bg)] text-[var(--sidebar-ink)] p-2.5 rounded-lg shadow-lg"
      >
        <Menu size={20} />
      </button>

      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-[248px] shrink-0 z-50 flex flex-col
          bg-[var(--sidebar-bg)] text-[var(--sidebar-ink)]
          transition-transform duration-200 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-5 py-6">
          <div className="flex items-center gap-2.5">
            <Logo />
            <span className="font-display text-lg font-semibold tracking-wide">
              Karmkand Bharti
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="lg:hidden text-[var(--sidebar-ink-soft)]"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact, children }) => {
            const active = isActive(href, exact);
            const hasChildren = Array.isArray(children) && children.length > 0;
            const isExpanded = hasChildren && openSubmenu === href;
            const childActive =
              hasChildren &&
              children.some((c) => isActive(c.href, c.exact));

            /* Simple item (no children) */
            if (!hasChildren) {
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[0.94rem] font-medium transition-colors
                    ${
                      active
                        ? "bg-[var(--sidebar-active)] text-[#2B1B0E]"
                        : "text-[var(--sidebar-ink-soft)] hover:bg-white/5 hover:text-[var(--sidebar-ink)]"
                    }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            }

            /* Group item (with submenu) */
            return (
              <div key={href}>
                <button
                  type="button"
                  onClick={() => toggleSubmenu(href)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[0.94rem] font-medium transition-colors
                    ${
                      childActive
                        ? "text-[var(--sidebar-ink)] bg-white/5"
                        : "text-[var(--sidebar-ink-soft)] hover:bg-white/5 hover:text-[var(--sidebar-ink)]"
                    }`}
                >
                  <Icon size={18} />
                  <span className="flex-1 text-left">{label}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="mt-1 ml-3 pl-3 border-l border-white/10 space-y-0.5">
                    {children.map(
                      ({ href: chHref, label: chLabel, icon: ChIcon, exact: chExact }) => {
                        const chActive = isActive(chHref, chExact);
                        return (
                          <Link
                            key={chHref}
                            href={chHref}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[0.88rem] font-medium transition-colors
                              ${
                                chActive
                                  ? "bg-[var(--sidebar-active)] text-[#2B1B0E]"
                                  : "text-[var(--sidebar-ink-soft)] hover:bg-white/5 hover:text-[var(--sidebar-ink)]"
                              }`}
                          >
                            <ChIcon size={16} />
                            {chLabel}
                          </Link>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="px-5 py-5 border-t border-white/10 text-xs text-[var(--sidebar-ink-soft)]">
          Signed in as{" "}
          <span className="text-[var(--sidebar-ink)] font-medium">Admin</span>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-300 transition-colors hover:bg-red-500/10 hover:text-red-300 active:scale-[0.99]"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}