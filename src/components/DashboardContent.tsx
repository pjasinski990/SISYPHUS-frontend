import { SlidingPanel } from 'src/components/library/SlidingPanel';
import { LeftMenu, TabValue } from 'src/components/left_menu/LeftMenu';
import { SlidingPanelToggleRibbon } from 'src/components/library/SlidingPanelToggleRibbon';
import { DailyPlanDashboard } from 'src/components/daily_plan/DailyPlanDashboard';
import React, { useCallback, useMemo, useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Shortcut } from 'src/components/context/ShortcutsContext';
import { useRegisterShortcut } from 'src/components/context/RegisterShortcutContext';
import { useTaskDragAndDrop } from 'src/components/context/TaskDragDropContext';
import { TaskNavigationProvider, useTaskNavigation } from 'src/components/context/TaskNavigationContext';
import { TaskActionProvider } from 'src/components/context/TaskActionContext';

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
        <TaskNavigationProvider>
            <TaskActionProvider>
                <div className={'flex flex-1'}>
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
                        <div className="flex flex-1 items-stretch">
                            <SlidingPanelToggleRibbon
                                toggleOpen={toggleLeftMenu}
                                isOpen={isLeftMenuOpen}
                            />
                            <TaskNavigationHandler />
                            <DailyPlanDashboard />
                        </div>
                    </DragDropContext>
                </div>
            </TaskActionProvider>
        </TaskNavigationProvider>
    );
};

const TaskNavigationHandler: React.FC = () => {
    const { moveHighlight, performAction } = useTaskNavigation();

    const moveLeftShortcut: Shortcut = useMemo(
        () => ({
            id: 'move-highlight-left',
            keys: ['h'],
            action: () => moveHighlight('h'),
            description: 'Move highlight left',
            order: 5,
        }),
        [moveHighlight]
    );

    const moveDownShortcut: Shortcut = useMemo(
        () => ({
            id: 'move-highlight-down',
            keys: ['j'],
            action: () => moveHighlight('j'),
            description: 'Move highlight down',
            order: 6,
        }),
        [moveHighlight]
    );

    const moveUpShortcut: Shortcut = useMemo(
        () => ({
            id: 'move-highlight-up',
            keys: ['k'],
            action: () => moveHighlight('k'),
            description: 'Move highlight up',
            order: 7,
        }),
        [moveHighlight]
    );

    const moveRightShortcut: Shortcut = useMemo(
        () => ({
            id: 'move-highlight-right',
            keys: ['l'],
            action: () => moveHighlight('l'),
            description: 'Move highlight right',
            order: 8,
        }),
        [moveHighlight]
    );

    const editTaskShortcut: Shortcut = useMemo(
        () => ({
            id: 'edit-highlighted-task',
            keys: ['e'],
            action: () => performAction('edit'),
            description: 'Edit highlighted task',
            order: 9,
        }),
        [performAction]
    );

    const deleteTaskShortcut: Shortcut = useMemo(
        () => ({
            id: 'delete-highlighted-task',
            keys: ['d'],
            action: () => performAction('delete'),
            description: 'Delete highlighted task',
            order: 10,
        }),
        [performAction]
    );

    useRegisterShortcut(moveLeftShortcut);
    useRegisterShortcut(moveDownShortcut);
    useRegisterShortcut(moveUpShortcut);
    useRegisterShortcut(moveRightShortcut);
    useRegisterShortcut(editTaskShortcut);
    useRegisterShortcut(deleteTaskShortcut);

    return null;
};
