import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";
import storiesApi from "../api/stories.api";
import { useAuth } from "../context/AuthContext";
import type { Story, StoryPriority, StoryStatus } from "../types";

const createStorySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  storyPoints: z.number().min(1).max(100).optional(),
  projectId: z.string().min(1, "Project ID is required"),
  sprintId: z.string().min(1, "Sprint ID is required"),
});

type CreateStoryForm = z.infer<typeof createStorySchema>;

const COLUMNS: StoryStatus[] = ["BACKLOG", "IN_PROGRESS", "IN_REVIEW", "DONE"];

const priorityStyles: Record<StoryPriority, string> = {
  LOW: "border-slate-300 bg-slate-100 text-slate-700",
  MEDIUM: "border-amber-300 bg-amber-100 text-amber-800",
  HIGH: "border-orange-300 bg-orange-100 text-orange-800",
  CRITICAL: "border-rose-300 bg-rose-100 text-rose-800",
};

const columnLabels: Record<StoryStatus, string> = {
  BACKLOG: "Backlog",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

const columnAccents: Record<StoryStatus, { header: string; count: string; marker: string }> = {
  BACKLOG: {
    header: "from-slate-100 to-slate-50",
    count: "bg-slate-200 text-slate-700",
    marker: "bg-slate-500",
  },
  IN_PROGRESS: {
    header: "from-cyan-100 to-sky-50",
    count: "bg-cyan-200 text-cyan-800",
    marker: "bg-cyan-500",
  },
  IN_REVIEW: {
    header: "from-violet-100 to-indigo-50",
    count: "bg-violet-200 text-violet-800",
    marker: "bg-violet-500",
  },
  DONE: {
    header: "from-emerald-100 to-teal-50",
    count: "bg-emerald-200 text-emerald-800",
    marker: "bg-emerald-500",
  },
};

export default function StoriesPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const [searchParams] = useSearchParams();
  const sprintId = searchParams.get("sprintId") ?? undefined;
  const projectId = searchParams.get("projectId") ?? undefined;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["stories", sprintId, projectId],
    queryFn: () => storiesApi.list({ sprintId, projectId }),
  });
  const stories = data?.content ?? [];

  const createMutation = useMutation<Story, Error, CreateStoryForm>({
    mutationFn: storiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      setShowModal(false);
      reset();
    },
  });

  const updateMutation = useMutation<Story, Error, { id: string; status: StoryStatus }>({
    mutationFn: ({ id, status }: { id: string; status: StoryStatus }) =>
      storiesApi.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stories"] }),
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: storiesApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stories"] }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateStoryForm>({
    resolver: zodResolver(createStorySchema),
    defaultValues: {
      sprintId: sprintId ?? "",
      projectId: projectId ?? "",
      priority: "MEDIUM",
    },
  });

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

  const onSubmit = (formData: CreateStoryForm) => createMutation.mutate(formData);

  const deletingStoryId = deleteMutation.isPending ? deleteMutation.variables : null;
  const updatingStoryId = updateMutation.isPending ? updateMutation.variables?.id : null;

  const closeModal = () => {
    setShowModal(false);
    reset();
  };

  const storiesByStatus = COLUMNS.reduce<Record<StoryStatus, Story[]>>(
    (accumulator, status) => {
      accumulator[status] = stories.filter((story: Story) => story.status === status);
      return accumulator;
    },
    { BACKLOG: [], IN_PROGRESS: [], IN_REVIEW: [], DONE: [] }
  );

  const moveStory = (story: Story, direction: "forward" | "backward") => {
    if (updateMutation.isPending) {
      return;
    }

    const currentIndex = COLUMNS.indexOf(story.status);
    const nextIndex = direction === "forward" ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex >= COLUMNS.length) {
      return;
    }

    updateMutation.mutate({ id: story.id, status: COLUMNS[nextIndex] });
  };

  const onDeleteStory = (story: Story) => {
    const shouldDelete = window.confirm(`Delete story "${story.title}"?`);
    if (!shouldDelete) {
      return;
    }

    deleteMutation.mutate(story.id);
  };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <section className="rounded-2xl border border-indigo-100 bg-white/90 p-5 shadow-[0_18px_45px_-30px_rgba(30,41,100,0.45)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">Delivery Board</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Stories</h1>
            {sprintId ? <p className="mt-1 text-sm text-slate-600">Sprint {sprintId}</p> : null}
          </div>

          {hasRole("ADMIN", "MANAGER") ? (
            <button
              type="button"
              className="rounded-xl border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_-18px_rgba(79,70,229,0.95)] transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
              onClick={() => setShowModal(true)}
            >
              New Story
            </button>
          ) : null}
        </div>
      </section>

      {isLoading ? <p className="text-sm text-slate-600">Loading stories...</p> : null}
      {isError ? <p className="text-sm text-rose-700">Failed to load stories.</p> : null}

      <motion.section
        className="grid gap-3 xl:grid-cols-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
        }}
      >
        {COLUMNS.map((status) => {
          const accent = columnAccents[status];

          return (
            <motion.div
              key={status}
              className="overflow-hidden rounded-2xl border border-indigo-100 bg-white/90 shadow-[0_16px_34px_-26px_rgba(49,46,129,0.4)]"
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            >
              <div className={["flex items-center justify-between border-b border-indigo-100 bg-gradient-to-r px-3.5 py-3", accent.header].join(" ")}>
                <div className="flex items-center gap-2">
                  <span className={["h-2.5 w-2.5 rounded-full", accent.marker].join(" ")} />
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">{columnLabels[status]}</span>
                </div>
                <span className={["rounded-full px-2 py-0.5 text-xs font-semibold", accent.count].join(" ")}>
                  {storiesByStatus[status].length}
                </span>
              </div>

              <div className="flex min-h-[14rem] flex-col gap-2.5 p-2.5">
                {storiesByStatus[status].map((story: Story, index) => (
                  <motion.div
                    key={story.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/90 p-3 shadow-[0_10px_25px_-20px_rgba(15,23,42,0.55)]"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: Math.min(index * 0.03, 0.14) }}
                    whileHover={{ y: -2 }}
                    drag
                    dragElastic={0.08}
                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    whileDrag={{ scale: 1.03, rotate: 1.2, boxShadow: "0 26px 40px -26px rgba(30,41,100,0.6)" }}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className={["rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]", priorityStyles[story.priority]].join(" ")}>
                        {story.priority}
                      </span>
                      {story.storyPoints != null ? (
                        <span className="rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                          {story.storyPoints} pts
                        </span>
                      ) : null}
                    </div>

                    <p className="text-sm font-semibold leading-5 text-slate-900">{story.title}</p>

                    {story.description ? (
                      <p className="mt-1 text-xs leading-5 text-slate-600">{story.description}</p>
                    ) : null}

                    {story.assigneeEmail ? (
                      <p className="mt-2 text-[11px] font-medium text-indigo-700">Assigned to {story.assigneeEmail}</p>
                    ) : null}

                    {hasRole("ADMIN", "MANAGER", "DEVELOPER") ? (
                      <div className="mt-2.5 flex items-center gap-1.5 border-t border-slate-200 pt-2.5">
                        {status !== "BACKLOG" ? (
                          <button
                            type="button"
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                            onClick={() => moveStory(story, "backward")}
                            disabled={updatingStoryId === story.id}
                          >
                            Prev
                          </button>
                        ) : null}

                        {status !== "DONE" ? (
                          <button
                            type="button"
                            className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
                            onClick={() => moveStory(story, "forward")}
                            disabled={updatingStoryId === story.id}
                          >
                            Next
                          </button>
                        ) : null}

                        {hasRole("ADMIN", "MANAGER") ? (
                          <button
                            type="button"
                            className="ml-auto rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                            onClick={() => onDeleteStory(story)}
                            disabled={deletingStoryId === story.id}
                          >
                            {deletingStoryId === story.id ? "..." : "Delete"}
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </motion.div>
                ))}

                {storiesByStatus[status].length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-6 text-center text-xs text-slate-500">
                    No stories
                  </div>
                ) : null}
              </div>
            </motion.div>
          );
        })}
      </motion.section>

      <AnimatePresence>
        {showModal ? (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/58 p-4 backdrop-blur-sm"
            role="presentation"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                closeModal();
              }
            }}
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
              <h2 className="text-xl font-semibold text-slate-900">New Story</h2>

              {createMutation.isError ? (
                <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {createMutation.error instanceof Error ? createMutation.error.message : "Failed to create story"}
                </div>
              ) : null}

              <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3" noValidate>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500" htmlFor="story-title">Title</label>
                  <input id="story-title" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" placeholder="As a user I want to..." {...register("title")} />
                  {errors.title ? <p className="text-xs text-rose-600">{errors.title.message}</p> : null}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500" htmlFor="story-description">Description</label>
                  <textarea id="story-description" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" style={{ minHeight: "80px", resize: "vertical" }} {...register("description")} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500" htmlFor="story-priority">Priority</label>
                    <select id="story-priority" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" {...register("priority")}>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500" htmlFor="story-points">Story Points</label>
                    <input
                      id="story-points"
                      type="number"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                      placeholder="5"
                      {...register("storyPoints", {
                        setValueAs: (value) => {
                          if (value === "" || value == null) {
                            return undefined;
                          }

                          const parsed = Number(value);
                          return Number.isNaN(parsed) ? undefined : parsed;
                        },
                      })}
                    />
                    {errors.storyPoints ? <p className="text-xs text-rose-600">{errors.storyPoints.message}</p> : null}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500" htmlFor="story-sprint-id">Sprint ID</label>
                  <input id="story-sprint-id" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" placeholder="Sprint UUID" {...register("sprintId")} />
                  {errors.sprintId ? <p className="text-xs text-rose-600">{errors.sprintId.message}</p> : null}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500" htmlFor="story-project-id">Project ID</label>
                  <input id="story-project-id" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" placeholder="Project UUID" {...register("projectId")} />
                  {errors.projectId ? <p className="text-xs text-rose-600">{errors.projectId.message}</p> : null}
                </div>

                <div className="mt-2 flex justify-end gap-2">
                  <button type="button" className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="rounded-xl border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-semibold text-white" disabled={createMutation.isPending}>
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
