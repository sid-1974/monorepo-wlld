import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAuth } from "@/context/AuthContext";
import { taskApi } from "@/lib";
import { TaskModal, TaskCard } from "@/components";
import { Task, TaskFormData, TaskFilter } from "@/types";
import styles from "@/styles/Dashboard.module.css";

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await taskApi.getAll({
        status: filter,
        from: dateFrom,
        to: dateTo,
      });
      setTasks(res.data.data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [filter, dateFrom, dateTo]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated, fetchTasks]);

  // Handlers with optimistic updates
  const handleCreate = async (data: TaskFormData) => {
    const res = await taskApi.create(data);
    // Optimistic: add to list immediately
    setTasks((prev) => [res.data.data, ...prev]);
  };

  const handleUpdate = async (data: TaskFormData) => {
    if (!editingTask) return;
    const res = await taskApi.update(editingTask._id, data);
    // Optimistic: update in list
    setTasks((prev) =>
      prev.map((t) => (t._id === editingTask._id ? res.data.data : t)),
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    // Optimistic: remove from list immediately
    const prevTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t._id !== id));
    try {
      await taskApi.delete(id);
    } catch {
      // Revert on failure
      setTasks(prevTasks);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    // Optimistic: toggle in list
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t)),
    );
    try {
      await taskApi.update(task._id, { status: newStatus });
    } catch {
      // Revert on failure
      setTasks((prev) =>
        prev.map((t) =>
          t._id === task._id ? { ...t, status: task.status } : t,
        ),
      );
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  // Stats
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status === "pending").length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;

  if (authLoading) return null;
  if (!isAuthenticated) return null;

  return (
    <>
      <Head>
        <title>Dashboard - TaskTracker</title>
        <meta
          name="description"
          content="View and manage your tasks from the dashboard."
        />
      </Head>

      {/* Header */}
      <div className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.dashboardTitle}>
            Good {getGreeting()}, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className={styles.dashboardSubtitle}>
            {totalTasks === 0
              ? "No tasks yet. Create your first one!"
              : `You have ${pendingTasks} pending task${pendingTasks !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          className={styles.addTaskBtn}
          onClick={openCreateModal}
          id="add-task-btn"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
          </svg>
          New Task
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Tasks</div>
          <div className={styles.statValue}>{totalTasks}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Pending</div>
          <div className={styles.statValuePending}>{pendingTasks}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Completed</div>
          <div className={styles.statValueDone}>{completedTasks}</div>
        </div>
      </div>

      {/* Filter */}
      <div className={styles.filterSection}>
        <div className={styles.filterBar}>
          {(["all", "pending", "completed"] as TaskFilter[]).map((f) => (
            <button
              key={f}
              className={
                filter === f ? styles.filterBtnActive : styles.filterBtn
              }
              onClick={() => setFilter(f)}
              id={`filter-${f}`}
            >
              {f === "all"
                ? "All Tasks"
                : f === "pending"
                  ? "◷ Pending"
                  : "✓ Completed"}
            </button>
          ))}
        </div>

        <div className={styles.dateFilterContainer}>
          <div className={styles.dateInputGroup}>
            <label htmlFor="dateFrom">From:</label>
            <input
              type="date"
              id="dateFrom"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={styles.dateInput}
            />
          </div>
          <div className={styles.dateInputGroup}>
            <label htmlFor="dateTo">To:</label>
            <input
              type="date"
              id="dateTo"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={styles.dateInput}
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              className={styles.clearFilterBtn}
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
        </div>
      ) : tasks.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <h3 className={styles.emptyTitle}>
            {filter !== "all" ? `No ${filter} tasks` : "No tasks yet"}
          </h3>
          <p className={styles.emptySubtitle}>
            {filter !== "all"
              ? "Try changing the filter or create a new task."
              : 'Click "New Task" to create your first task and start staying organized.'}
          </p>
        </div>
      ) : (
        <div className={styles.taskGrid}>
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={openEditModal}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleUpdate : handleCreate}
        task={editingTask}
      />
    </>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
