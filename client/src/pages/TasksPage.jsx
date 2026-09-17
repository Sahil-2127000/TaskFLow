import React, { useState, useEffect } from 'react';
import AppShell from '../components/layout/AppShell';
import TaskRow from '../components/tasks/TaskRow';
import TaskModal from '../components/tasks/TaskModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { todoService, categoryService } from '../services';
import toast from 'react-hot-toast';

const DEFAULT_CATEGORIES = [
  { _id: 'cat-dev', name: 'Development', color: '#F3E8FF', textColor: '#9333EA' },
  { _id: 'cat-study', name: 'Study', color: '#DBEAFE', textColor: '#2563EB' },
  { _id: 'cat-health', name: 'Health', color: '#D1FAE5', textColor: '#059669' },
  { _id: 'cat-personal', name: 'Personal', color: '#E0E7FF', textColor: '#4F46E5' },
  { _id: 'cat-career', name: 'Career', color: '#FEE2E2', textColor: '#DC2626' },
];

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Fetch categories & tasks
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch user categories
      const catRes = await categoryService.getAllCategories();
      let userCats = catRes?.data || [];

      // If user has no categories yet, create/seed the defaults
      if (userCats.length === 0) {
        try {
            const createPromises = DEFAULT_CATEGORIES.map((c) =>
            categoryService.createCategory(c.name)
          );
          await Promise.all(createPromises);
          const updatedCatRes = await categoryService.getAllCategories();
          userCats = updatedCatRes?.data || DEFAULT_CATEGORIES;
        } catch {
          userCats = DEFAULT_CATEGORIES;
        }
      }
      setCategories(userCats);

      // Fetch tasks
      const taskRes = await todoService.getAllTodos();
      setTasks(taskRes?.data || []);
    } catch (err) {
      console.error('Error fetching tasks/categories:', err);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleCategoriesUpdate = () => {
      fetchData();
    };
    window.addEventListener('taskflow:categories-updated', handleCategoriesUpdate);
    return () => window.removeEventListener('taskflow:categories-updated', handleCategoriesUpdate);
  }, []);

  // Filter and Sort logic
  const filteredTasks = tasks
    .filter((task) => {
      // Status filter
      if (statusFilter === 'pending' && task.status !== 'pending') return false;
      if (statusFilter === 'completed' && task.status !== 'completed') return false;

      // Search query
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const matchesName = task.taskName?.toLowerCase().includes(query);
        const matchesCat = task.category?.name?.toLowerCase().includes(query);
        return matchesName || matchesCat;
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || a.taskDate || 0);
      const dateB = new Date(b.createdAt || b.taskDate || 0);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const totalCount = tasks.length;
  const activeCount = tasks.filter((t) => t.status === 'pending').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  // Handler: Toggle Task completion status
  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, status: nextStatus } : t))
    );

    try {
      await todoService.updateTodo(task._id, { status: nextStatus });
    } catch {
      toast.error('Failed to update status');
      // Rollback
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, status: task.status } : t))
      );
    }
  };

  // Handler: Save or Update task
  const handleSaveTask = async (taskData) => {
    try {
      if (selectedTask) {
        // Edit existing
        const res = await todoService.updateTodo(selectedTask._id, taskData);
        if (res?.success) {
          toast.success('Task updated!');
          setTasks((prev) =>
            prev.map((t) => (t._id === selectedTask._id ? res.data : t))
          );
        }
      } else {
        // Create new
        const res = await todoService.createTodo(taskData);
        if (res?.success) {
          toast.success('Task created!');
          setTasks((prev) => [res.data, ...prev]);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving task');
      throw err;
    }
  };

  // Handler: Delete task
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
      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
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

        {/* Sort Dropdown & Progress */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
          <span className="text-xs sm:text-sm text-muted">
            <strong className="text-ink">{completedCount}</strong> / {totalCount} completed
          </span>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-1.5 rounded-ctl border border-border bg-surface text-xs sm:text-sm font-medium text-ink outline-none shadow-card cursor-pointer focus:border-brand transition"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {/* Task List Container Card */}
      <div className="bg-surface rounded-card shadow-card border border-border overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-sm text-muted">
            Loading tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            title={search ? 'No matching tasks' : 'No tasks yet'}
            subtitle={
              search
                ? 'Try a different search term or clear the search filter.'
                : 'Add your first task and it will show up here. Small steps, big progress.'
            }
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
        message={`"${taskToDelete?.taskName}" will be removed permanently. This cannot be undone.`}
        onConfirm={handleDeleteTask}
        onCancel={() => setTaskToDelete(null)}
      />
    </AppShell>
  );
};

export default TasksPage;
