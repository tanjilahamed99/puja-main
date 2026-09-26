"use client";

import { useEffect, useRef, useState } from "react";
import Topbar from "@/components/admin/Topbar";
import Badge from "@/components/admin/Badge";
import { getUsers, createUser, updateUser, deleteUser } from "@/action/admin";
import { formatDate } from "@/components/formatDate";
import {
  Plus,
  X,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Search,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

const TABS = ["All", "student", "teacher", "admin"];
const PAGE_SIZE = 10;

export default function UsersPage() {
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [tab, debouncedSearch]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await getUsers({
        role: tab,
        search: debouncedSearch || undefined,
        page,
        limit: PAGE_SIZE,
      });
      if (data.success) {
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, debouncedSearch, page]);

  const handleCreated = () => {
    if (page === 1) {
      loadUsers();
    } else {
      setPage(1);
    }
  };

  // Refetch rather than patch in place — an edit can move a user out of
  // the current role filter (e.g. student -> teacher while viewing the
  // "student" tab), and a refetch is the only way to keep the list and
  // the pagination counts honest about that.
  const handleUpdated = () => {
    loadUsers();
  };

  const handleDeleted = () => {
    // If that was the last row on a page beyond the first, step back a
    // page instead of showing an empty page.
    if (users.length === 1 && page > 1) {
      setPage((p) => p - 1);
    } else {
      loadUsers();
    }
  };

  const { total, totalPages } = pagination;
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <>
      <Topbar
        title="Users"
        subtitle="Students, teachers, and admins on the platform"
      />
      <main className="px-6 lg:px-10 py-8">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">
              All Users
            </h2>
            <p className="text-sm text-inkSoft mt-1 max-w-xl">
              Manage roles and view account details.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-maroon text-ivory px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition shrink-0">
            <Plus size={16} /> Add User
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
          <div className="flex gap-2 flex-wrap">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                  tab === t
                    ? "bg-maroon text-ivory"
                    : "bg-surface border border-border text-inkSoft"
                }`}>
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2 w-full sm:w-64">
            <Search size={16} className="text-inkSoft shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email..."
              className="bg-transparent outline-none text-sm w-full placeholder:text-inkSoft"
            />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-inkSoft border-b border-border">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-8 text-center text-inkSoft">
                      Loading users…
                    </td>
                  </tr>
                )}
                {!loadingUsers && users.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-8 text-center text-inkSoft">
                      No users found.
                    </td>
                  </tr>
                )}
                {!loadingUsers &&
                  users.map((u) => (
                    <tr
                      key={u._id || u.email}
                      className="border-b border-border last:border-0">
                      <td className="px-5 py-3.5 font-medium">{u.name}</td>
                      <td className="px-5 py-3.5 text-inkSoft">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={
                            u.role === "admin"
                              ? "danger"
                              : u.role === "teacher"
                                ? "warning"
                                : "neutral"
                          }>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-inkSoft">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setEditingUser(u)}
                            aria-label={`Edit ${u.name}`}
                            className="text-inkSoft hover:text-maroon transition-colors">
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingUser(u)}
                            aria-label={`Delete ${u.name}`}
                            className="text-inkSoft hover:text-danger transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap px-5 py-4 border-t border-border text-sm">
            <span className="text-inkSoft">
              {total === 0
                ? "No results"
                : `Showing ${rangeStart}–${rangeEnd} of ${total}`}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1 || loadingUsers}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-inkSoft disabled:opacity-40 disabled:cursor-not-allowed hover:not-disabled:border-maroon transition-colors">
                <ChevronLeft size={15} /> Prev
              </button>
              <span className="text-inkSoft px-1">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages || loadingUsers}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-inkSoft disabled:opacity-40 disabled:cursor-not-allowed hover:not-disabled:border-maroon transition-colors">
                Next <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </main>

      <CreateUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />

      <EditUserModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onUpdated={handleUpdated}
      />

      <ConfirmDeleteModal
        user={deletingUser}
        onClose={() => setDeletingUser(null)}
        onDeleted={handleDeleted}
      />
    </>
  );
}

// ---------------- Shared modal shell ----------------
// Handles the mount/visible split so every modal on this page gets the
// same smooth fade + scale in/out, plus Escape-to-close, backdrop click,
// scroll lock, and initial focus — without repeating that logic 3 times.
function Modal({
  open,
  onClose,
  labelledBy,
  maxWidth = "max-w-md",
  initialFocusRef,
  children,
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    let frame;
    let timeout;

    if (open) {
      setMounted(true);
      frame = requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      timeout = setTimeout(() => setMounted(false), 200);
    }

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
  }, [open]);

  useEffect(() => {
    if (!mounted) return undefined;

    document.body.style.overflow = "hidden";
    initialFocusRef?.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mounted, onClose, initialFocusRef]);

  if (!mounted) return null;

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) onClose();
  };

  return (
    <div
      ref={dialogRef}
      onMouseDown={handleBackdropClick}
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/40 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`w-full ${maxWidth} bg-surface border border-border rounded-xl shadow-xl transition-all duration-200 ${
          visible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-2"
        }`}>
        {children}
      </div>
    </div>
  );
}

// ---------------- Create ----------------
function CreateUserModal({ open, onClose, onCreated }) {
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const firstFieldRef = useRef(null);

  useEffect(() => {
    if (open) {
      setRole("student");
      setShowPassword(false);
      setError("");
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const form = new FormData(e.target);
    const payload = {
      name: form.get("name").trim(),
      email: form.get("email").trim(),
      phone: form.get("phone").trim() || undefined,
      password: form.get("password"),
      role,
    };

    setSubmitting(true);
    try {
      const { data } = await createUser(payload);
      if (!data.success) {
        setError(
          data.message || "Could not create the account. Please try again.",
        );
        return;
      }
      onCreated(data.user);
      onClose();
      e.target.reset();
      toast.success("User create successful");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Could not create the account. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="create-user-title"
      initialFocusRef={firstFieldRef}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <h2
          id="create-user-title"
          className="font-display text-lg font-semibold text-ink">
          Add a new user
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-inkSoft hover:text-ink">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        <div className="flex bg-ivorySoft rounded-lg p-1">
          {["student", "teacher"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 rounded-md text-sm font-semibold capitalize transition-colors ${
                role === r ? "bg-maroon text-ivory" : "text-inkSoft"
              }`}>
              {r}
            </button>
          ))}
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-ink mb-1.5">
            Full name
          </label>
          <input
            ref={firstFieldRef}
            id="name"
            name="name"
            type="text"
            required
            placeholder="e.g. Pandit R. Sharma"
            className="input"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-ink mb-1.5">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="name@example.com"
            className="input"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-ink mb-1.5">
            Phone <span className="text-inkSoft font-normal">(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+880 1XXX-XXXXXX"
            className="input"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-ink mb-1.5">
            password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="input pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-inkSoft">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-maroon text-ivory py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60">
            {submitting ? "Creating…" : `Create ${role}`}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-inkSoft px-4 py-2.5">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---------------- Edit ----------------
function EditUserModal({ user, onClose, onUpdated }) {
  const open = !!user;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("student");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const firstFieldRef = useRef(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setRole(user.role || "student");
      setIsActive(user.isActive !== false);
      setError("");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { data } = await updateUser(user._id, {
        name,
        phone: phone || undefined,
        role,
        isActive,
      });
      if (!data.success) {
        setError(data.message || "Could not update this user.");
        return;
      }
      onUpdated(data.user);
      onClose();
      toast.success("Edit successful");
    } catch (err) {
      setError(err?.response?.data?.message || "Could not update this user.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="edit-user-title"
      initialFocusRef={firstFieldRef}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <h2
          id="edit-user-title"
          className="font-display text-lg font-semibold text-ink">
          Edit user
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-inkSoft hover:text-ink">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        <div>
          <label
            htmlFor="edit-name"
            className="block text-sm font-medium text-ink mb-1.5">
            Full name
          </label>
          <input
            ref={firstFieldRef}
            id="edit-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="input opacity-60 cursor-not-allowed"
          />
          <p className="text-xs text-inkSoft mt-1">
            Email can&apos;t be changed here.
          </p>
        </div>

        <div>
          <label
            htmlFor="edit-phone"
            className="block text-sm font-medium text-ink mb-1.5">
            Phone <span className="text-inkSoft font-normal">(optional)</span>
          </label>
          <input
            id="edit-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label
            htmlFor="edit-role"
            className="block text-sm font-medium text-ink mb-1.5">
            Role
          </label>
          <select
            id="edit-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input capitalize">
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-inkSoft">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="accent-maroon"
          />
          Account active
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-maroon text-ivory py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60">
            {submitting ? "Saving…" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-inkSoft px-4 py-2.5">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---------------- Delete confirmation ----------------
function ConfirmDeleteModal({ user, onClose, onDeleted }) {
  const open = !!user;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) setError("");
  }, [user]);

  const handleDelete = async () => {
    setSubmitting(true);
    setError("");
    try {
      const { data } = await deleteUser(user._id);
      if (!data.success) {
        setError(data.message || "Could not delete this user.");
        return;
      }
      console.log("he;;p");
      onDeleted(user._id);
      onClose();
      toast.success("delete successful");
    } catch (err) {
      setError(err?.response?.data?.message || "Could not delete this user.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="delete-user-title"
      maxWidth="max-w-sm">
      <div className="px-6 py-6">
        <h2
          id="delete-user-title"
          className="font-display text-lg font-semibold text-ink">
          Delete user?
        </h2>
        <p className="text-sm text-inkSoft mt-2">
          This will permanently remove{" "}
          <span className="font-medium text-ink">{user?.name}</span> (
          {user?.email}). This can&apos;t be undone.
        </p>

        {error && <p className="text-sm text-danger mt-3">{error}</p>}

        <div className="flex items-center gap-3 pt-5">
          <button
            type="button"
            onClick={handleDelete}
            disabled={submitting}
            className="flex-1 bg-danger text-ivory py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60">
            {submitting ? "Deleting…" : "Delete"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-inkSoft px-4 py-2.5">
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
