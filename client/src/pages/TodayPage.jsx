import React, { useState, useEffect } from 'react';
import AppShell from '../components/layout/AppShell';
import TaskRow from '../components/tasks/TaskRow';
import TaskModal from '../components/tasks/TaskModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { todoService, categoryService } from '../services';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TodayPage = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const todayFormatted = format(new Date(), 'd MMM');

  const fetchTodayData = async () => {
    try {
      setLoading(true);

      // Categories
      const catRes = await categoryService.getAllCategories();
      setCategories(catRes?.data || []);

      // Today's tasks only
      const taskRes = await todoService.getTodayTodos();
      setTasks(taskRes?.data || []);
    } catch (err) {
      console.error('Error fetching today tasks:', err);
      toast.error('Failed to load today’s tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayData();

    const handleCategoriesUpdate = () => {
      fetchTodayData();
    };
    window.addEventListener('taskflow:categories-updated', handleCategoriesUpdate);
    return () => window.removeEventListener('taskflow:categories-updated', handleCategoriesUpdate);
  }, []);

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (statusFilter === 'pending' && task.status !== 'pending') return false;
    if (statusFilter === 'completed' && task.status !== 'completed') return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return task.taskName?.toLowerCase().includes(q) || task.category?.name?.toLowerCase().includes(q);
    }
    return true;
  });

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const activeCount = totalCount - completedCount;

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
      } else {
        const res = await todoService.createTodo({
          ...taskData,
          taskDate: new Date().toISOString(),
        });
        if (res?.success) {
          toast.success('Task added to Today!');
          setTasks((prev) => [res.data, ...prev]);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving task');
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
    <AppShell
      search={search}
      onSearchChange={setSearch}
      onOpenAddTask={() => {
        setSelectedTask(null);
        setIsTaskModalOpen(true);
      }}
    >
      {/* Subheader & Date Banner */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: `All (${totalCount})` },
            { id: 'pending', label: `Active (${activeCount})` },
            { id: 'completed', label: `Completed (${completedCount})` },
          ].map((chip) => {
            const isSelected = statusFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setStatusFilter(chip.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition shadow-card border shrink-0 ${
                  isSelected
                    ? 'bg-brand-soft text-brand border-brand font-bold'
                    : 'bg-surface text-muted border-border hover:text-ink'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Completed Progress */}
        <div className="text-xs sm:text-sm text-muted">
          <strong className="text-ink">{completedCount}</strong> / {totalCount} completed today
        </div>
      </div>

      {/* Task Card Container */}
      <div className="bg-surface rounded-card shadow-card border border-border overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-sm text-muted">
            Loading today's tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            title="All clear for today!"
            subtitle="No tasks scheduled for today yet. Tap below to add a new task."
            onAddTask={() => {
              setSelectedTask(null);
              setIsTaskModalOpen(true);
            }}
          />
        ) : (
          <div>
            {filteredTasks.map((task) => (
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

      {/* Add / Edit Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleSaveTask}
        task={selectedTask}
        categories={categories}
        onCategoryCreated={(newCat) => setCategories((prev) => [...prev, newCat])}
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

export default TodayPage;
