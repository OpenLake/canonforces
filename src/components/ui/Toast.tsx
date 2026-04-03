import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../../styles/Toast.module.css';

export interface ToastAction {
  label: string;
  onClick: () => void;
  type: 'primary' | 'secondary' | 'danger';
}

export interface ToastData {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  avatar?: string;
  actions?: ToastAction[];
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      className={`${styles.toast} ${styles[`toast-${toast.type || 'info'}`]}`}
    >
      {toast.avatar && (
        <div className={styles['toast-avatar']}>
          {toast.avatar}
        </div>
      )}
      <div className={styles['toast-content']}>
        <h4 className={styles['toast-title']}>{toast.title}</h4>
        {toast.message && <p className={styles['toast-message']}>{toast.message}</p>}
        {toast.actions && (
          <div className={styles['toast-actions']}>
            {toast.actions.map((action, i) => (
              <button
                key={i}
                className={`${styles.btn} ${
                  action.type === 'primary' ? styles['btn-accept'] : styles['btn-decline']
                }`}
                onClick={() => {
                  action.onClick();
                  onClose(toast.id);
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastData[]; setToasts: React.Dispatch<React.SetStateAction<ToastData[]>> }> = ({ toasts, setToasts }) => {
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className={styles['toast-container']}>
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
