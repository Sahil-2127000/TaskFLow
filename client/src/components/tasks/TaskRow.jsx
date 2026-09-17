import { Check, Edit2, Trash2, Calendar } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

const CATEGORY_COLORS = {
  Development: { bg: '#F3E8FF', text: '#9333EA' },
  Study: { bg: '#DBEAFE', text: '#2563EB' },
  Health: { bg: '#D1FAE5', text: '#059669' },
  Personal: { bg: '#E0E7FF', text: '#4F46E5' },
  Career: { bg: '#FEE2E2', text: '#DC2626' },
};

const TaskRow = ({ task, onToggleStatus, onEdit, onDelete }) => {
  
  const isCompleted = task.status === 'completed';

  const categoryName = task.category?.name || 'General';
  const tagColor = {
    bg: task.category?.color || CATEGORY_COLORS[categoryName]?.bg || '#E0E7FF',
    text: task.category?.textColor || CATEGORY_COLORS[categoryName]?.text || '#4F46E5',
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isToday(d)) return 'Today';
      if (isYesterday(d)) return 'Yesterday';
      return format(d, 'MMM d, yyyy');
    } catch {
      return '';
    }
  };

  return (
    <div className="flex items-center justify-between px-3.5 py-3 sm:px-4.5 sm:py-3.5 bg-surface hover:bg-[#FAFAFD] border-b border-[#F2F1F7] transition duration-150 relative group">

      {/* Left side: Checkbox + Title + Description */}
      <div className="flex items-center gap-3 sm:gap-3.5 flex-1 min-w-0 pr-2">
        
        {/* Custom Checkbox */}
        <button
          type="button"
          onClick={() => onToggleStatus(task)}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
          className={`w-5 h-5 min-w-[20px] rounded-[5px] flex items-center justify-center text-white transition ${
            isCompleted ? 'bg-brand' : 'border border-[#C4C2D4]'
          }`}
        >
          {isCompleted && <Check size={14} strokeWidth={3} />}
        </button>

        {/* Task Title & Details */}
        <div className="flex flex-col min-w-0">
          <span
            className={`text-xs sm:text-sm font-medium truncate ${
              isCompleted ? 'text-muted line-through' : 'text-ink'
            }`}
          >
            {task.taskName}
          </span>
          {task.description && (
            <span className="text-[11px] sm:text-xs text-gray-400 truncate">
              {task.description}
            </span>
          )}
        </div>
      </div>

      {/* Right side: Category Badge + Date + Actions */}
      <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
        {/* Category Tag */}
        <span
          style={{ backgroundColor: tagColor.bg, color: tagColor.text }}
          className="px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-[10.5px] sm:text-[11px] font-semibold tracking-wide shrink-0"
        >
          {categoryName}
        </span>

        {/* Date */}
        {task.taskDate && (
          <div className="hidden sm:flex items-center gap-1 text-muted text-xs shrink-0">
            <Calendar size={13} />
            <span>{formatDateLabel(task.taskDate)}</span>
          </div>
        )}

        {/* Actions (Edit & Delete) */}
        <div className="flex items-center gap-1 opacity-80 sm:opacity-50 group-hover:opacity-100 transition">
          <button
            type="button"
            onClick={() => onEdit(task)}
            title="Edit task"
            className="p-1 sm:p-1.5 rounded-md text-muted hover:text-brand transition"
          >
            <Edit2 size={14} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(task)}
            title="Delete task"
            className="p-1 sm:p-1.5 rounded-md text-muted hover:text-danger transition"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskRow;
