import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Button } from 'src/components/ui/button';
import { LogOut, Moon, Sun, User } from 'lucide-react';
import { useAuth } from 'src/components/context/AuthContext';
import ShortcutsInfoDialog from "src/components/keyboard/ShortcutsInfoDialog";

interface NavigationProps {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ darkMode, toggleDarkMode }) => {
    const { isAuthenticated, username, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="flex justify-between items-center px-4 py-2 bg-white dark:bg-gray-800 shadow">
            <RouterLink to="/" className="text-xl font-bold">mind=blown</RouterLink>
            <div className="flex items-center space-x-4">
                <ShortcutsInfoDialog/>
                {isAuthenticated && (
                    <>
                        <RouterLink to={"/profile"} className="flex items-center space-x-2 text-sm">
                            <Button variant="ghost" size="sm" className="flex items-center space-x-2 dark:hover:bg-slate-700">
                                <User className="h-4 w-4" />
                                <span>{username}</span>
                            </Button>
                        </RouterLink>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center space-x-2 dark:hover:bg-slate-700">
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                        </Button>
                    </>
                )}
                <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="dark:hover:bg-slate-700">
                    {darkMode ? (
                        <Sun className="h-[1.2rem] w-[1.2rem]" />
                    ) : (
                        <Moon className="h-[1.2rem] w-[1.2rem]" />
                    )}
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </div>
        </nav>
    );
};

export default Navigation;
