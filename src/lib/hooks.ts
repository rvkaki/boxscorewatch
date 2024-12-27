import { useCallback, useRef, useState } from "react";

export function useDisclosure() {
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);
  const onToggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, onOpen, onClose, onToggle };
}

export default function useDebouncedCallback<T extends unknown[]>(
  func: (...args: T) => unknown,
  wait: number,
) {
  const timeout = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: T) => {
      const later = () => {
        clearTimeout(timeout.current);
        func(...args);
      };

      clearTimeout(timeout.current);
      timeout.current = setTimeout(later, wait);
    },
    [func, wait],
  );
}
