import React, { useState, useEffect } from 'react';
import { Button } from "src/components/ui/button";
import { Moon, Sun } from "lucide-react";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [darkMode, setDarkMode] = useState(true);

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
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4"
                onClick={toggleDarkMode}
            >
                {darkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
                <span className="sr-only">Toggle theme</span>
            </Button>
            {children}
        </div>
    );
};

export default Layout;
