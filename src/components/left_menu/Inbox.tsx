import React from 'react';
import { Card, CardContent } from "src/components/ui/card";

const Inbox: React.FC = () => {
    return (
        <Card className="flex flex-col min-h-[calc(100vh-150px)]">
            <CardContent className="flex-grow h-full overflow-y-auto overflow-x-hidden scrollbar-custom flex items-start justify-center mt-8">
                <p className="text-gray-500 whitespace-nowrap">
                    TODO implement inbox
                </p>
            </CardContent>
        </Card>
    );
};

export default Inbox;
