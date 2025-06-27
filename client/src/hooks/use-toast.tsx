// use-toast.tsx
// Adapted from shadcn/ui toast implementation
import * as React from "react";

type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

type ToastActionElement = React.ReactElement<{
  altText: string;
  onClick: () => void;
}>;

type ToastContextType = {
  toast: (props: ToastProps) => void;
  dismiss: (toastId: string) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<
    Array<ToastProps & { id: string; visible: boolean }>
  >([]);

  const toast = React.useCallback(
    ({ title, description, action, variant = "default" }: ToastProps) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prevToasts) => [
        ...prevToasts,
        { id, title, description, action, variant, visible: true },
      ]);

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        dismiss(id);
      }, 5000);

      return id;
    },
    []
  );

  const dismiss = React.useCallback((toastId: string) => {
    setToasts((prevToasts) =>
      prevToasts.filter((toast) => toast.id !== toastId)
    );
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 max-w-xs w-full">
          {toasts.map(
            ({ id, title, description, action, variant, visible }) =>
              visible && (
                <div
                  key={id}
                  className={`rounded-lg p-4 shadow-lg transition-all ${
                    variant === "destructive"
                      ? "bg-red-600 text-white"
                      : "bg-white text-gray-800 border border-gray-200"
                  }`}
                >
                  {title && <div className="font-medium">{title}</div>}
                  {description && (
                    <div className="text-sm mt-1">{description}</div>
                  )}
                  {action && <div className="mt-2">{action}</div>}
                  <button
                    onClick={() => dismiss(id)}
                    className="absolute top-2 right-2 text-sm"
                    aria-label="Close toast"
                  >
                    ×
                  </button>
                </div>
              )
          )}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}