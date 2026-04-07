import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import projectsApi from "../api/projects.api";
import { useAuth } from "../context/AuthContext";
import type { Project } from "../types";
import "./ProjectsPage.css";

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
  const [searchQuery, setSearchQuery] = useState("");
  const canCreate = hasRole("ADMIN", "MANAGER");
  const canDelete = hasRole("ADMIN");

  // ── Fetch all projects ──────────────────────────────────────
  // queryKey: ["projects"] — used to invalidate this query after mutations
  // TanStack Query caches this result for staleTime (5 min from main.tsx)
  const { data, isLoading, isError } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.list,
  });
  const projects = data?.content ?? [];

  // ── Create project ──────────────────────────────────────────
  const createMutation = useMutation<Project, Error, CreateProjectForm>({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      // Tell TanStack Query the "projects" list is stale → refetch automatically
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowModal(false);
      reset();
    },
  });

  // ── Delete project ──────────────────────────────────────────
  const deleteMutation = useMutation<void, Error, string>({
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

  const filteredProjects = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) {
      return projects;
    }

    return projects.filter((project) =>
      `${project.name} ${project.description}`.toLowerCase().includes(term),
    );
  }, [projects, searchQuery]);

  const deletingProjectId = deleteMutation.isPending ? deleteMutation.variables : null;

  useEffect(() => {
    if (!showModal) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowModal(false);
        reset();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showModal, reset]);

  const closeModal = () => {
    setShowModal(false);
    reset();
  };

  const openModal = () => {
    setShowModal(true);
  };

  const handleDelete = (project: Project) => {
    const shouldDelete = window.confirm(`Delete project "${project.name}"? This action cannot be undone.`);
    if (!shouldDelete) {
      return;
    }

    deleteMutation.mutate(project.id);
  };

  const formatDate = (isoDate: string) => {
    const value = new Date(isoDate);
    if (Number.isNaN(value.getTime())) {
      return "Unknown date";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(value);
  };

  // ================================================================
  // RENDER
  // ================================================================

  return (
    <motion.div
      className="projects-shell"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <div className="projects-atmosphere" aria-hidden="true" />

      <motion.section className="projects-header-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }}>
        <div>
          <p className="projects-kicker">Delivery cockpit</p>
          <h1 className="projects-title">Projects</h1>
          <p className="projects-subtitle">Track every initiative and jump directly into sprint planning.</p>
        </div>

        <div className="projects-toolbar">
          <label className="projects-search" htmlFor="project-search">
            <span className="projects-search-label">Search</span>
            <input
              id="project-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Filter by name or description"
            />
          </label>

          {canCreate && (
            <button type="button" className="projects-btn-primary" onClick={openModal}>
              New Project
            </button>
          )}
        </div>

        <div className="projects-metrics" aria-live="polite">
          <span className="projects-metric-chip">Total {projects.length}</span>
          <span className="projects-metric-chip">Visible {filteredProjects.length}</span>
        </div>
      </motion.section>

      {isError && (
        <section className="projects-feedback projects-feedback-error" role="alert">
          <p>Failed to load projects. Check gateway and project-service health, then retry.</p>
          <button
            type="button"
            className="projects-btn-secondary"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["projects"] })}
          >
            Retry
          </button>
        </section>
      )}

      {isLoading && (
        <motion.section className="projects-grid" aria-label="Loading projects" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <motion.article
              key={index}
              className="project-card project-card-skeleton"
              aria-hidden="true"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.16), duration: 0.2 }}
            >
              <div className="project-skeleton-line project-skeleton-title" />
              <div className="project-skeleton-line" />
              <div className="project-skeleton-line project-skeleton-short" />
            </motion.article>
          ))}
        </motion.section>
      )}

      {!isLoading && !isError && filteredProjects.length > 0 && (
        <motion.section
          className="projects-grid"
          aria-label="Projects list"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
          }}
        >
          {filteredProjects.map((project) => (
            <motion.article
              key={project.id}
              className="project-card"
              variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" } } }}
              whileHover={{ y: -4 }}
            >
              <div className="project-card-body">
                <div className="project-card-heading-row">
                  <h2>{project.name}</h2>
                  <span className="project-card-date">{formatDate(project.createdAt)}</span>
                </div>
                <p>{project.description}</p>
              </div>

              <div className="project-card-actions">
                <button
                  type="button"
                  className="projects-btn-secondary"
                  onClick={() => navigate(`/sprints?projectId=${project.id}`)}
                >
                  Open Sprints
                </button>

                {canDelete && (
                  <button
                    type="button"
                    className="projects-btn-danger"
                    onClick={() => handleDelete(project)}
                    disabled={deletingProjectId === project.id}
                  >
                    {deletingProjectId === project.id ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>
            </motion.article>
          ))}
        </motion.section>
      )}

      {!isLoading && !isError && filteredProjects.length === 0 && (
        <section className="projects-feedback projects-feedback-empty">
          {projects.length === 0 ? (
            <>
              <h2>No projects yet</h2>
              <p>Create your first project to start planning sprints.</p>
              {canCreate && (
                <button type="button" className="projects-btn-primary" onClick={openModal}>
                  Create first project
                </button>
              )}
            </>
          ) : (
            <>
              <h2>No matches found</h2>
              <p>Try another keyword or clear the search filter.</p>
              <button type="button" className="projects-btn-secondary" onClick={() => setSearchQuery("")}>
                Clear search
              </button>
            </>
          )}
        </section>
      )}

      <AnimatePresence>
        {showModal ? (
          <motion.div
            className="project-modal-overlay"
            role="presentation"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                closeModal();
              }
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <motion.div
              className="project-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-modal-title"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
            <h2 id="project-modal-title">Create project</h2>

            {createMutation.isError && (
              <div className="project-modal-error" role="alert">
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : "Failed to create project"}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="project-modal-form" noValidate>
              <div className="project-form-field">
                <label htmlFor="project-name">Name</label>
                <input id="project-name" placeholder="Checkout Revamp" {...register("name")} />
                {errors.name && <span className="project-field-error">{errors.name.message}</span>}
              </div>

              <div className="project-form-field">
                <label htmlFor="project-description">Description</label>
                <textarea
                  id="project-description"
                  placeholder="Summarize goals and scope"
                  {...register("description")}
                />
                {errors.description && <span className="project-field-error">{errors.description.message}</span>}
              </div>

              <div className="project-modal-actions">
                <button type="button" className="projects-btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="projects-btn-primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create project"}
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
