import React from 'react';

const Checkbox = ({ id, name, checked, onCheckedChange, label }) => {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
      />
      {label && (
        <label htmlFor={id} className="ml-2 block text-sm leading-5 text-gray-900">
          {label}
        </label>
      )}
    </div>
  );
};

export { Checkbox }
