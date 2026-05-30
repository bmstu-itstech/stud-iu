"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import JoinModal from "@/widgets/JoinModal";

interface ModalContextType {
  openJoinModal: () => void;
  closeJoinModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openJoinModal = () => setIsOpen(true);
  const closeJoinModal = () => setIsOpen(false);

  return (
    <ModalContext.Provider value={{ openJoinModal, closeJoinModal }}>
      {children}
      <JoinModal isOpen={isOpen} onClose={closeJoinModal} />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within ModalProvider");
  return context;
};
