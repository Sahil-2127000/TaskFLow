import React from 'react';
import { Trash2 } from 'lucide-react';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete', isDanger = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-modal p-6 sm:p-7 w-full max-w-sm shadow-modal border border-border text-center animate-pop">
        {isDanger && (
          <div className="w-12 h-12 rounded-full bg-danger-soft text-danger flex items-center justify-center mx-auto mb-4">
            <Trash2 size={24} />
          </div>
        )}

        <h3 className="text-lg font-bold text-ink mb-2">
          {title || 'Delete this task?'}
        </h3>
        
        <p className="text-sm text-muted mb-6 leading-relaxed">
          {message || 'This item will be removed permanently. This cannot be undone.'}
        </p>

        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-ctl bg-canvas text-ink font-semibold text-sm border border-border hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 rounded-ctl text-white font-semibold text-sm shadow-md transition ${
              isDanger
                ? 'bg-danger hover:bg-danger-hover shadow-red-500/20'
                : 'bg-brand hover:bg-brand-hover shadow-cta'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
