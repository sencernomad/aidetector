import React from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}
export function DialogContent({ children, className }: DialogContentProps) {
  return <div className={className}>{children}</div>;
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}
export function DialogHeader({ children, className }: DialogHeaderProps) {
  return <div className={className ? className + ' mb-4' : 'mb-4'}>{children}</div>;
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}
export function DialogTitle({ children, className }: DialogTitleProps) {
  return <h2 className={className ? className + ' text-xl font-bold mb-2' : 'text-xl font-bold mb-2'}>{children}</h2>;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}
export function DialogDescription({ children, className }: DialogDescriptionProps) {
  return <div className={className ? className + ' text-muted-foreground text-sm' : 'text-muted-foreground text-sm'}>{children}</div>;
} 