import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import sprintsApi from "../api/sprints.api";
import { useAuth } from "../context/AuthContext";
import type { Sprint, SprintStatus } from "../types";

const createSprintSchema = z.object({
  name: z.string().min(1, "Name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  projectId: z.string().min(1, "Project ID is required"),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});

type CreateSprintForm = z.infer<typeof createSprintSchema>;

const statusMeta: Record<SprintStatus, { chip: string; track: string; fill: string; progress: number }> = {
  PLANNED: {
    chip: "border-slate-300 bg-slate-100 text-slate-700",
    track: "bg-slate-200",
    fill: "bg-gradient-to-r from-slate-500 to-slate-600",
    progress: 18,
  },
  ACTIVE: {
    chip: "border-cyan-200 bg-cyan-50 text-cyan-700",
    track: "bg-cyan-100",
    fill: "bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500",
    progress: 58,
  },
  COMPLETED: {
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
    track: "bg-emerald-100",
    fill: "bg-gradient-to-r from-emerald-500 to-teal-500",
    progress: 100,
  },
  CANCELLED: {
    chip: "border-rose-200 bg-rose-50 text-rose-700",
    track: "bg-rose-100",
    fill: "bg-gradient-to-r from-rose-500 to-pink-500",
    progress: 10,
  },
};

function toFormattedDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function SprintsPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId") ?? undefined;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["sprints", projectId],
    queryFn: () => sprintsApi.list({ projectId }),
  });

  const sprints = data?.content ?? [];

  const createMutation = useMutation({
    mutationFn: sprintsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
      setShowModal(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: sprintsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sprints"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: SprintStatus }) =>
      sprintsApi.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sprints"] }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateSprintForm>({
    resolver: zodResolver(createSprintSchema),
    defaultValues: { projectId: projectId ?? "" },
  });

  const onSubmit = (formData: CreateSprintForm) => createMutation.mutate(formData);

  return (
    <motion.div
      className="mx-auto max-w-6xl space-y-4 pb-2"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <section className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-950 via-indigo-900 to-blue-900 p-5 text-indigo-50 shadow-[0_24px_58px_-34px_rgba(49,46,129,0.88)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <button
              type="button"
              className="mb-2 inline-flex items-center rounded-lg border border-indigo-300/30 bg-indigo-400/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-indigo-100 transition-colors hover:bg-indigo-400/20"
              onClick={() => navigate("/projects")}
            >
              Back to Projects
            </button>
            <h1 className="text-3xl font-bold tracking-tight">Sprints</h1>
            {projectId ? <p className="mt-1 text-sm text-indigo-200/90">Filtered by project {projectId}</p> : null}
          </div>

          {hasRole("ADMIN", "MANAGER") ? (
            <button
              type="button"
              className="rounded-xl border border-indigo-200/40 bg-white/10 px-4 py-2 text-sm font-semibold text-indigo-50 transition-all hover:-translate-y-0.5 hover:bg-white/20"
              onClick={() => setShowModal(true)}
            >
              New Sprint
            </button>
          ) : null}
        </div>
      </section>

      {isLoading ? (
        <section className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          Loading sprints...
        </section>
      ) : null}

      {isError ? (
        <section className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Failed to load sprints.
        </section>
      ) : null}

      {!isLoading && sprints.length > 0 ? (
        <motion.section
          className="grid gap-3 md:grid-cols-2"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
          }}
        >
          {sprints.map((sprint: Sprint) => {
            const meta = statusMeta[sprint.status];
            const progress = sprint.velocity != null
              ? Math.max(meta.progress, Math.min(100, Math.round((sprint.velocity / 40) * 100)))
              : meta.progress;

            return (
              <motion.article
                key={sprint.id}
                className="rounded-2xl border border-indigo-100/80 bg-white/95 p-4 shadow-[0_16px_38px_-26px_rgba(49,46,129,0.42)]"
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ y: -4, boxShadow: "0 28px 54px -32px rgba(79,70,229,0.45)" }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className={["inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]", meta.chip].join(" ")}>
                      {sprint.status}
                    </span>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">{sprint.name}</h3>
                    <p className="mt-1 text-xs text-slate-600">{toFormattedDate(sprint.startDate)} to {toFormattedDate(sprint.endDate)}</p>
                  </div>

                  {sprint.velocity != null ? (
                    <span className="rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                      {sprint.velocity} pts
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                    <span>Progress signal</span>
                    <span>{progress}%</span>
                  </div>
                  <div className={["h-2 rounded-full", meta.track].join(" ")}>
                    <motion.div
                      className={["h-full rounded-full", meta.fill].join(" ")}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {hasRole("ADMIN", "MANAGER") && sprint.status === "PLANNED" ? (
                    <button
                      type="button"
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                      onClick={() => updateMutation.mutate({ id: sprint.id, status: "ACTIVE" })}
                    >
                      Start
                    </button>
                  ) : null}

                  {hasRole("ADMIN", "MANAGER") && sprint.status === "ACTIVE" ? (
                    <button
                      type="button"
                      className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                      onClick={() => updateMutation.mutate({ id: sprint.id, status: "COMPLETED" })}
                    >
                      Complete
                    </button>
                  ) : null}

                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                    onClick={() => navigate(`/stories?sprintId=${sprint.id}`)}
                  >
                    View Stories
                  </button>

                  {hasRole("ADMIN") ? (
                    <button
                      type="button"
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                      onClick={() => deleteMutation.mutate(sprint.id)}
                      disabled={deleteMutation.isPending}
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              </motion.article>
            );
          })}
        </motion.section>
      ) : null}

      {!isLoading && sprints.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/70 px-4 py-12 text-center text-slate-700">
          <p>No sprints found.</p>
          {hasRole("ADMIN", "MANAGER") ? (
            <button
              type="button"
              className="mt-3 rounded-xl border border-indigo-300 bg-white px-4 py-2 text-sm font-semibold text-indigo-700"
              onClick={() => setShowModal(true)}
            >
              Create first sprint
            </button>
          ) : null}
        </section>
      ) : null}

      <AnimatePresence>
        {showModal ? (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/58 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-xl rounded-2xl border border-indigo-100 bg-white p-5 shadow-[0_30px_70px_-36px_rgba(30,41,100,0.72)]"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <h2 className="text-xl font-semibold text-slate-900">New Sprint</h2>

              {createMutation.isError ? (
                <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {createMutation.error instanceof Error ? createMutation.error.message : "Failed to create sprint"}
                </div>
              ) : null}

              <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3" noValidate>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500" htmlFor="sprint-name">Sprint Name</label>
                  <input id="sprint-name" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" placeholder="Sprint 14" {...register("name")} />
                  {errors.name ? <p className="text-xs text-rose-600">{errors.name.message}</p> : null}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500" htmlFor="sprint-project-id">Project ID</label>
                  <input id="sprint-project-id" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" placeholder="Project UUID" {...register("projectId")} />
                  {errors.projectId ? <p className="text-xs text-rose-600">{errors.projectId.message}</p> : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500" htmlFor="sprint-start-date">Start Date</label>
                    <input id="sprint-start-date" type="date" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" {...register("startDate")} />
                    {errors.startDate ? <p className="text-xs text-rose-600">{errors.startDate.message}</p> : null}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500" htmlFor="sprint-end-date">End Date</label>
                    <input id="sprint-end-date" type="date" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" {...register("endDate")} />
                    {errors.endDate ? <p className="text-xs text-rose-600">{errors.endDate.message}</p> : null}
                  </div>
                </div>

                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
                    onClick={() => {
                      setShowModal(false);
                      reset();
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Creating..." : "Create"}
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
