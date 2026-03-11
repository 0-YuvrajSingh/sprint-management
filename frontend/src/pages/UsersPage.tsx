import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import sprintsApi from "../api/sprints.api";
import { useAuth } from "../context/AuthContext";
import type { Sprint, SprintStatus } from "../types";

// ================================================================
// SCHEMA
// ================================================================

const createSprintSchema = z.object({
  name:       z.string().min(1, "Name is required"),
  startDate:  z.string().min(1, "Start date is required"),
  endDate:    z.string().min(1, "End date is required"),
  projectId:  z.string().min(1, "Project ID is required"),
}).refine((d) => new Date(d.endDate) > new Date(d.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});

type CreateSprintForm = z.infer<typeof createSprintSchema>;

// ================================================================
// STATUS BADGE COLORS
// ================================================================

const statusColors: Record<SprintStatus, string> = {
  PLANNED:   "#5a5a72",
  ACTIVE:    "#e8ff47",
  COMPLETED: "#47ff8a",
  CANCELLED: "#ff4d6d",
};

// ================================================================
// COMPONENT
// ================================================================

export default function SprintsPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  // Read projectId from URL query params: /sprints?projectId=abc-123
  // This is how ProjectsPage navigates here
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId") ?? undefined;

  // ── Fetch sprints ───────────────────────────────────────────
  // queryKey includes projectId so different projects have separate caches
  const { data, isLoading, isError } = useQuery({
    queryKey: ["sprints", projectId],
    queryFn: () => sprintsApi.list({ projectId }),
  });

  const sprints = data?.content ?? [];

  // ── Create sprint ───────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: sprintsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
      setShowModal(false);
      reset();
    },
  });

  // ── Delete sprint ───────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: sprintsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sprints"] }),
  });

  // ── Update status ───────────────────────────────────────────
  // Quick status change without opening a full edit modal
  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: SprintStatus }) =>
      sprintsApi.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sprints"] }),
  });

  // ── Form ────────────────────────────────────────────────────
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateSprintForm>({
    resolver: zodResolver(createSprintSchema),
    defaultValues: { projectId: projectId ?? "" },
  });

  const onSubmit = (data: CreateSprintForm) => createMutation.mutate(data);

  // ================================================================
  // RENDER
  // ================================================================

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <button style={styles.backBtn} onClick={() => navigate("/projects")}>
            ← Projects
          </button>
          <h1 style={styles.pageTitle}>Sprints</h1>
          {projectId && <p style={styles.filterNote}>Filtered by project: {projectId}</p>}
        </div>
        {hasRole("ADMIN", "MANAGER") && (
          <button style={styles.btnPrimary} onClick={() => setShowModal(true)}>
            + New Sprint
          </button>
        )}
      </div>

      {/* States */}
      {isLoading && <p style={styles.stateText}>Loading sprints...</p>}
      {isError   && <p style={styles.errorText}>Failed to load sprints.</p>}

      {/* Sprint list */}
      <div style={styles.list}>
        {sprints.map((sprint: Sprint) => (
          <div key={sprint.id} style={styles.card}>
            <div style={styles.cardLeft}>
              <span
                style={{
                  ...styles.statusBadge,
                  color: statusColors[sprint.status],
                  borderColor: statusColors[sprint.status],
                }}
              >
                {sprint.status}
              </span>
              <div>
                <h3 style={styles.cardTitle}>{sprint.name}</h3>
                <p style={styles.cardDates}>
                  {new Date(sprint.startDate).toLocaleDateString()} →{" "}
                  {new Date(sprint.endDate).toLocaleDateString()}
                </p>
                {sprint.velocity != null && (
                  <p style={styles.velocity}>Velocity: {sprint.velocity} pts</p>
                )}
              </div>
            </div>

            <div style={styles.cardActions}>
              {/* Quick status transitions */}
              {hasRole("ADMIN", "MANAGER") && sprint.status === "PLANNED" && (
                <button
                  style={styles.btnSuccess}
                  onClick={() => updateMutation.mutate({ id: sprint.id, status: "ACTIVE" })}
                >
                  Start
                </button>
              )}
              {hasRole("ADMIN", "MANAGER") && sprint.status === "ACTIVE" && (
                <button
                  style={styles.btnSecondary}
                  onClick={() => updateMutation.mutate({ id: sprint.id, status: "COMPLETED" })}
                >
                  Complete
                </button>
              )}

              {/* Navigate to stories for this sprint */}
              <button
                style={styles.btnSecondary}
                onClick={() => navigate(`/stories?sprintId=${sprint.id}`)}
              >
                View Stories
              </button>

              {hasRole("ADMIN") && (
                <button
                  style={styles.btnDanger}
                  onClick={() => deleteMutation.mutate(sprint.id)}
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
      {!isLoading && sprints.length === 0 && (
        <div style={styles.emptyState}>
          <p>No sprints found.</p>
          {hasRole("ADMIN", "MANAGER") && (
            <button style={styles.btnPrimary} onClick={() => setShowModal(true)}>
              Create first sprint
            </button>
          )}
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>New Sprint</h2>

            {createMutation.isError && (
              <div style={styles.errorBanner}>
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : "Failed to create sprint"}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} style={styles.form} noValidate>
              <div style={styles.field}>
                <label style={styles.label}>Sprint Name</label>
                <input style={styles.input} placeholder="Sprint 1" {...register("name")} />
                {errors.name && <span style={styles.fieldError}>{errors.name.message}</span>}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Project ID</label>
                <input style={styles.input} placeholder="Project UUID" {...register("projectId")} />
                {errors.projectId && <span style={styles.fieldError}>{errors.projectId.message}</span>}
              </div>

              <div style={styles.row}>
                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>Start Date</label>
                  <input type="date" style={styles.input} {...register("startDate")} />
                  {errors.startDate && <span style={styles.fieldError}>{errors.startDate.message}</span>}
                </div>
                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>End Date</label>
                  <input type="date" style={styles.input} {...register("endDate")} />
                  {errors.endDate && <span style={styles.fieldError}>{errors.endDate.message}</span>}
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="button" style={styles.btnSecondary} onClick={() => { setShowModal(false); reset(); }}>
                  Cancel
                </button>
                <button type="submit" style={styles.btnPrimary} disabled={createMutation.isPending}>
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
  page:        { padding: "32px", maxWidth: "1000px", margin: "0 auto", fontFamily: "'JetBrains Mono', monospace" },
  pageHeader:  { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" },
  pageTitle:   { fontSize: "24px", fontWeight: "700", color: "#e2e2e8", margin: "4px 0" },
  filterNote:  { fontSize: "11px", color: "#5a5a72", margin: "4px 0 0" },
  backBtn:     { background: "none", border: "none", color: "#5a5a72", fontSize: "12px", cursor: "pointer", padding: 0, marginBottom: "8px", fontFamily: "inherit" },
  list:        { display: "flex", flexDirection: "column", gap: "12px" },
  card:        { backgroundColor: "#1a1a24", border: "1px solid #2a2a3a", borderRadius: "8px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  cardLeft:    { display: "flex", alignItems: "center", gap: "16px" },
  cardTitle:   { fontSize: "15px", fontWeight: "700", color: "#e2e2e8", margin: "0 0 4px" },
  cardDates:   { fontSize: "12px", color: "#5a5a72", margin: 0 },
  velocity:    { fontSize: "11px", color: "#5a5a72", margin: "4px 0 0" },
  cardActions: { display: "flex", gap: "8px", alignItems: "center" },
  statusBadge: { fontSize: "10px", border: "1px solid", borderRadius: "2px", padding: "3px 8px", textTransform: "uppercase" as const, letterSpacing: "0.1em", whiteSpace: "nowrap" as const },
  emptyState:  { textAlign: "center", padding: "80px 20px", color: "#5a5a72", display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" },
  stateText:   { color: "#5a5a72", fontSize: "14px" },
  errorText:   { color: "#ff4d6d", fontSize: "14px" },
  overlay:     { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal:       { backgroundColor: "#1a1a24", border: "1px solid #2a2a3a", borderRadius: "8px", padding: "32px", width: "100%", maxWidth: "480px" },
  modalTitle:  { fontSize: "18px", fontWeight: "700", color: "#e2e2e8", margin: "0 0 24px" },
  modalActions:{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" },
  form:        { display: "flex", flexDirection: "column", gap: "16px" },
  row:         { display: "flex", gap: "12px" },
  field:       { display: "flex", flexDirection: "column", gap: "6px" },
  label:       { fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#5a5a72" },
  input:       { backgroundColor: "#0f0f14", border: "1px solid #2a2a3a", borderRadius: "4px", padding: "10px 12px", fontSize: "13px", color: "#e2e2e8", outline: "none", fontFamily: "inherit" },
  fieldError:  { fontSize: "11px", color: "#ff4d6d" },
  errorBanner: { backgroundColor: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.3)", borderRadius: "4px", padding: "10px 14px", fontSize: "12px", color: "#ff4d6d", marginBottom: "16px" },
  btnPrimary:  { padding: "10px 18px", backgroundColor: "#e8ff47", color: "#0f0f14", border: "none", borderRadius: "4px", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" },
  btnSecondary:{ padding: "10px 18px", backgroundColor: "transparent", color: "#e2e2e8", border: "1px solid #2a2a3a", borderRadius: "4px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" },
  btnSuccess:  { padding: "10px 18px", backgroundColor: "transparent", color: "#47ff8a", border: "1px solid rgba(71,255,138,0.3)", borderRadius: "4px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" },
  btnDanger:   { padding: "10px 18px", backgroundColor: "transparent", color: "#ff4d6d", border: "1px solid rgba(255,77,109,0.3)", borderRadius: "4px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" },
};
