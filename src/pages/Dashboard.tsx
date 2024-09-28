import React from 'react';
import Layout from 'src/components/Layout';
import { TaskListsProvider } from 'src/components/context/TaskListsContext';
import { TaskDragDropProvider } from 'src/components/context/TaskDragDropContext';
import { DashboardContent } from 'src/components/DashboardContent';

const Dashboard: React.FC = () => {
    return (
        <Layout>
            <div className="flex h-full">
                <TaskListsProvider
                    listNames={[
                        'INBOX',
                        'REUSABLE',
                        'DAILY_TODO',
                        'DAILY_DONE',
                    ]}
                >
                    <TaskDragDropProvider
                        listNames={['DAILY_TODO', 'DAILY_DONE', 'INBOX']}
                    >
                        <DashboardContent />
                    </TaskDragDropProvider>
                </TaskListsProvider>
            </div>
        </Layout>
    );
};

export default Dashboard;
