import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable LogoutButton — can be dropped anywhere in the project.
 * Props:
 *  - className  (string) : additional Tailwind/CSS classes
 *  - showIcon   (bool)   : show LogOut icon, default true
 *  - label      (string) : button label, default "Logout"
 */
const LogoutButton = ({ className = '', showIcon = true, label = 'Logout' }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <button
            onClick={handleLogout}
            className={`flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-semibold text-sm ${className}`}
        >
            {showIcon && <LogOut size={16} />}
            <span>{label}</span>
        </button>
    );
};

export default LogoutButton;
