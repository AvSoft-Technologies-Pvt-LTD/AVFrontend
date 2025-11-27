import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names and merges Tailwind CSS classes
 * @param {...any} inputs - Class names to be combined
 * @returns {string} - Combined and optimized class name string
 */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export { cn };
