import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ── Accent Color Map ────────────────────────────────────────────────────────
export const ACCENT_MAP = {
    blue: { key: 'blue', hex: '#3b82f6', to: '#4f46e5', label: 'Blue', cls: 'bg-blue-500' },
    indigo: { key: 'indigo', hex: '#6366f1', to: '#4338ca', label: 'Indigo', cls: 'bg-indigo-500' },
    violet: { key: 'violet', hex: '#8b5cf6', to: '#6d28d9', label: 'Violet', cls: 'bg-violet-500' },
    emerald: { key: 'emerald', hex: '#10b981', to: '#059669', label: 'Emerald', cls: 'bg-emerald-500' },
    rose: { key: 'rose', hex: '#f43f5e', to: '#e11d48', label: 'Rose', cls: 'bg-rose-500' },
    amber: { key: 'amber', hex: '#f59e0b', to: '#d97706', label: 'Amber', cls: 'bg-amber-500' },
};

// ── Default Portal Settings ─────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
    collegeName: 'Campus Pulse College',
    tagline: 'Connecting students through events',
    academicYear: '2024-2025',
    contactEmail: 'admin@campuspulse.edu',
    department: 'Student Affairs',
    maxEventCapacity: '500',
    accentColor: 'blue',
    // Feature toggles
    eventRegistration: true,
    studentEventRequests: true,
    facultyAnnouncements: true,
    galleryUploads: true,
    recruitmentOpen: true,
    // Notification prefs
    emailNotifications: true,
    approvalNotifications: true,
    eventReminders: true,
};

const SETTINGS_KEY = 'portalSettings';
const DARK_MODE_KEY = 'darkMode';

// ── Apply accent CSS vars to <html> ─────────────────────────────────────────
function applyAccentVars(colorKey) {
    const c = ACCENT_MAP[colorKey] || ACCENT_MAP.blue;
    const root = document.documentElement;
    root.style.setProperty('--accent', c.hex);
    root.style.setProperty('--accent-from', c.hex);
    root.style.setProperty('--accent-to', c.to);
}

// ── Load helpers ─────────────────────────────────────────────────────────────
function loadSettings() {
    try {
        const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
        return stored ? { ...DEFAULT_SETTINGS, ...stored } : { ...DEFAULT_SETTINGS };
    } catch { return { ...DEFAULT_SETTINGS }; }
}

function loadDarkMode() {
    try { return localStorage.getItem(DARK_MODE_KEY) === 'true'; } catch { return false; }
}

// ── Context ──────────────────────────────────────────────────────────────────
export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(loadDarkMode);
    const [portalSettings, setPortalSettings] = useState(loadSettings);

    // Apply accent vars immediately on mount and whenever accentColor changes
    useEffect(() => {
        applyAccentVars(portalSettings.accentColor);
    }, [portalSettings.accentColor]);

    // Toggle dark mode
    const toggleDarkMode = useCallback(() => {
        setDarkMode(prev => {
            const next = !prev;
            localStorage.setItem(DARK_MODE_KEY, String(next));
            return next;
        });
    }, []);

    // Apply accent color immediately (called from SettingsView color picker)
    const applyAccent = useCallback((colorKey) => {
        applyAccentVars(colorKey);
        setPortalSettings(prev => ({ ...prev, accentColor: colorKey }));
    }, []);

    // Update a single setting key (live, unsaved)
    const updateSetting = useCallback((key, value) => {
        setPortalSettings(prev => ({ ...prev, [key]: value }));
    }, []);

    // Persist all settings to localStorage
    const saveSettings = useCallback((overrides = {}) => {
        setPortalSettings(prev => {
            const next = { ...prev, ...overrides };
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const value = {
        darkMode,
        toggleDarkMode,
        portalSettings,
        updateSetting,
        saveSettings,
        applyAccent,
        ACCENT_MAP,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
    return ctx;
};
