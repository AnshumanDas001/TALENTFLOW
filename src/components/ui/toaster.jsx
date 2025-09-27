import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext({ add: () => {} });

export function ToasterProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((toast) => {
    const id = String(Date.now() + Math.random());
    const t = { id, type: toast.type || "info", message: toast.message || "", timeout: toast.timeout ?? 2500 };
    setToasts((prev) => [...prev, t]);
    if (t.timeout) {
      setTimeout(() => remove(id), t.timeout);
    }
    return id;
  }, [remove]);

  const value = useMemo(() => ({ add, remove }), [add, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`min-w-[240px] max-w-[360px] rounded-md border px-3 py-2 shadow text-sm bg-gray-900/95 backdrop-blur border-gray-700 ${
              t.type === "success" ? "text-green-300" : t.type === "error" ? "text-red-300" : "text-white"
            } animate-[fadein_.15s_ease-out]`}
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5">
                {t.type === "success" ? "✅" : t.type === "error" ? "⚠️" : "ℹ️"}
              </div>
              <div className="flex-1">{t.message}</div>
              <button onClick={() => remove(t.id)} className="opacity-70 hover:opacity-100">✕</button>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes fadein { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

export default ToasterProvider;
