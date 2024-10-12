// src/components/ui/progress.jsx
import React from 'react';

const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={`relative h-4 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}
    {...props}
  >
    <div
      className="h-full bg-blue-500 transition-all"
      style={{ width: `${value || 0}%` }}
    />
  </div>
));

Progress.displayName = 'Progress';

export { Progress };
