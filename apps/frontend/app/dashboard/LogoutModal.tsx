'use client';

import { AnimatePresence, motion } from 'framer-motion';

export function LogoutModal({
  open,
  onStay,
  onLogout,
  isSubmitting,
}: {
  open: boolean;
  onStay: () => void;
  onLogout: () => void;
  isSubmitting: boolean;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onStay}
        >
          <motion.dialog
            className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-[#090909] p-8 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.85)]"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            open
            aria-labelledby="logout-title"
            aria-describedby="logout-copy"
          >
            <div className="flex items-start justify-between gap-8">
              <div className="space-y-5">
                <h2 id="logout-title" className="font-urbanist text-5xl leading-none text-white">
                  Leaving for now?
                </h2>
                <p
                  id="logout-copy"
                  className="max-w-2xl font-editorial text-3xl leading-tight text-white/70"
                >
                  Your thoughts are safely stored. You can return anytime.
                </p>
              </div>
              <div className="hidden h-28 w-28 shrink-0 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(224,122,95,0.95),rgba(224,122,95,0.18)_68%,transparent_72%)] lg:block" />
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              <button
                type="button"
                onClick={onStay}
                className="rounded-[1.25rem] border border-[var(--app-accent)] bg-white/[0.02] px-6 py-4 text-2xl font-semibold text-white shadow-[0_20px_60px_-40px_var(--app-glow)] transition hover:bg-white/[0.05]"
              >
                Stay
              </button>
              <button
                type="button"
                onClick={onLogout}
                disabled={isSubmitting}
                className="rounded-[1.25rem] bg-[#d91313] px-6 py-4 text-2xl font-semibold text-white shadow-[0_20px_60px_-30px_rgba(217,19,19,0.6)] transition hover:bg-[#f11b1b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Logging out...' : 'Logout'}
              </button>
            </div>

            <p className="mt-10 text-center font-editorial text-3xl text-white/45">See you soon.</p>
          </motion.dialog>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
