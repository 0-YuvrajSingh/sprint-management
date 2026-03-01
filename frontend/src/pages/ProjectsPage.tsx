import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createProject, getProjects } from "../api/projects";
import type { CreateProjectRequest, Project } from "../api/types";

const emptyForm: CreateProjectRequest = {
  name: "",
  description: "",
  ownerId: "",
};

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreateProjectRequest>(emptyForm);

  async function loadProjects() {
    setLoading(true);
    setError(null);

    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProjects();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const created = await createProject(form);
      setProjects((current) => [created, ...current]);
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="page-section">
      <h2>Projects</h2>
      <form className="entity-form" onSubmit={handleSubmit}>
        <input
          required
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          placeholder="Project name"
        />
        <input
          required
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          placeholder="Description"
        />
        <input
          required
          value={form.ownerId}
          onChange={(event) => setForm((current) => ({ ...current, ownerId: event.target.value }))}
          placeholder="Owner ID"
        />
        <button type="submit" disabled={saving}>{saving ? "Saving..." : "Create project"}</button>
      </form>

      {loading && <p>Loading projects...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && (
        <table className="entity-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Owner ID</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td>{project.name}</td>
                <td>{project.description}</td>
                <td>{project.ownerId}</td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={3}>No projects found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </section>
  );
}
