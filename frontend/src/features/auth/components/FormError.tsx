import { AnimatePresence, motion } from "framer-motion";

interface FormErrorProps {
  message?: string;
}

export default function FormError({ message }: FormErrorProps) {
  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.p
          key={message}
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0, x: [0, -3, 3, -2, 0] }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.26, ease: "easeOut" }}
          role="alert"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
