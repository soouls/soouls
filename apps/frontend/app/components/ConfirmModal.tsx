'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { SymbolLogo } from './SymbolLogo';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmStyle?: 'danger' | 'warning' | 'primary';
  isPending?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmStyle = 'danger',
  isPending = false,
}) => {
  const getConfirmButtonClasses = () => {
    switch (confirmStyle) {
      case 'danger':
        return 'bg-[rgba(255,0,0,0.72)] border border-red-600 text-[#E6E2D6] hover:bg-red-700';
      case 'warning':
        return 'bg-[rgba(245,158,11,0.72)] border border-amber-600 text-[#E6E2D6] hover:bg-amber-600';
      default:
        return 'bg-[var(--soouls-accent)] border border-[var(--soouls-accent)] text-white hover:opacity-90';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[728px] rounded-[16px] bg-[rgba(14,14,14,0.88)] p-8 text-center shadow-2xl backdrop-blur-[30px] relative overflow-hidden sm:p-12"
          >
            {/* Decorative Butterfly Logo */}
            <SymbolLogo
              className="absolute -top-4 -right-4 w-32 h-32 text-[var(--soouls-accent)] rotate-12 opacity-90"
              variant="solid"
            />

            <div className="relative z-10 text-left">
              <h2 className="text-[42px] font-urbanist font-medium leading-none text-white mb-8 sm:text-[60px]">
                {title}
              </h2>
              <div className="text-2xl text-white/85 font-playfair italic mb-20 sm:text-[30px]">
                {description}
              </div>

              <div className="flex flex-col gap-4 justify-center mb-6 sm:flex-row sm:gap-16">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="w-full py-3.5 rounded-2xl bg-[rgba(15,15,15,0.5)] border border-[var(--soouls-accent)] text-[#E6E2D6] hover:bg-[#222] transition-colors transition-transform transition-shadow text-lg font-bold shadow-lg sm:w-52 disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isPending}
                  className={`w-full py-3.5 rounded-2xl transition-colors transition-transform transition-shadow text-lg font-bold shadow-lg sm:w-52 disabled:opacity-50 flex items-center justify-center gap-2 ${getConfirmButtonClasses()}`}
                >
                  {isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Loading...
                    </>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
