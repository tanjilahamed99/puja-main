"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Pencil,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import Topbar from "@/components/admin/Topbar";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/admin/Badge";
import { deletePujaPackage, getPujaPackages } from "@/action/admin";
import {
  formatPrice,
  formatDuration,
  formatStatus,
  packageStatusVariant,
} from "@/lib/pujaHelpers";

const PAGE_LIMIT = 20;

export default function PujaPackagesPage() {
  const [packages, setPackages] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");

  const reqRef = useRef(0);

  /* Debounce search */
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(id);
  }, [search]);

  /* Reset to page 1 when filters change */
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  /* Fetch */
  useEffect(() => {
    const reqId = ++reqRef.current;
    (async () => {
      try {
        setLoading(true);
        const { data } = await getPujaPackages({
          page,
          limit: PAGE_LIMIT,
          search: debouncedSearch || undefined,
          status: status || undefined,
        });
        if (reqId !== reqRef.current) return;
        setPackages(data?.items || []);
        setTotal(data?.total || 0);
      } catch (err) {
        if (reqId !== reqRef.current) return;
        toast.error(
          err?.response?.data?.message || "Failed to load puja packages"
        );
      } finally {
        if (reqId === reqRef.current) setLoading(false);
      }
    })();
  }, [page, debouncedSearch, status]);

  const reload = async () => {
    try {
      setLoading(true);
      const { data } = await getPujaPackages({
        page,
        limit: PAGE_LIMIT,
        search: debouncedSearch || undefined,
        status: status || undefined,
      });
      setPackages(data?.items || []);
      setTotal(data?.total || 0);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to load puja packages"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePackage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this puja package?"))
      return;
    try {
      setDeletingId(id);
      await deletePujaPackage(id);
      // If last row on page, step back
      if (packages.length === 1 && page > 1) setPage((p) => p - 1);
      else reload();
      toast.success("Puja package deleted successfully");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete puja package"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const maxPage = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  return (
    <>
      <Topbar
        title="Specific Puja"
        subtitle="One-on-one paid puja sessions booked by individual users"
      />

      <main className="px-6 lg:px-10 py-8 space-y-6">
        <section>
          <PageHeader
            title="Puja Packages"
            description="Each package is a private session for a single paying participant."
            actionLabel="Add Package"
            actionHref="/admin/specific-puja/new"
          />

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <div className="relative flex-1 min-w-[220px]">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-inkSoft"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search packages by name…"
                className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-ink outline-none focus:border-maroon"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none focus:border-maroon"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-inkSoft border-b border-border">
                    <th className="px-5 py-3 font-medium">Package</th>
                    <th className="px-5 py-3 font-medium">Teacher / Priest</th>
                    <th className="px-5 py-3 font-medium">Price</th>
                    <th className="px-5 py-3 font-medium">Duration</th>
                    <th className="px-5 py-3 font-medium">Fields</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-inkSoft"
                      >
                        <div className="flex justify-center items-center gap-2">
                          <Loader2 size={18} className="animate-spin" />
                          Loading packages...
                        </div>
                      </td>
                    </tr>
                  ) : packages.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-inkSoft"
                      >
                        {search || status
                          ? "No packages match your filters."
                          : "No puja packages found."}
                      </td>
                    </tr>
                  ) : (
                    packages.map((pkg) => (
                      <tr
                        key={pkg._id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-5 py-3.5">
                          <div className="font-medium">{pkg.name}</div>
                          {pkg.description && (
                            <div className="text-xs text-inkSoft mt-1 max-w-xs truncate">
                              {pkg.description}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-inkSoft">
                          {pkg.teacher?.name || "Not assigned"}
                        </td>
                        <td className="px-5 py-3.5 text-inkSoft">
                          {formatPrice(pkg.price)}
                        </td>
                        <td className="px-5 py-3.5 text-inkSoft">
                          {formatDuration(pkg.durationMinutes)}
                        </td>
                        <td className="px-5 py-3.5 text-inkSoft">
                          {pkg.requiredInfoFields?.length || 0}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant={packageStatusVariant(pkg.status)}>
                            {formatStatus(pkg.status)}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-end items-center gap-2">
                            <Link
                              href={`/admin/specific-puja/${pkg._id}/edit`}
                              className="p-2 rounded-lg hover:bg-muted transition"
                              title="Edit package"
                            >
                              <Pencil size={17} className="text-inkSoft" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeletePackage(pkg._id)}
                              disabled={deletingId === pkg._id}
                              className="p-2 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                              title="Delete package"
                            >
                              {deletingId === pkg._id ? (
                                <Loader2
                                  size={17}
                                  className="animate-spin text-red-500"
                                />
                              ) : (
                                <Trash2 size={17} className="text-red-500" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {!loading && total > 0 && (
            <div className="flex items-center justify-between mt-4 text-sm text-inkSoft">
              <span>
                Page {page} of {maxPage} · {total} total
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border disabled:opacity-40 disabled:cursor-not-allowed hover:border-maroon hover:text-maroon transition-colors"
                >
                  <ChevronLeft size={14} />
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
                  disabled={page >= maxPage}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border disabled:opacity-40 disabled:cursor-not-allowed hover:border-maroon hover:text-maroon transition-colors"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
}