import React, { useCallback, useMemo, useState } from 'react';
import Layout from "src/components/Layout";
import { DailyPlanDashboard } from "src/components/daily_plan/DailyPlanDashboard";
import { SlidingPanel } from "src/components/library/SlidingPanel";
import { DailyPlanProvider } from "src/components/context/DailyPlanContext";
import { useRegisterShortcut } from "src/components/context/RegisterShortcutContext";
import { Shortcut } from "src/components/context/ShortcutsContext";
import { LeftMenu, TabValue } from "src/components/left_menu/LeftMenu";
import { SlidingPanelToggleRibbon } from "src/components/library/SlidingPanelToggleRibbon";
import { TaskInteractionContext } from "src/components/context/TaskInteractionContext";

const Dashboard: React.FC = () => {
    const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<TabValue>('inbox');

    const toggleLeftMenu = useCallback(() => {
        setIsLeftMenuOpen(prev => !prev);
    }, []);

    const toggleTab = useCallback((tab: TabValue) => {
        if (activeTab === tab) {
            setIsLeftMenuOpen(false);
        }
        setActiveTab(tab);
        if (!isLeftMenuOpen) {
            setIsLeftMenuOpen(true);
        }
    }, [activeTab, isLeftMenuOpen]);

    const toggleTaskPickerShortcut: Shortcut = useMemo(() => ({
        id: 'toggle-reusable-tasks-picker',
        keys: ['Q'],
        action: toggleLeftMenu,
        description: 'Toggle reusable tasks picker',
        order: 2,
    }), [toggleLeftMenu]);

    const openInboxShortcut: Shortcut = useMemo(() => ({
        id: 'open-inbox',
        keys: ['1'],
        action: () => toggleTab('inbox'),
        description: 'Switch to inbox panel',
        order: 3,
    }), [toggleTab]);

    const openReusableTasksShortcut: Shortcut = useMemo(() => ({
        id: 'open-reusable-tasks',
        keys: ['2'],
        action: () => toggleTab('reusableTasks'),
        description: 'Switch to reusable tasks panel',
        order: 4,
    }), [toggleTab]);

    useRegisterShortcut(toggleTaskPickerShortcut);
    useRegisterShortcut(openInboxShortcut);
    useRegisterShortcut(openReusableTasksShortcut);

    return (
        <Layout>
            <div className="flex h-full">
                <DailyPlanProvider>
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
                        <SlidingPanelToggleRibbon toggleOpen={toggleLeftMenu} isOpen={isLeftMenuOpen} />
                        <DailyPlanDashboard />
                    </div>
                </DailyPlanProvider>
            </div>
        </Layout>
    );
};

export default Dashboard;
