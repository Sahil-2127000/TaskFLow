import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Check, Loader2, Tag, AlertCircle, RotateCcw } from 'lucide-react';
import { categoryService } from '../../services/category.service';
import ConfirmDialog from '../ui/ConfirmDialog';
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

const CategoriesModal = ({
  isOpen,
  onClose,
  categories = [],
  onCategoryCreated,
  onCategoryUpdated,
  onCategoryDeleted,
}) => {
  const [categoryName, setCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR_OPTIONS[0]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);


 

  const handleStartEdit = (cat) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    // Find matching preset or use category's colors
    const match = DEFAULT_COLOR_OPTIONS.find(
      (c) => c.bg === cat.color && c.text === cat.textColor
    );
    setSelectedColor(
      match || {
        name: 'Custom',
        bg: cat.color || '#E0E7FF',
        text: cat.textColor || '#4F46E5',
      }
    );
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setCategoryName('');
    setSelectedColor(DEFAULT_COLOR_OPTIONS[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      
      setIsSubmitting(true);

      if (editingCategory) {
        // UPDATE MODE
        const res = await categoryService.updateCategory(
          editingCategory._id,
          categoryName.trim(),
          selectedColor.bg,
          selectedColor.text
        );

        if (res?.success && res.category) {
          toast.success(`Category "${res.category.name}" updated!`);
          if (onCategoryUpdated) {
            onCategoryUpdated(res.category);
          }
          handleCancelEdit();
        }
      } else {
        // CREATE MODE
        const res = await categoryService.createCategory(
          categoryName.trim(),
          selectedColor.bg,
          selectedColor.text
        );

        if (res?.success && res.category) {
          toast.success(`Category "${res.category.name}" created!`);
          if (onCategoryCreated) {
            onCategoryCreated(res.category);
          }
          setCategoryName('');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setIsDeleting(true);
      const res = await categoryService.deleteCategory(categoryToDelete._id);
      if (res?.success) {
        toast.success('Category deleted');
        if (onCategoryDeleted) {
          onCategoryDeleted(categoryToDelete._id);
        }
        if (editingCategory?._id === categoryToDelete._id) {
          handleCancelEdit();
        }
        setCategoryToDelete(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      handleCancelEdit();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade">
        <div className="bg-surface rounded-modal p-6 sm:p-7 w-full max-w-lg shadow-modal border border-border flex flex-col max-h-[90vh] animate-pop">

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center">
                <Tag size={18} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-ink">
                  Categories
                </h2>
                <p className="text-xs text-muted">
                  View, add, edit, and delete your categories
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-muted hover:text-ink hover:bg-gray-100 transition"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 py-4 flex flex-col gap-6">
            {/* ADD / EDIT CATEGORY FORM */}
            <form
              onSubmit={handleSubmit}
              className={`p-4 rounded-ctl border transition ${
                editingCategory
                  ? 'bg-brand-soft/40 border-brand/40 shadow-sm'
                  : 'bg-canvas border-border'
              } flex flex-col gap-3.5`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                  {editingCategory ? (
                    <>
                      <Edit2 size={14} className="text-brand" />
                      <span>Edit Category</span>
                    </>
                  ) : (
                    <>
                      <Plus size={14} className="text-brand" />
                      <span>Add New Category</span>
                    </>
                  )}
                </span>

                {/* Live Preview Pill */}
                <span
                  style={{
                    backgroundColor: selectedColor.bg,
                    color: selectedColor.text,
                  }}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide"
                >
                  {categoryName.trim() || 'Preview'}
                </span>
              </div>

              <div>
                <input
                  type="text"
                  autoFocus={!!editingCategory}
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Work, Workout, Reading"
                  className="w-full px-3.5 py-2 rounded-chip border border-border-input bg-surface text-xs sm:text-sm text-ink outline-none focus:border-brand transition"
                />
              </div>

              {/* Color Options */}
              <div>
                <span className="block text-[11px] font-medium text-muted mb-1.5">
                  Choose Color Preset:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {DEFAULT_COLOR_OPTIONS.map((c) => {
                    const isSelected =
                      selectedColor.bg === c.bg && selectedColor.text === c.text;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        title={c.name}
                        style={{
                          backgroundColor: c.bg,
                          borderColor: isSelected ? c.text : 'transparent',
                        }}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition hover:scale-110 ${
                          isSelected ? 'shadow-sm ring-2 ring-brand/30' : ''
                        }`}
                      >
                        {isSelected && (
                          <Check
                            size={12}
                            style={{ color: c.text }}
                            strokeWidth={3}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1">
                {editingCategory && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 rounded-chip text-xs text-muted hover:text-ink hover:bg-gray-100 transition"
                  >
                    Cancel Edit
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !categoryName.trim()}
                  className="px-4 py-1.5 rounded-chip bg-brand hover:bg-brand-hover text-white text-xs font-semibold shadow-cta transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>{editingCategory ? 'Saving...' : 'Adding...'}</span>
                    </>
                  ) : editingCategory ? (
                    <>
                      <Check size={14} />
                      <span>Save Changes</span>
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      <span>Add Category</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* EXISTING CATEGORIES LIST */}
            <div>
              <div className="flex items-center justify-between mb-2.5 px-1">
                <span className="text-xs font-bold text-ink">
                  Existing Categories ({categories.length})
                </span>
                <span className="text-[11px] text-muted">
                  Click Edit or Delete to manage
                </span>
              </div>

              {categories.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted bg-[#FAFAFD] rounded-ctl border border-dashed border-border">
                  No categories found. Create your first category above!
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {categories.map((cat) => {
                    const badgeBg = cat.color || '#E0E7FF';
                    const badgeText = cat.textColor || '#4F46E5';
                    const isBeingEdited = editingCategory?._id === cat._id;

                    return (
                      <div
                        key={cat._id}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-ctl border transition ${
                          isBeingEdited
                            ? 'bg-brand-soft/30 border-brand'
                            : 'bg-surface border-border hover:bg-[#FAFAFD]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            style={{ backgroundColor: badgeBg, color: badgeText }}
                            className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide shrink-0"
                          >
                            {cat.name}
                          </span>
                          {isBeingEdited && (
                            <span className="text-[11px] font-semibold text-brand">
                              (editing...)
                            </span>
                          )}
                        </div>

                        {/* Action Buttons: Edit & Delete */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(cat)}
                            title="Edit Category"
                            className="p-1.5 rounded-md text-muted hover:text-brand hover:bg-brand-soft transition"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setCategoryToDelete(cat)}
                            title="Delete Category"
                            className="p-1.5 rounded-md text-muted hover:text-danger hover:bg-danger-soft transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-border flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-ctl bg-canvas text-ink font-semibold text-xs sm:text-sm border border-border hover:bg-gray-100 transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!categoryToDelete}
        title="Delete this category?"
        message={`Deleting "${categoryToDelete?.name}" will remove it from your categories. Associated tasks will remain.`}
        onConfirm={handleDeleteCategory}
        onCancel={() => setCategoryToDelete(null)}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
      />
    </>
  );
};

export default CategoriesModal;
