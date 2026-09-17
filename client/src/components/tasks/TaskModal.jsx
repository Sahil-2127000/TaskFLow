import React, { useState, useEffect } from 'react';
import { X, Plus, Check, Loader2 } from 'lucide-react';
import { categoryService } from '../../services/category.service';
import toast from 'react-hot-toast';

const DEFAULT_COLOR_OPTIONS = [
  { name: 'Indigo', bg: '#E0E7FF', text: '#4F46E5' },
  { name: 'Blue', bg: '#DBEAFE', text: '#2563EB' },
  { name: 'Emerald', bg: '#D1FAE5', text: '#059669' },
  { name: 'Purple', bg: '#F3E8FF', text: '#9333EA' },
  { name: 'Rose', bg: '#FEE2E2', text: '#DC2626' },
  { name: 'Amber', bg: '#FEF3C7', text: '#D97706' },
  { name: 'Pink', bg: '#FCE7F3', text: '#DB2777' },
  { name: 'Teal', bg: '#CCFBF1', text: '#0D9488' },
];

const TaskModal = ({
  isOpen,
  onClose,
  onSave,
  task = null,
  categories = [],
  onCategoryCreated,
}) => {
  const [taskName, setTaskName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Category inline creation state
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR_OPTIONS[0]);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  useEffect(() => {
    if (task) {
      setTaskName(task.taskName || '');
      setCategoryId(task.category?._id || task.category || (categories[0]?._id || ''));
    } else {
      setTaskName('');
      setCategoryId(categories[0]?._id || '');
    }
    setIsCreatingCategory(false);
    setNewCategoryName('');
    setSelectedColor(DEFAULT_COLOR_OPTIONS[0]);
  }, [task, categories, isOpen]);

  if (!isOpen) return null;

  const handleCategorySelectChange = (e) => {
    const val = e.target.value;
    if (val === '__new__') {
      setIsCreatingCategory(true);
      setNewCategoryName('');
    } else {
      setCategoryId(val);
      setIsCreatingCategory(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e?.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      setIsSavingCategory(true);
      const res = await categoryService.createCategory(
        newCategoryName.trim(),
        selectedColor.bg,
        selectedColor.text
      );

      if (res?.success && res.category) {
        toast.success(`Category "${res.category.name}" created!`);
        if (onCategoryCreated) {
          onCategoryCreated(res.category);
        }
        setCategoryId(res.category._id);
        setIsCreatingCategory(false);
        setNewCategoryName('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleCancelNewCategory = () => {
    setIsCreatingCategory(false);
    setNewCategoryName('');
    // Revert to first available category
    if (!categoryId || categoryId === '__new__') {
      setCategoryId(categories[0]?._id || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskName.trim()) {
      toast.error('Task title is required');
      return;
    }

    // Determine final category ID
    const activeCategory = categoryId && categoryId !== '__new__' 
      ? categoryId 
      : categories[0]?._id;

    if (!activeCategory) {
      toast.error('Please select or create a category');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        taskName: taskName.trim(),
        description: '', // Description removed as requested
        categoryId: activeCategory,
        taskDate: task?.taskDate || new Date().toISOString(), // Defaults to current day
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade">
      <div className="bg-surface rounded-modal p-6 sm:p-7 w-full max-w-md shadow-modal border border-border animate-pop">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-ink">
            {task ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted hover:text-ink transition"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Title
            </label>
            <input
              type="text"
              required
              autoFocus
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. Complete project report"
              className="w-full px-3.5 py-2.5 rounded-ctl border border-border-input bg-[#FAFAFC] text-sm text-ink outline-none focus:border-brand transition"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Category
            </label>
            <select
              value={isCreatingCategory ? '__new__' : categoryId}
              onChange={handleCategorySelectChange}
              className="w-full px-3.5 py-2.5 rounded-ctl border border-border-input bg-[#FAFAFC] text-sm text-ink outline-none focus:border-brand transition cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
              <option value="__new__" className="font-semibold text-brand">
                + New Category
              </option>
            </select>
          </div>

          {/* Inline "Add New Category" Section */}
          {isCreatingCategory && (
            <div className="p-3.5 rounded-ctl bg-[#F7F6FB] border border-border flex flex-col gap-3 animate-fade">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">Create New Category</span>
                {/* Live Badge Preview */}
                <span
                  style={{ backgroundColor: selectedColor.bg, color: selectedColor.text }}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide"
                >
                  {newCategoryName.trim() || 'Preview'}
                </span>
              </div>

              <input
                type="text"
                autoFocus
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name (e.g. Finance, Health)"
                className="w-full px-3 py-2 rounded-chip border border-border-input bg-surface text-xs text-ink outline-none focus:border-brand transition"
              />

              {/* Default Color Options Palette */}
              <div>
                <span className="block text-[11px] font-medium text-muted mb-1.5">
                  Choose Color:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {DEFAULT_COLOR_OPTIONS.map((c) => {
                    const isSelected = selectedColor.name === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        title={c.name}
                        style={{ backgroundColor: c.bg, borderColor: isSelected ? c.text : 'transparent' }}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition hover:scale-110 ${
                          isSelected ? 'shadow-sm ring-2 ring-brand/30' : ''
                        }`}
                      >
                        {isSelected && <Check size={12} style={{ color: c.text }} strokeWidth={3} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={handleCancelNewCategory}
                  disabled={isSavingCategory}
                  className="px-3 py-1 rounded-chip text-xs text-muted hover:text-ink transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={isSavingCategory || !newCategoryName.trim()}
                  className="px-3.5 py-1 rounded-chip bg-brand hover:bg-brand-hover text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingCategory ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={13} />
                      <span>Add Category</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex gap-3 justify-end mt-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-ctl bg-canvas text-ink font-semibold text-sm border border-border hover:bg-gray-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !taskName.trim()}
              className="px-5 py-2.5 rounded-ctl bg-brand hover:bg-brand-hover text-white font-semibold text-sm shadow-cta transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (task ? 'Save Changes' : 'Add Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
