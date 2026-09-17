import React from 'react';
import { ClipboardList, Plus } from 'lucide-react';

const EmptyState = ({ onAddTask, title = 'No tasks yet', subtitle = 'Add your first task and it will show up here. Small steps, big progress.' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-soft text-brand flex items-center justify-center mb-4">
        <ClipboardList size={32} />
      </div>

      <h3 className="text-lg font-bold text-ink mb-1.5">
        {title}
      </h3>

      <p className="text-sm text-muted max-w-sm mb-6 leading-relaxed">
        {subtitle}
      </p>

      {onAddTask && (
        <button
          type="button"
          onClick={onAddTask}
          className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-ctl font-semibold text-sm shadow-cta transition"
        >
          <Plus size={16} />
          <span>Add your first task</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
