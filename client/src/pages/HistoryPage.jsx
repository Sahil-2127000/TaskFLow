import React, { useState, useEffect } from 'react';
import AppShell from '../components/layout/AppShell';
import TaskRow from '../components/tasks/TaskRow';
import TaskModal from '../components/tasks/TaskModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { todoService, categoryService } from '../services';
import toast from 'react-hot-toast';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';

const HistoryPage = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [collapsedDates, setCollapsedDates] = useState({});

  const toggleDateCollapse = (dateKey) => {
    setCollapsedDates((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);

      const [catRes, taskRes] = await Promise.all([
        categoryService.getAllCategories(),
        todoService.getAllTodos(),
      ]);

      setCategories(catRes?.data || []);
      setTasks(taskRes?.data || []);
    } catch (err) {
      console.error('Error fetching history:', err);
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Group tasks by formatted date (e.g. "September 16, 2026")
  const groupedTasks = tasks.reduce((acc, task) => {
    const rawDate = task.taskDate || task.createdAt;
    const dateKey = rawDate ? format(new Date(rawDate), 'yyyy-MM-dd') : 'No Date';

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(task);
    return acc;
  }, {});

  // Sorted date keys (most recent first)
  const sortedDateKeys = Object.keys(groupedTasks).sort((a, b) => new Date(b) - new Date(a));

  const formatHeaderDate = (dateKey) => {
    if (dateKey === 'No Date') return 'Undated Tasks';
    try {
      const d = parseISO(dateKey);
      if (isToday(d)) return `Today — ${format(d, 'MMMM d')}`;
      if (isYesterday(d)) return `Yesterday — ${format(d, 'MMMM d')}`;
      return format(d, 'MMMM d, yyyy');
    } catch {
      return dateKey;
    }
  };

  // Toggle status
  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, status: nextStatus } : t))
    );

    try {
      await todoService.updateTodo(task._id, { status: nextStatus });
    } catch {
      toast.error('Failed to update status');
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, status: task.status } : t))
      );
    }
  };

  // Save task
  const handleSaveTask = async (taskData) => {
    try {
      if (selectedTask) {
        const res = await todoService.updateTodo(selectedTask._id, taskData);
        if (res?.success) {
          toast.success('Task updated!');
          setTasks((prev) =>
            prev.map((t) => (t._id === selectedTask._id ? res.data : t))
          );
        }
      }
    } catch (err) {
      toast.error('Error saving task');
      throw err;
    }
  };

  // Delete task
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await todoService.deleteTodo(taskToDelete._id);
      toast.success('Task deleted');
      setTasks((prev) => prev.filter((t) => t._id !== taskToDelete._id));
      setTaskToDelete(null);
    } catch {
      toast.error('Failed to delete task');
    }
  };

  return (
    <AppShell>
      {loading ? (
        <div className="bg-surface rounded-card p-12 text-center text-sm text-muted shadow-card border border-border">
          Loading history...
        </div>
      ) : sortedDateKeys.length === 0 ? (
        <div className="bg-surface rounded-card shadow-card border border-border">
          <EmptyState
            title="No history yet"
            subtitle="As you complete and schedule tasks each day, they will appear chronologically here."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {sortedDateKeys.map((dateKey) => {
            const dayTasks = groupedTasks[dateKey];
            const completedCount = dayTasks.filter((t) => t.status === 'completed').length;
            const total = dayTasks.length;

            const isCollapsed = !!collapsedDates[dateKey];

            return (
              <div
                key={dateKey}
                className="bg-surface rounded-card shadow-card border border-border overflow-hidden transition-all duration-200"
              >
                {/* Date Group Header — Clickable accordion toggle */}
                <button
                  type="button"
                  onClick={() => toggleDateCollapse(dateKey)}
                  className={`w-full px-4 py-3 sm:px-5 sm:py-3.5 bg-[#FAFAFD] hover:bg-gray-100/70 transition flex items-center justify-between text-left select-none ${
                    !isCollapsed ? 'border-b border-border' : ''
                  }`}
                  aria-expanded={!isCollapsed}
                >
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={16} className="text-brand shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-ink">
                      {formatHeaderDate(dateKey)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] sm:text-xs font-medium text-muted">
                      {completedCount} / {total} completed
                    </span>
                    <div
                      className={`p-1 rounded-md text-muted hover:text-ink transition-transform duration-200 ${
                        isCollapsed ? '-rotate-90' : 'rotate-0'
                      }`}
                    >
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </button>

                {/* Day Tasks List */}
                {!isCollapsed && (
                  <div className="animate-fade">
                    {dayTasks.map((task) => (
                      <TaskRow
                        key={task._id}
                        task={task}
                        onToggleStatus={handleToggleStatus}
                        onEdit={(t) => {
                          setSelectedTask(t);
                          setIsTaskModalOpen(true);
                        }}
                        onDelete={(t) => setTaskToDelete(t)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleSaveTask}
        task={selectedTask}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!taskToDelete}
        title="Delete this task?"
        message={`"${taskToDelete?.taskName}" will be removed permanently.`}
        onConfirm={handleDeleteTask}
        onCancel={() => setTaskToDelete(null)}
      />
    </AppShell>
  );
};

export default HistoryPage;
