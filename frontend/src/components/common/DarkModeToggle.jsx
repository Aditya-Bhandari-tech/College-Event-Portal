import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Reusable dark/light mode toggle button.
 * Uses ThemeContext — works in any dashboard wrapped by <ThemeProvider>.
 *
 * Props:
 *   compact  {boolean}  — icon-only mode (no label), good for tight headers
 *   className {string}  — extra classes to append
 */
const DarkModeToggle = ({ compact = false, className = '' }) => {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <button
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`
        flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-300 font-medium text-xs
        focus:outline-none focus:ring-2 focus:ring-offset-1
        ${darkMode
                    ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 focus:ring-indigo-500'
                    : 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 focus:ring-amber-400'
                }
        ${className}
      `.trim()}
        >
            {darkMode
                ? <><Sun size={15} className="text-amber-400 flex-shrink-0" />{!compact && <span className="hidden sm:inline">Light</span>}</>
                : <><Moon size={15} className="flex-shrink-0" />{!compact && <span className="hidden sm:inline">Dark</span>}</>
            }
        </button>
    );
};

export default DarkModeToggle;
