'use client';

import { useClerk } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { SymbolLogo } from './SymbolLogo';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { signOut } = useClerk();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-lg bg-[#838182] rounded-[2rem] p-10 text-center shadow-2xl relative overflow-hidden"
          >
            {/* Decorative Butterfly Logo */}
            <SymbolLogo
              className="absolute -top-4 -right-4 w-32 h-32 text-[#D46B4E] rotate-12 opacity-90"
              variant="solid"
            />

            <div className="relative z-10 text-left">
              <h2 className="text-[40px] font-urbanist font-light text-white mb-2">
                Leaving for now?
              </h2>
              <p className="text-2xl text-white/90 font-playfair italic mb-16">
                Your thoughts are safely stored. You can
                <br />
                return anytime.
              </p>

              <div className="flex gap-6 justify-center mb-8">
                <button
                  onClick={onClose}
                  className="w-36 py-3.5 rounded-2xl bg-[#4A4A4A] border border-[#D46B4E] text-white hover:bg-[#5a5a5a] transition-all text-lg font-medium shadow-lg"
                >
                  Stay
                </button>
                <button
                  onClick={() => signOut({ redirectUrl: '/' })}
                  className="w-36 py-3.5 rounded-2xl bg-[#D33F3F] border border-[#B33535] text-white hover:bg-[#E34A4A] transition-all text-lg font-medium shadow-lg"
                >
                  Logout
                </button>
              </div>

              <p className="text-center text-lg text-white/60 font-playfair italic">
                See you soon.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
