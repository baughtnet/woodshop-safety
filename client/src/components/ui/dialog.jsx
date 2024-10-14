import React from 'react';
import { Button } from "./button";

export const Dialog = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
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

const DialogComponent = ({ isOpen, onClose, title, children, onSubmit }) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <DialogContent>
        {children}
      </DialogContent>
      <DialogFooter>
        <Button onClick={onClose} variant="outline">Cancel</Button>
        <Button onClick={onSubmit}>Submit</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DialogComponent;
