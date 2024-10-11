import React from 'react';
import Layout from 'src/components/Layout';
import { TaskListsProvider } from 'src/components/context/TaskListsContext';
import { TaskDragDropProvider } from 'src/components/context/TaskDragDropContext';
import { DashboardContent } from 'src/components/DashboardContent';
import { TaskNavigationProvider } from 'src/components/context/TaskNavigationContext';
import { TaskActionProvider } from 'src/components/context/TaskActionContext';
import { mongoPersistenceProvider } from '../persistence_provider/MongoPersistenceProvider';

const DashboardPage: React.FC = () => {
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
                    persistenceProvider={mongoPersistenceProvider}
                >
                    <TaskActionProvider
                        persistenceProvider={mongoPersistenceProvider}
                    >
                        <TaskNavigationProvider>
                            <TaskDragDropProvider
                                listNames={[
                                    'DAILY_TODO',
                                    'DAILY_DONE',
                                    'INBOX',
                                ]}
                            >
                                <DashboardContent />
                            </TaskDragDropProvider>
                        </TaskNavigationProvider>
                    </TaskActionProvider>
                </TaskListsProvider>
            </div>
        </Layout>
    );
};

export default DashboardPage;
