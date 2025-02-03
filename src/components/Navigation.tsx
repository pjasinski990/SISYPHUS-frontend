import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'src/components/ui/button';
import { LogOut, Moon, PieChartIcon, Sun, User } from 'lucide-react';
import { useAuth } from 'src/components/context/AuthContext';
import ShortcutsInfoDialog from 'src/components/keyboard/ShortcutsInfoDialog';

interface NavigationProps {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
    darkMode,
    toggleDarkMode,
}) => {
    const { isAuthenticated, username, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="flex justify-between items-center px-4 py-2 bg-white dark:bg-gray-800 shadow">
            <Link to="/" className="text-xl font-bold">
                <div className={'flex items-center mx-4 text-slate-400'}>
                    <span>SISYPHUS</span>
                    <div className="mx-2">
                        <img src="/favicon.svg" alt="Favicon" width={28} height={28} />
                    </div>
                </div>
            </Link>
            <div className="flex items-center space-x-4">
                <ShortcutsInfoDialog />
                {isAuthenticated && (
                    <>
                        <Link
                            to={'/profile'}
                            className="flex items-center space-x-2 text-sm"
                        >
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center space-x-2 dark:hover:bg-slate-700"
                            >
                                <User className="h-4 w-4" />
                                <span>{username}</span>
                            </Button>
                        </Link>
                        <Link
                            to={'/stats'}
                            className="flex items-center space-x-2 text-sm"
                        >
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center space-x-2 dark:hover:bg-slate-700"
                            >
                                <PieChartIcon className="h-4 w-4" />
                                <span>Stats</span>
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="flex items-center space-x-2 dark:hover:bg-slate-700"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                        </Button>
                    </>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleDarkMode}
                    className="dark:hover:bg-slate-700"
                >
                    {darkMode ? (
                        <Sun
                            className="h-[1.2rem] w-[1.2rem]"
                            data-testid={'SunIcon'}
                        />
                    ) : (
                        <Moon
                            className="h-[1.2rem] w-[1.2rem]"
                            data-testid={'MoonIcon'}
                        />
                    )}
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </div>
        </nav>
    );
};

export default Navigation;
