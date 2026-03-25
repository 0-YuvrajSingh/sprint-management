import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import projectsApi from "../api/projects.api";
import { useAuth } from "../context/AuthContext";
import type { Project } from "../types";

// ================================================================
// SCHEMA
// ================================================================

const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").min(3, "Min 3 characters"),
  description: z.string().min(1, "Description is required"),
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

// ================================================================
// COMPONENT
// ================================================================

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  // ── Fetch all projects ──────────────────────────────────────
  // queryKey: ["projects"] — used to invalidate this query after mutations
  // TanStack Query caches this result for staleTime (5 min from main.tsx)
  const { data, isLoading, isError } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.list,
  });
  const projects = data?.content ?? [];

  // ── Create project ──────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      // Tell TanStack Query the "projects" list is stale → refetch automatically
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowModal(false);
      reset();
    },
  });

  // ── Delete project ──────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: projectsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  // ── Form ────────────────────────────────────────────────────
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
  });

  const onSubmit = (data: CreateProjectForm) => createMutation.mutate(data);

  // ================================================================
  // RENDER
  // ================================================================

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Projects</h1>
        {/* Only ADMIN and MANAGER see the create button */}
        {hasRole("ADMIN", "MANAGER") && (
          <button style={styles.btnPrimary} onClick={() => setShowModal(true)}>
            + New Project
          </button>
        )}
      </div>

      {/* States */}
      {isLoading && <p style={styles.stateText}>Loading projects...</p>}
      {isError   && <p style={styles.errorText}>Failed to load projects.</p>}

      {/* Project grid */}
      <div style={styles.grid}>
        {projects.map((project: Project) => (
          <div key={project.id} style={styles.card}>
            <div style={styles.cardBody}>
              <h3 style={styles.cardTitle}>{project.name}</h3>
              <p style={styles.cardDesc}>{project.description}</p>
              <span style={styles.cardDate}>
                {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div style={styles.cardFooter}>
              {/* Navigate to sprints filtered by this project */}
              <button
                style={styles.btnSecondary}
                onClick={() => navigate(`/sprints?projectId=${project.id}`)}
              >
                View Sprints
              </button>
              {/* Only ADMIN sees delete */}
              {hasRole("ADMIN") && (
                <button
                  style={styles.btnDanger}
                  onClick={() => deleteMutation.mutate(project.id)}
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {!isLoading && projects.length === 0 && (
        <div style={styles.emptyState}>
          <p>No projects yet.</p>
          {hasRole("ADMIN", "MANAGER") && (
            <button style={styles.btnPrimary} onClick={() => setShowModal(true)}>
              Create your first project
            </button>
          )}
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>New Project</h2>

            {createMutation.isError && (
              <div style={styles.errorBanner}>
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : "Failed to create project"}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} style={styles.form} noValidate>
              <div style={styles.field}>
                <label style={styles.label}>Name</label>
                <input style={styles.input} placeholder="Project name" {...register("name")} />
                {errors.name && <span style={styles.fieldError}>{errors.name.message}</span>}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Description</label>
                <textarea
                  style={{ ...styles.input, minHeight: "80px", resize: "vertical" }}
                  placeholder="What is this project about?"
                  {...register("description")}
                />
                {errors.description && <span style={styles.fieldError}>{errors.description.message}</span>}
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.btnSecondary}
                  onClick={() => { setShowModal(false); reset(); }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.btnPrimary}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ================================================================
// STYLES
// ================================================================

const styles: Record<string, React.CSSProperties> = {
  page:        { padding: "32px", maxWidth: "1200px", margin: "0 auto", fontFamily: "'JetBrains Mono', monospace" },
  pageHeader:  { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" },
  pageTitle:   { fontSize: "24px", fontWeight: "700", color: "#e2e2e8", margin: 0 },
  grid:        { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" },
  card:        { backgroundColor: "#1a1a24", border: "1px solid #2a2a3a", borderRadius: "8px", display: "flex", flexDirection: "column" },
  cardBody:    { padding: "20px", flex: 1 },
  cardTitle:   { fontSize: "16px", fontWeight: "700", color: "#e2e2e8", margin: "0 0 8px" },
  cardDesc:    { fontSize: "13px", color: "#5a5a72", margin: "0 0 12px", lineHeight: "1.5" },
  cardDate:    { fontSize: "11px", color: "#3a3a52" },
  cardFooter:  { padding: "12px 20px", borderTop: "1px solid #2a2a3a", display: "flex", gap: "8px" },
  emptyState:  { textAlign: "center", padding: "80px 20px", color: "#5a5a72", display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" },
  stateText:   { color: "#5a5a72", fontSize: "14px" },
  errorText:   { color: "#ff4d6d", fontSize: "14px" },
  overlay:     { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal:       { backgroundColor: "#1a1a24", border: "1px solid #2a2a3a", borderRadius: "8px", padding: "32px", width: "100%", maxWidth: "440px" },
  modalTitle:  { fontSize: "18px", fontWeight: "700", color: "#e2e2e8", margin: "0 0 24px" },
  modalActions:{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" },
  form:        { display: "flex", flexDirection: "column", gap: "16px" },
  field:       { display: "flex", flexDirection: "column", gap: "6px" },
  label:       { fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#5a5a72" },
  input:       { backgroundColor: "#0f0f14", border: "1px solid #2a2a3a", borderRadius: "4px", padding: "10px 12px", fontSize: "13px", color: "#e2e2e8", outline: "none", fontFamily: "inherit" },
  fieldError:  { fontSize: "11px", color: "#ff4d6d" },
  errorBanner: { backgroundColor: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.3)", borderRadius: "4px", padding: "10px 14px", fontSize: "12px", color: "#ff4d6d", marginBottom: "16px" },
  btnPrimary:  { padding: "10px 18px", backgroundColor: "#e8ff47", color: "#0f0f14", border: "none", borderRadius: "4px", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" },
  btnSecondary:{ padding: "10px 18px", backgroundColor: "transparent", color: "#e2e2e8", border: "1px solid #2a2a3a", borderRadius: "4px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" },
  btnDanger:   { padding: "10px 18px", backgroundColor: "transparent", color: "#ff4d6d", border: "1px solid rgba(255,77,109,0.3)", borderRadius: "4px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" },
};
