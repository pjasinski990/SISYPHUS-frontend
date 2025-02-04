import { SlidingPanel } from 'src/components/library/SlidingPanel';
import { LeftMenu, TabValue } from 'src/components/left_menu/LeftMenu';
import { SlidingPanelToggleRibbon } from 'src/components/library/SlidingPanelToggleRibbon';
import { DailyPlanDashboard } from 'src/components/daily_plan/DailyPlanDashboard';
import React, { useCallback, useMemo, useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Shortcut } from 'src/components/context/ShortcutsContext';
import { useRegisterShortcut } from 'src/components/hooks/useRegisterShortcut';
import { useTaskDragAndDrop } from 'src/components/context/TaskDragDropContext';
import { TaskNavigationProvider, useTaskNavigation } from 'src/components/navigation/TaskNavigationContext';
import { TaskActionProvider } from 'src/components/context/TaskActionContext';
import { mongoPersistenceProvider } from '../persistence_provider/MongoPersistenceProvider';
import { useShortcutScope } from './hooks/useShortcutScope';
import { Movement } from './navigation/Movement';

export const DashboardContent: React.FC = () => {
    const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<TabValue>('inbox');
    const { onDragEnd } = useTaskDragAndDrop();

    const shortcutScope = 'dashboardContent';
    useShortcutScope(shortcutScope);

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
            scope: shortcutScope,
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
            scope: shortcutScope,
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
            scope: shortcutScope,
        }),
        [toggleTab]
    );

    useRegisterShortcut(toggleTaskPickerShortcut);
    useRegisterShortcut(openInboxShortcut);
    useRegisterShortcut(openReusableTasksShortcut);

    return (
        <TaskNavigationProvider>
            <TaskNavigationHandler shortcutScope={shortcutScope} />
            <TaskActionProvider persistenceProvider={mongoPersistenceProvider}>
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
                            <DailyPlanDashboard />
                        </div>
                    </DragDropContext>
                </div>
            </TaskActionProvider>
        </TaskNavigationProvider>
    );
};

const TaskNavigationHandler: React.FC<{ shortcutScope: string }> = ({ shortcutScope }) => {
    const { moveHighlight, clearHighlight, performAction } =
        useTaskNavigation();

    const moveLeftShortcut: Shortcut = useMemo(
        () => ({
            id: 'move-highlight-left',
            keys: ['h'],
            action: () => moveHighlight(Movement.LEFT),
            description: 'Move highlight left',
            order: 3,
            scope: shortcutScope
        }),
        [moveHighlight, shortcutScope]
    );

    const moveDownShortcut: Shortcut = useMemo(
        () => ({
            id: 'move-highlight-down',
            keys: ['j'],
            action: () => moveHighlight(Movement.DOWN),
            description: 'Move highlight down',
            order: 3,
            scope: shortcutScope
        }),
        [moveHighlight, shortcutScope]
    );

    const moveUpShortcut: Shortcut = useMemo(
        () => ({
            id: 'move-highlight-up',
            keys: ['k'],
            action: () => moveHighlight(Movement.UP),
            description: 'Move highlight up',
            order: 3,
            scope: shortcutScope
        }),
        [moveHighlight, shortcutScope]
    );

    const moveRightShortcut: Shortcut = useMemo(
        () => ({
            id: 'move-highlight-right',
            keys: ['l'],
            action: () => moveHighlight(Movement.RIGHT),
            description: 'Move highlight right',
            order: 3,
            scope: shortcutScope
        }),
        [moveHighlight, shortcutScope]
    );

    const moveAllUpShortcut: Shortcut = useMemo(
        () => ({
            id: 'move-highlight-all-up',
            keys: ['g g'],
            action: () => moveHighlight(Movement.ALL_UP),
            description: 'Move highlight to the top',
            order: 3,
            scope: shortcutScope
        }),
        [moveHighlight, shortcutScope]
    );

    const moveAllDownShortcut: Shortcut = useMemo(
        () => ({
            id: 'move-highlight-all-down',
            keys: ['G'],
            action: () => moveHighlight(Movement.ALL_DOWN),
            description: 'Move highlight to the bottom',
            order: 3,
            scope: shortcutScope
        }),
        [moveHighlight, shortcutScope]
    );

    const clearHighlightShortcut: Shortcut = useMemo(
        () => ({
            id: 'clear-highlight',
            keys: ['escape'],
            action: () => {
                clearHighlight();
            },
            description: 'Clear highlight',
            order: 4,
            scope: shortcutScope
        }),
        [clearHighlight, shortcutScope]
    );

    const editTaskShortcut: Shortcut = useMemo(
        () => ({
            id: 'edit-highlighted-task',
            keys: ['e'],
            action: () => performAction('edit'),
            description: 'Edit highlighted task',
            order: 3,
            scope: shortcutScope
        }),
        [performAction, shortcutScope]
    );

    const deleteTaskShortcut: Shortcut = useMemo(
        () => ({
            id: 'delete-highlighted-task',
            keys: ['x'],
            action: () => performAction('delete'),
            description: 'Delete highlighted task',
            order: 3,
            scope: shortcutScope
        }),
        [performAction, shortcutScope]
    );

    const taskDetailsShortcut: Shortcut = useMemo(
        () => ({
            id: 'show-highlighted-task-details',
            keys: ['d'],
            action: () => performAction('show-details'),
            description: 'Show highlighted task details',
            order: 3,
            scope: shortcutScope
        }),
        [performAction, shortcutScope]
    );

    const moveTaskRightShortcut: Shortcut = useMemo(
        () => ({
            id: 'move-task-right',
            keys: ['shift', 'l'],
            action: () => performAction('move-next'),
            description: 'Move highlighted task right',
            order: 3,
            scope: shortcutScope
        }),
        [performAction, shortcutScope]
    );

    const moveTaskLeftShortcut: Shortcut = useMemo(
        () => ({
            id: 'move-task-left',
            keys: ['shift', 'h'],
            action: () => performAction('move-prev'),
            description: 'Move highlighted task left',
            order: 3,
            scope: shortcutScope
        }),
        [performAction, shortcutScope]
    );

    const openUnravelDialogShortcut: Shortcut = useMemo(
        () => ({
            id: 'open-unravel-dialog',
            keys: ['u'],
            action: () => performAction('show-unravel'),
            description: 'Open unravel dialog for the highlighted task',
            order: 3,
            scope: shortcutScope
        }),
        [performAction, shortcutScope]
    );

    useRegisterShortcut(moveLeftShortcut);
    useRegisterShortcut(moveDownShortcut);
    useRegisterShortcut(moveUpShortcut);
    useRegisterShortcut(moveRightShortcut);
    useRegisterShortcut(moveAllUpShortcut);
    useRegisterShortcut(moveAllDownShortcut);
    useRegisterShortcut(clearHighlightShortcut);
    useRegisterShortcut(editTaskShortcut);
    useRegisterShortcut(deleteTaskShortcut);
    useRegisterShortcut(taskDetailsShortcut);
    useRegisterShortcut(moveTaskRightShortcut);
    useRegisterShortcut(moveTaskLeftShortcut);
    useRegisterShortcut(openUnravelDialogShortcut);

    return null;
};
