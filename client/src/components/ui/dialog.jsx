import React from 'react';
import { Button } from "./button";

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => onOpenChange(false)}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ children }) => {
  return <div className="mt-2">{children}</div>;
};

export const DialogHeader = ({ children }) => {
  return <div className="mb-4">{children}</div>;
};

export const DialogTitle = ({ children }) => {
  return <h3 className="text-lg font-medium leading-6 text-gray-900">{children}</h3>;
};

export const DialogFooter = ({ children }) => {
  return <div className="mt-4 flex justify-end space-x-2">{children}</div>;
};

const DialogComponent = ({ open, onOpenChange, title, children, onSubmit }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <DialogContent>
        {children}
      </DialogContent>
      <DialogFooter>
        <Button onClick={() => onOpenChange(false)} variant="outline">Cancel</Button>
        <Button onClick={onSubmit}>Submit</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DialogComponent;
