
import { useEffect, useCallback } from 'react';

interface KeyboardNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
}

export const useKeyboardNavigation = ({
  isOpen,
  onClose,
  onEscape,
  onEnter,
  onArrowUp,
  onArrowDown,
}: KeyboardNavigationProps) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        onEscape ? onEscape() : onClose();
        break;
      case 'Enter':
        if (onEnter) {
          event.preventDefault();
          onEnter();
        }
        break;
      case 'ArrowUp':
        if (onArrowUp) {
          event.preventDefault();
          onArrowUp();
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          event.preventDefault();
          onArrowDown();
        }
        break;
      case 'Tab':
        // Allow natural tab navigation
        break;
      default:
        break;
    }
  }, [isOpen, onClose, onEscape, onEnter, onArrowUp, onArrowDown]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);
};
