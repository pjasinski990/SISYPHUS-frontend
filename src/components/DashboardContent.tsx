import { SlidingPanel } from 'src/components/library/SlidingPanel';
import { LeftMenu, TabValue } from 'src/components/left_menu/LeftMenu';
import { SlidingPanelToggleRibbon } from 'src/components/library/SlidingPanelToggleRibbon';
import { DailyPlanDashboard } from 'src/components/daily_plan/DailyPlanDashboard';
import React, { useCallback, useMemo, useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Shortcut } from 'src/components/context/ShortcutsContext';
import { useRegisterShortcut } from 'src/components/context/RegisterShortcutContext';
import {
    TaskDragDropProvider,
    useTaskDragAndDrop,
} from 'src/components/context/TaskDragDropContext';

export const DashboardContent: React.FC = () => {
    const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<TabValue>('inbox');
    const { onDragEnd } = useTaskDragAndDrop();

    const toggleLeftMenu = useCallback(() => {
        setIsLeftMenuOpen(prev => !prev);
    }, []);

    const toggleTab = useCallback(
        (tab: TabValue) => {
            if (activeTab === tab) {
                setIsLeftMenuOpen(false);
            }
            setActiveTab(tab);
            if (!isLeftMenuOpen) {
                setIsLeftMenuOpen(true);
            }
        },
        [activeTab, isLeftMenuOpen]
    );

    const toggleTaskPickerShortcut: Shortcut = useMemo(
        () => ({
            id: 'toggle-reusable-tasks-picker',
            keys: ['Q'],
            action: toggleLeftMenu,
            description: 'Toggle reusable tasks picker',
            order: 2,
        }),
        [toggleLeftMenu]
    );

    const openInboxShortcut: Shortcut = useMemo(
        () => ({
            id: 'open-inbox',
            keys: ['1'],
            action: () => toggleTab('inbox'),
            description: 'Switch to inbox panel',
            order: 3,
        }),
        [toggleTab]
    );

    const openReusableTasksShortcut: Shortcut = useMemo(
        () => ({
            id: 'open-reusable-tasks',
            keys: ['2'],
            action: () => toggleTab('reusableTasks'),
            description: 'Switch to reusable tasks panel',
            order: 4,
        }),
        [toggleTab]
    );

    useRegisterShortcut(toggleTaskPickerShortcut);
    useRegisterShortcut(openInboxShortcut);
    useRegisterShortcut(openReusableTasksShortcut);

    return (
        <TaskDragDropProvider listNames={['DAILY_TODO', 'DAILY_DONE', 'INBOX']}>
            <DragDropContext onDragEnd={onDragEnd}>
                <SlidingPanel
                    isOpen={isLeftMenuOpen}
                    setIsOpen={setIsLeftMenuOpen}
                    maxWidth={400}
                >
                    <LeftMenu
                        activeTab={activeTab}
                        onActiveTabChange={setActiveTab}
                    />
                </SlidingPanel>
                <div className="flex flex-1 transition-all duration-200">
                    <SlidingPanelToggleRibbon
                        toggleOpen={toggleLeftMenu}
                        isOpen={isLeftMenuOpen}
                    />
                    <DailyPlanDashboard />
                </div>
            </DragDropContext>
        </TaskDragDropProvider>
    );
};
