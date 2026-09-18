import React from 'react';

export const SectionHeader = ({ title, subtitle, actionText, onAction }) => {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        )}
      </div>

      {actionText && (
        <button
          onClick={onAction}
          className="text-xs font-semibold text-linova-primary hover:text-linova-primary/80 transition-colors uppercase tracking-wider"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
