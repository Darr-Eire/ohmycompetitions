import { createContext, useContext } from 'react';

const defaultToast = {
  show: () => {},
  hide: () => {},
};

const ToastContext = createContext(defaultToast);
export const useToast = () => useContext(ToastContext) || defaultToast;

export default ToastContext;
