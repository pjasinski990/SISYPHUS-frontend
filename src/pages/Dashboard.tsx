// Dashboard.tsx
import React, { useCallback, useMemo, useState } from 'react';
import Layout from "src/components/Layout";
import { DailyPlanDashboard } from "src/components/daily_plan/DailyPlanDashboard";
import { SlidingPanel } from "src/components/library/SlidingPanel";
import { DailyPlanProvider } from "src/components/context/DailyPlanContext";
import { useRegisterShortcut } from "src/components/context/RegisterShortcutContext";
import { Shortcut } from "src/components/context/ShortcutsContext";
import { LeftMenu } from "src/components/left_menu/LeftMenu";
import { SlidingPanelToggleRibbon } from "src/components/library/SlidingPanelToggleRibbon";

const Dashboard: React.FC = () => {
    const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(true);

    const toggleLeftMenu = useCallback(() => {
        setIsLeftMenuOpen(!isLeftMenuOpen);
    }, [isLeftMenuOpen]);

    const toggleTaskPickerShortcut: Shortcut = useMemo(() => ({
        id: 'toggle-reusable-tasks-picker',
        keys: ['Shift', 'R'],
        action: toggleLeftMenu,
        description: 'Toggle reusable tasks picker',
        order: 2,
    }), [toggleLeftMenu]);

    useRegisterShortcut(toggleTaskPickerShortcut);

    return (
        <Layout>
            <div className="flex h-full">
                <DailyPlanProvider>
                    <SlidingPanel
                        isOpen={isLeftMenuOpen}
                        setIsOpen={toggleLeftMenu}
                        maxWidth={400}
                    >
                        <LeftMenu/>
                    </SlidingPanel>
                    <div className={`flex flex-1 transition-all duration-200`}>
                        <SlidingPanelToggleRibbon toggleOpen={toggleLeftMenu} isOpen={isLeftMenuOpen}/>
                        <DailyPlanDashboard />
                    </div>
                </DailyPlanProvider>
            </div>
        </Layout>
    );
};

export default Dashboard;
