import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button } from "src/components/ui/button";
import { Moon, Sun, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [darkMode, setDarkMode] = useState(true);
    const { isAuthenticated, username } = useAuth();

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
            <nav className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow">
                <RouterLink to="/" className="text-xl font-bold">mind=blown</RouterLink>
                <div className="flex items-center space-x-4">
                    {isAuthenticated && (
                        <RouterLink to="/profile" className="flex items-center space-x-2 text-sm">
                            <User className="h-4 w-4"/>
                            <span>{username}</span>
                        </RouterLink>
                    )}
                    <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                        {darkMode
                            ? <Sun className="h-[1.2rem] w-[1.2rem]"/>
                            : <Moon className="h-[1.2rem] w-[1.2rem]"/>}
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </div>
            </nav>
            <main className="flex-grow flex justify-center items-center">
                {children}
            </main>
        </div>
    );
};

export default Layout;
