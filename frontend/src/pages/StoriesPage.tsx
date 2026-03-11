import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import storiesApi from "../api/stories.api";
import { useAuth } from "../context/AuthContext";
import type { Story, StoryStatus, StoryPriority } from "../types";

// ================================================================
// SCHEMA
// ================================================================

const createStorySchema = z.object({
  title:       z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority:    z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  storyPoints: z.coerce.number().min(1).max(100).optional(),
  projectId:   z.string().min(1, "Project ID is required"),
  sprintId:    z.string().min(1, "Sprint ID is required"),
});

type CreateStoryForm = z.infer<typeof createStorySchema>;

// ================================================================
// CONSTANTS
// ================================================================

// Kanban columns — order matters
const COLUMNS: StoryStatus[] = ["BACKLOG", "IN_PROGRESS", "IN_REVIEW", "DONE"];

const priorityColors: Record<StoryPriority, string> = {
  LOW:      "#5a5a72",
  MEDIUM:   "#e8c547",
  HIGH:     "#ff8a47",
  CRITICAL: "#ff4d6d",
};

const columnLabels: Record<StoryStatus, string> = {
  BACKLOG:     "Backlog",
  IN_PROGRESS: "In Progress",
  IN_REVIEW:   "In Review",
  DONE:        "Done",
};

// ================================================================
// COMPONENT
// ================================================================

