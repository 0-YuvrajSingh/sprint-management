import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import usersApi from "../api/users.api";
import { useAuth } from "../context/AuthContext";
import type { User, UserRole } from "../types";
import "./UsersPage.css";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  role: z.enum(["ADMIN", "MANAGER", "DEVELOPER", "VIEWER"]),
});

type UserFormData = z.infer<typeof userSchema>;

const ROLE_OPTIONS: UserRole[] = ["ADMIN", "MANAGER", "DEVELOPER", "VIEWER"];

const roleToneClass: Record<UserRole, string> = {
  ADMIN: "users-role-chip users-role-chip-admin",
  MANAGER: "users-role-chip users-role-chip-manager",
  DEVELOPER: "users-role-chip users-role-chip-developer",
  VIEWER: "users-role-chip users-role-chip-viewer",
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: usersApi.list,
  });

  const users = data?.content ?? [];
  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return users;
    }

    return users.filter((u) => `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(term));
  }, [users, query]);

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onCloseModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: UserFormData) => {
      if (!editingUser) {
        throw new Error("No selected user to update");
      }

      await usersApi.update(editingUser.id, {
        name: payload.name,
        email: payload.email,
      });

      if (payload.role !== editingUser.role) {
        await usersApi.updateRole(editingUser.id, {
          role: payload.role,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onCloseModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "VIEWER",
    },
  });

  const onCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    reset({
      name: "",
      email: "",
      role: "VIEWER",
    });
  };

  const onOpenCreate = () => {
    setEditingUser(null);
    reset({
      name: "",
      email: "",
      role: "VIEWER",
    });
    setShowModal(true);
  };

  const onOpenEdit = (targetUser: User) => {
    setEditingUser(targetUser);
    reset({
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
    });
    setShowModal(true);
  };

  const onSubmit = (payload: UserFormData) => {
    if (editingUser) {
      updateMutation.mutate(payload);
      return;
    }

    createMutation.mutate(payload);
  };

  const onDelete = (targetUser: User) => {
    if (targetUser.email === currentUser?.email) {
      return;
    }

    const shouldDelete = window.confirm(`Delete user \"${targetUser.email}\"?`);
    if (!shouldDelete) {
      return;
    }

    deleteMutation.mutate(targetUser.id);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <motion.div
      className="users-page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <section className="users-header-card">
        <div>
          <p className="users-kicker">Access Control</p>
          <h2 className="users-title">Users</h2>
          <p className="users-subtitle">Manage identities and roles for your workspace.</p>
        </div>

        <div className="users-toolbar">
          <label className="users-search" htmlFor="users-search-input">
            <span>Search</span>
            <input
              id="users-search-input"
              type="search"
              placeholder="Filter by name, email, or role"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <button type="button" className="users-btn-primary" onClick={onOpenCreate}>
            New User
          </button>
        </div>
      </section>

      {isLoading && <p className="users-state-text">Loading users...</p>}
      {isError && <p className="users-state-error">Failed to load users.</p>}

      {!isLoading && !isError && filteredUsers.length > 0 && (
        <section className="users-table-wrap" aria-label="Users list">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th className="users-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, index) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(index * 0.035, 0.28) }}
                >
                  <td>
                    <span className="users-cell-primary">{u.name}</span>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={roleToneClass[u.role]}>{u.role}</span>
                  </td>
                  <td>
                    <div className="users-row-actions">
                      <button
                        type="button"
                        className="users-btn-secondary"
                        onClick={() => onOpenEdit(u)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="users-btn-danger"
                        disabled={deleteMutation.isPending || u.email === currentUser?.email}
                        onClick={() => onDelete(u)}
                        title={u.email === currentUser?.email ? "You cannot delete your own account" : "Delete user"}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {!isLoading && !isError && filteredUsers.length === 0 && (
        <section className="users-empty-state">
          <h3>No users found</h3>
          <p>Try another filter or create a new user.</p>
        </section>
      )}

      <AnimatePresence>
        {showModal ? (
          <motion.div
            className="users-modal-overlay"
            role="presentation"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                onCloseModal();
              }
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <motion.div
              className="users-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="user-modal-title"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <h3 id="user-modal-title">{editingUser ? "Edit User" : "New User"}</h3>

              {(createMutation.isError || updateMutation.isError) && (
                <div className="users-error-banner" role="alert">
                  {(createMutation.error instanceof Error && createMutation.error.message)
                    || (updateMutation.error instanceof Error && updateMutation.error.message)
                    || "Request failed"}
                </div>
              )}

              <form className="users-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="users-form-field">
                  <label htmlFor="user-name">Name</label>
                  <input id="user-name" placeholder="Alex Morgan" {...register("name")} />
                  {errors.name && <span>{errors.name.message}</span>}
                </div>

                <div className="users-form-field">
                  <label htmlFor="user-email">Email</label>
                  <input id="user-email" type="email" placeholder="alex@agiletrack.com" {...register("email")} />
                  {errors.email && <span>{errors.email.message}</span>}
                </div>

                <div className="users-form-field">
                  <label htmlFor="user-role">Role</label>
                  <select id="user-role" {...register("role")}>
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div className="users-modal-actions">
                  <button type="button" className="users-btn-secondary" onClick={onCloseModal}>Cancel</button>
                  <button type="submit" className="users-btn-primary" disabled={isSaving}>
                    {isSaving ? "Saving..." : editingUser ? "Save Changes" : "Create User"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
