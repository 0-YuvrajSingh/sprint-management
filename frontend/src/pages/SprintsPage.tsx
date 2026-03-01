import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createSprint, getSprints } from "../api/sprints";
import type { CreateSprintRequest, Sprint, SprintStatus } from "../api/types";

const sprintStatuses: SprintStatus[] = ["PLANNED", "ACTIVE", "COMPLETED"];

const emptyForm: CreateSprintRequest = {
  name: "",
  goal: "",
  projectId: "",
  status: "PLANNED",
  startDate: "",
  endDate: "",
};

export function SprintsPage() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreateSprintRequest>(emptyForm);

  async function loadSprints() {
    setLoading(true);
    setError(null);

    try {
      const data = await getSprints();
      setSprints(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sprints");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSprints();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const created = await createSprint(form);
      setSprints((current) => [created, ...current]);
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create sprint");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="page-section">
      <h2>Sprints</h2>
      <form className="entity-form" onSubmit={handleSubmit}>
        <input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Sprint name" />
        <input required value={form.goal} onChange={(event) => setForm((current) => ({ ...current, goal: event.target.value }))} placeholder="Goal" />
        <input required value={form.projectId} onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value }))} placeholder="Project ID" />
        <label>
          Status
          <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as SprintStatus }))}>
            {sprintStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
        <input required type="date" value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} />
        <input required type="date" value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} />
        <button type="submit" disabled={saving}>{saving ? "Saving..." : "Create sprint"}</button>
      </form>

      {loading && <p>Loading sprints...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && (
        <table className="entity-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Goal</th>
              <th>Status</th>
              <th>Project ID</th>
            </tr>
          </thead>
          <tbody>
            {sprints.map((sprint) => (
              <tr key={sprint.id}>
                <td>{sprint.name}</td>
                <td>{sprint.goal}</td>
                <td>{sprint.status}</td>
                <td>{sprint.projectId}</td>
              </tr>
            ))}
            {sprints.length === 0 && (
              <tr>
                <td colSpan={4}>No sprints found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </section>
  );
}
