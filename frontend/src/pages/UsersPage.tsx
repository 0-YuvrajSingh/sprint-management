import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createUser, getUsers } from "../api/users";
import type { CreateUserRequest, User, UserRole } from "../api/types";

const userRoles: UserRole[] = ["ADMIN", "PRODUCT_OWNER", "SCRUM_MASTER", "DEVELOPER"];

const emptyForm: CreateUserRequest = {
  name: "",
  email: "",
  role: "DEVELOPER",
};

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreateUserRequest>(emptyForm);

  async function loadUsers() {
    setLoading(true);
    setError(null);

    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const created = await createUser(form);
      setUsers((current) => [created, ...current]);
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="page-section">
      <h2>Users</h2>
      <form className="entity-form" onSubmit={handleSubmit}>
        <input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Name" />
        <input required type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" />
        <label>
          Role
          <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as UserRole }))}>
            {userRoles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={saving}>{saving ? "Saving..." : "Create user"}</button>
      </form>

      {loading && <p>Loading users...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && (
        <table className="entity-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={3}>No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </section>
  );
}
