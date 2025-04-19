// app/context/ToastContext.tsx
import React, { createContext, useContext, useState } from "react";
import CustomToast from "@/components/CustomToast"; // adjust path as needed

type ToastContextType = {
  showToast: (message: string, duration?: number) => void;
};

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toastMessage, setToastMessage] = useState<string>("");
  const [show, setShow] = useState(false);
  const [duration, setDuration] = useState(3000);

  const showToast = (message: string, customDuration = 3000) => {
    setToastMessage(message);
    setDuration(customDuration);
    setShow(true);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {show && (
        <CustomToast
          message={toastMessage}
          duration={duration}
          onHide={() => setShow(false)}
        />
      )}
    </ToastContext.Provider>
  );
};
