import React from "react";
import { Task } from "@/types";
import { format, isPast, isToday } from "date-fns";
import styles from "@/styles/Dashboard.module.css";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const dueDate = new Date(task.dueDate);
  const isOverdue =
    isPast(dueDate) && !isToday(dueDate) && task.status === "pending";
  const isDueToday = isToday(dueDate);

  return (
    <div
      className={`${styles.taskCard} ${task.status === "completed" ? styles.completed : ""} ${isOverdue ? styles.overdue : ""}`}
    >
      <div className={styles.taskTop}>
        <button
          className={`${styles.statusToggle} ${task.status === "completed" ? styles.checked : ""}`}
          onClick={() => onToggleStatus(task)}
          aria-label={`Mark as ${task.status === "completed" ? "pending" : "completed"}`}
        >
          {task.status === "completed" && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 7l3.5 3.5L12 4"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
        <div className={styles.taskContent}>
          <h3 className={styles.taskTitle}>{task.title}</h3>
          {task.description && (
            <p className={styles.taskDesc}>{task.description}</p>
          )}
        </div>
      </div>

      <div className={styles.taskBottom}>
        <div className={styles.taskMeta}>
          <span className={`${styles.badge} ${styles[task.status]}`}>
            {task.status === "completed" ? "✓ Completed" : "◷ Pending"}
          </span>
          <span
            className={`${styles.dueDate} ${isOverdue ? styles.overdueBadge : ""} ${isDueToday ? styles.todayBadge : ""}`}
          >
            {isOverdue ? "⚠ Overdue: " : isDueToday ? "📅 Today: " : "📅 "}
            {format(dueDate, "MMM dd, yyyy")}
          </span>
        </div>
        <div className={styles.taskActions}>
          <button
            className={styles.editBtn}
            onClick={() => onEdit(task)}
            aria-label="Edit task"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25a1.75 1.75 0 01.445-.758l8.61-8.61z" />
            </svg>
          </button>
          <button
            className={styles.deleteBtn}
            onClick={() => onDelete(task._id)}
            aria-label="Delete task"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2.5 1a1 1 0 00-1 1v1a1 1 0 001 1H3v9a2 2 0 002 2h6a2 2 0 002-2V4h.5a1 1 0 001-1V2a1 1 0 00-1-1H10a1 1 0 00-1-1H7a1 1 0 00-1 1H2.5zm3 4a.5.5 0 01.5.5v7a.5.5 0 01-1 0v-7a.5.5 0 01.5-.5zM8 5a.5.5 0 01.5.5v7a.5.5 0 01-1 0v-7A.5.5 0 018 5zm3 .5v7a.5.5 0 01-1 0v-7a.5.5 0 011 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
