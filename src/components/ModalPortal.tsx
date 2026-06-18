import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: React.ReactNode;
}

export function ModalPortal({ children }: ModalPortalProps) {
  return createPortal(children, document.body);
}