export default function StoriesPage() {
  const { hasRole, user } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  // Read sprintId and projectId from URL: /stories?sprintId=X&projectId=Y
  const [searchParams] = useSearchParams();
  const sprintId   = searchParams.get("sprintId")   ?? undefined;
  const projectId  = searchParams.get("projectId")  ?? undefined;

  // ── Fetch stories ───────────────────────────────────────────
  const { data: stories = [], isLoading, isError } = useQuery({
    queryKey: ["stories", sprintId, projectId],
    queryFn: () => storiesApi.list({ sprintId, projectId }),
  });

  // ── Create story ────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: storiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      setShowModal(false);
      reset();
    },
  });

  // ── Update story status (kanban drag/click) ─────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: StoryStatus }) =>
      storiesApi.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stories"] }),
  });

  // ── Delete story ────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: storiesApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stories"] }),
  });

  // ── Form ────────────────────────────────────────────────────
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateStoryForm>({
    resolver: zodResolver(createStorySchema),
    defaultValues: {
      sprintId:  sprintId  ?? "",
      projectId: projectId ?? "",
      priority:  "MEDIUM",
    },
  });

  const onSubmit = (data: CreateStoryForm) => createMutation.mutate(data);

  // Group stories by status for kanban columns
  const storiesByStatus = COLUMNS.reduce<Record<StoryStatus, Story[]>>(
    (acc, status) => {
      acc[status] = stories.filter((s: Story) => s.status === status);
      return acc;
    },
    { BACKLOG: [], IN_PROGRESS: [], IN_REVIEW: [], DONE: [] }
  );

  // Move story to next status column
  const moveStory = (story: Story, direction: "forward" | "backward") => {
    const currentIndex = COLUMNS.indexOf(story.status);
    const nextIndex = direction === "forward" ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex >= COLUMNS.length) return;
    updateMutation.mutate({ id: story.id, status: COLUMNS[nextIndex] });
  };

  // ================================================================
  // RENDER
  // ================================================================

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Stories</h1>
          {sprintId && <p style={styles.filterNote}>Sprint: {sprintId}</p>}
        </div>
        {hasRole("ADMIN", "MANAGER") && (
          <button style={styles.btnPrimary} onClick={() => setShowModal(true)}>
            + New Story
          </button>
        )}
      </div>

      {/* States */}
      {isLoading && <p style={styles.stateText}>Loading stories...</p>}
      {isError   && <p style={styles.errorText}>Failed to load stories.</p>}

      {/* Kanban board */}
      <div style={styles.board}>
        {COLUMNS.map((status) => (
          <div key={status} style={styles.column}>

            {/* Column header */}
            <div style={styles.columnHeader}>
              <span style={styles.columnTitle}>{columnLabels[status]}</span>
              <span style={styles.columnCount}>{storiesByStatus[status].length}</span>
            </div>

            {/* Story cards */}
            <div style={styles.columnCards}>
              {storiesByStatus[status].map((story: Story) => (
                <div key={story.id} style={styles.storyCard}>

                  {/* Priority + points */}
                  <div style={styles.storyMeta}>
                    <span style={{ ...styles.priorityBadge, color: priorityColors[story.priority] }}>
                      {story.priority}
                    </span>
                    {story.storyPoints != null && (
                      <span style={styles.points}>{story.storyPoints} pts</span>
                    )}
                  </div>

                  <p style={styles.storyTitle}>{story.title}</p>

                  {story.description && (
                    <p style={styles.storyDesc}>{story.description}</p>
                  )}

                  {story.assigneeEmail && (
                    <p style={styles.assignee}>→ {story.assigneeEmail}</p>
                  )}

                  {/* Move buttons — DEVELOPER and above */}
                  {hasRole("ADMIN", "MANAGER", "DEVELOPER") && (
                    <div style={styles.storyActions}>
                      {status !== "BACKLOG" && (
                        <button
                          style={styles.moveBtn}
                          onClick={() => moveStory(story, "backward")}
                        >
                          ←
                        </button>
                      )}
                      {status !== "DONE" && (
                        <button
                          style={styles.moveBtn}
                          onClick={() => moveStory(story, "forward")}
                        >
                          →
                        </button>
                      )}
                      {hasRole("ADMIN", "MANAGER") && (
                        <button
                          style={styles.deleteBtn}
                          onClick={() => deleteMutation.mutate(story.id)}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Empty column state */}
              {storiesByStatus[status].length === 0 && (
                <div style={styles.emptyColumn}>No stories</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>New Story</h2>

            {createMutation.isError && (
              <div style={styles.errorBanner}>
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : "Failed to create story"}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} style={styles.form} noValidate>
              <div style={styles.field}>
                <label style={styles.label}>Title</label>
                <input style={styles.input} placeholder="As a user I want to..." {...register("title")} />
                {errors.title && <span style={styles.fieldError}>{errors.title.message}</span>}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Description</label>
                <textarea style={{ ...styles.input, minHeight: "70px", resize: "vertical" }} {...register("description")} />
              </div>

              <div style={styles.row}>
                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>Priority</label>
                  <select style={styles.input} {...register("priority")}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>Story Points</label>
                  <input type="number" style={styles.input} placeholder="5" {...register("storyPoints")} />
                  {errors.storyPoints && <span style={styles.fieldError}>{errors.storyPoints.message}</span>}
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Sprint ID</label>
                <input style={styles.input} placeholder="Sprint UUID" {...register("sprintId")} />
                {errors.sprintId && <span style={styles.fieldError}>{errors.sprintId.message}</span>}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Project ID</label>
                <input style={styles.input} placeholder="Project UUID" {...register("projectId")} />
                {errors.projectId && <span style={styles.fieldError}>{errors.projectId.message}</span>}
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
  page:         { padding: "32px", fontFamily: "'JetBrains Mono', monospace", minHeight: "100vh", backgroundColor: "#0f0f14" },
  pageHeader:   { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" },
  pageTitle:    { fontSize: "24px", fontWeight: "700", color: "#e2e2e8", margin: "0 0 4px" },
  filterNote:   { fontSize: "11px", color: "#5a5a72", margin: 0 },
  board:        { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", alignItems: "start" },
  column:       { backgroundColor: "#1a1a24", border: "1px solid #2a2a3a", borderRadius: "8px", overflow: "hidden" },
  columnHeader: { padding: "12px 16px", borderBottom: "1px solid #2a2a3a", display: "flex", justifyContent: "space-between", alignItems: "center" },
  columnTitle:  { fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#5a5a72", fontWeight: "700" },
  columnCount:  { fontSize: "11px", color: "#3a3a52", backgroundColor: "#0f0f14", padding: "2px 8px", borderRadius: "10px" },
  columnCards:  { padding: "12px", display: "flex", flexDirection: "column", gap: "8px", minHeight: "200px" },
  storyCard:    { backgroundColor: "#0f0f14", border: "1px solid #2a2a3a", borderRadius: "6px", padding: "12px" },
  storyMeta:    { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  priorityBadge:{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase" as const, letterSpacing: "0.08em" },
  points:       { fontSize: "10px", color: "#5a5a72", backgroundColor: "#1a1a24", padding: "2px 6px", borderRadius: "10px" },
  storyTitle:   { fontSize: "12px", color: "#e2e2e8", margin: "0 0 4px", lineHeight: "1.4" },
  storyDesc:    { fontSize: "11px", color: "#5a5a72", margin: "0 0 6px", lineHeight: "1.4" },
  assignee:     { fontSize: "10px", color: "#5a5a72", margin: "4px 0 0" },
  storyActions: { display: "flex", gap: "4px", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #2a2a3a" },
  moveBtn:      { padding: "4px 10px", backgroundColor: "transparent", border: "1px solid #2a2a3a", borderRadius: "3px", color: "#e2e2e8", fontSize: "12px", cursor: "pointer", fontFamily: "inherit" },
  deleteBtn:    { padding: "4px 8px", backgroundColor: "transparent", border: "1px solid rgba(255,77,109,0.3)", borderRadius: "3px", color: "#ff4d6d", fontSize: "12px", cursor: "pointer", marginLeft: "auto", fontFamily: "inherit" },
  emptyColumn:  { textAlign: "center", padding: "20px", color: "#3a3a52", fontSize: "12px" },
  stateText:    { color: "#5a5a72", fontSize: "14px" },
  errorText:    { color: "#ff4d6d", fontSize: "14px" },
  overlay:      { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal:        { backgroundColor: "#1a1a24", border: "1px solid #2a2a3a", borderRadius: "8px", padding: "32px", width: "100%", maxWidth: "480px", maxHeight: "90vh", overflowY: "auto" },
  modalTitle:   { fontSize: "18px", fontWeight: "700", color: "#e2e2e8", margin: "0 0 24px" },
  modalActions: { display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" },
  form:         { display: "flex", flexDirection: "column", gap: "16px" },
  row:          { display: "flex", gap: "12px" },
  field:        { display: "flex", flexDirection: "column", gap: "6px" },
  label:        { fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#5a5a72" },
  input:        { backgroundColor: "#0f0f14", border: "1px solid #2a2a3a", borderRadius: "4px", padding: "10px 12px", fontSize: "13px", color: "#e2e2e8", outline: "none", fontFamily: "inherit" },
  fieldError:   { fontSize: "11px", color: "#ff4d6d" },
  errorBanner:  { backgroundColor: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.3)", borderRadius: "4px", padding: "10px 14px", fontSize: "12px", color: "#ff4d6d", marginBottom: "16px" },
  btnPrimary:   { padding: "10px 18px", backgroundColor: "#e8ff47", color: "#0f0f14", border: "none", borderRadius: "4px", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" },
  btnSecondary: { padding: "10px 18px", backgroundColor: "transparent", color: "#e2e2e8", border: "1px solid #2a2a3a", borderRadius: "4px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" },
};
