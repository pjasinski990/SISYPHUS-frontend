import { SlidingPanel } from 'src/components/library/SlidingPanel';
import { LeftMenu, TabValue } from 'src/components/left_menu/LeftMenu';
import { SlidingPanelToggleRibbon } from 'src/components/library/SlidingPanelToggleRibbon';
import { DailyPlanDashboard } from 'src/components/daily_plan/DailyPlanDashboard';
import React, { useCallback, useMemo, useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Shortcut } from 'src/components/context/ShortcutsContext';
import { useRegisterShortcut } from 'src/components/context/RegisterShortcutContext';
import { useTaskDragAndDrop } from 'src/components/context/TaskDragDropContext';
import {
    TaskNavigationProvider,
    useTaskNavigation,
} from 'src/components/context/TaskNavigationContext';
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
            keys: ['q'],
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
            order: 2,
        }),
        [toggleTab]
    );

    const openReusableTasksShortcut: Shortcut = useMemo(
        () => ({
            id: 'open-reusable-tasks',
            keys: ['2'],
            action: () => toggleTab('reusableTasks'),
            description: 'Switch to reusable tasks panel',
            order: 2,
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
    const { moveHighlight, clearHighlight, performAction } =
        useTaskNavigation();

    const moveLeftShortcut: Shortcut = useMemo(
        () => ({
            id: 'move-highlight-left',
            keys: ['h'],
            action: () => moveHighlight('left'),
            description: 'Move highlight left',
            order: 3,
        }),
        [moveHighlight]
    );

    const moveDownShortcut: Shortcut = useMemo(
        () => ({
            id: 'move-highlight-down',
            keys: ['j'],
            action: () => moveHighlight('down'),
            description: 'Move highlight down',
            order: 3,
        }),
        [moveHighlight]
    );

    const moveUpShortcut: Shortcut = useMemo(
        () => ({
            id: 'move-highlight-up',
            keys: ['k'],
            action: () => moveHighlight('up'),
            description: 'Move highlight up',
            order: 3,
        }),
        [moveHighlight]
    );

    const moveRightShortcut: Shortcut = useMemo(
        () => ({
            id: 'move-highlight-right',
            keys: ['l'],
            action: () => moveHighlight('right'),
            description: 'Move highlight right',
            order: 3,
        }),
        [moveHighlight]
    );

    const clearHighlightShortcut: Shortcut = useMemo(
        () => ({
            id: 'clear-highlight',
            keys: ['Escape'],
            action: () => {
                clearHighlight();
            },
            description: 'Clear highlight',
            order: 4,
        }),
        [clearHighlight]
    );

    const editTaskShortcut: Shortcut = useMemo(
        () => ({
            id: 'edit-highlighted-task',
            keys: ['e'],
            action: () => performAction('edit'),
            description: 'Edit highlighted task',
            order: 3,
        }),
        [performAction]
    );

    const deleteTaskShortcut: Shortcut = useMemo(
        () => ({
            id: 'delete-highlighted-task',
            keys: ['x'],
            action: () => performAction('delete'),
            description: 'Delete highlighted task',
            order: 3,
        }),
        [performAction]
    );

    const taskDetailsShortcut: Shortcut = useMemo(
        () => ({
            id: 'show-highlighted-task-details',
            keys: ['d'],
            action: () => performAction('show-details'),
            description: 'Show highlighted task details',
            order: 3,
        }),
        [performAction]
    );

    const moveTaskRightShortcut: Shortcut = useMemo(
        () => ({
            id: 'move-task-right',
            keys: ['Shift', 'l'],
            action: () => performAction('move-next'),
            description: 'Move highlighted task right',
            order: 3,
        }),
        [performAction]
    );

    const moveTaskLeftShortcut: Shortcut = useMemo(
        () => ({
            id: 'move-task-left',
            keys: ['Shift', 'h'],
            action: () => performAction('move-prev'),
            description: 'Move highlighted task left',
            order: 3,
        }),
        [performAction]
    );

    const openUnravelDialogShortcut: Shortcut = useMemo(
        () => ({
            id: 'open-unravel-dialog',
            keys: ['u'],
            action: () => performAction('show-unravel'),
            description: 'Open unravel dialog for the highlighted task',
            order: 3,
        }),
        [performAction]
    );

    useRegisterShortcut(moveLeftShortcut);
    useRegisterShortcut(moveDownShortcut);
    useRegisterShortcut(moveUpShortcut);
    useRegisterShortcut(moveRightShortcut);
    useRegisterShortcut(clearHighlightShortcut);
    useRegisterShortcut(editTaskShortcut);
    useRegisterShortcut(deleteTaskShortcut);
    useRegisterShortcut(taskDetailsShortcut);
    useRegisterShortcut(moveTaskRightShortcut);
    useRegisterShortcut(moveTaskLeftShortcut);
    useRegisterShortcut(openUnravelDialogShortcut);

    return null;
};
