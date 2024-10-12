import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { BaseDialog } from './BaseDialog';
import { Task } from '../../service/taskService';
import { generativeService } from '../../service/generativeService';
import { TaskPropertiesProvider } from 'src/components/context/TaskPropertiesContext';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { TaskLoadingPlaceholder } from 'src/components/library/LoadingPlaceholder';
import { TaskActionProvider } from 'src/components/context/TaskActionContext';
import {
    TaskListsProvider,
    useTaskList,
} from 'src/components/context/TaskListsContext';
import { Textarea } from '../ui/textarea';
import { TaskList } from '../../lib/taskList';
import { TaskNavigationProvider } from '../context/TaskNavigationContext';
import { ScratchTaskList } from '../task_list/ScratchTaskList';
import { InMemoryPersistenceProvider } from '../../persistence_provider/InMemoryPersistenceProvider';

interface UnravelDialogProps {
    open: boolean;
    unraveledTask: Task | null;
    onSubmit: (selectedTasks: Task[]) => void;
    onCancel: () => void;
}

export const UnravelDialog: React.FC<UnravelDialogProps> = ({
    open,
    unraveledTask,
    onSubmit,
    onCancel,
}) => {
    const formRef = useRef<HTMLFormElement | null>(null);
    const [proposedTasks, setProposedTasks] = useState<Task[]>([]);
    const [additionalContext, setAdditionalContext] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const currentTask = unraveledTask;

    const scratchList: TaskList = useMemo(
        () => ({
            name: 'SCRATCH',
            tasks: proposedTasks,
            displayOrder: 0,
        }),
        [proposedTasks]
    );

    const getTasks = useCallback(() => proposedTasks, [proposedTasks]);
    const getTaskList = useCallback(
        (listName: string) => (listName === 'SCRATCH' ? scratchList : null),
        [scratchList]
    );

    const persistenceProvider = useMemo(
        () =>
            new InMemoryPersistenceProvider(
                getTasks,
                setProposedTasks,
                getTaskList
            ),
        [getTasks, setProposedTasks, getTaskList]
    );

    useEffect(() => {
        if (open) {
            setProposedTasks([]);
            setAdditionalContext('');
            setIsLoading(false);
        }
    }, [open]);

    const handleSubmitProposedTasks = useCallback(() => {
        if (formRef.current) {
            onSubmit(proposedTasks);
        }
    }, [onSubmit, proposedTasks]);

    const refreshPropositions = useCallback(() => {
        if (!open || !currentTask) {
            return;
        }
        setProposedTasks([]);
        setIsLoading(true);

        generativeService
            .unravel({ taskId: currentTask.id!, additionalContext })
            .then(res => setProposedTasks(res))
            .catch(error => {
                console.error('Error fetching proposed tasks:', error);
            })
            .finally(() => setIsLoading(false));
    }, [open, currentTask, additionalContext]);

    const extraKeyHandlers = useCallback(
        (event: React.KeyboardEvent) => {
            if (event.ctrlKey && event.key === 'Enter') {
                event.preventDefault();
                event.stopPropagation();
                handleSubmitProposedTasks();
            } else if (event.key === 'Enter') {
                const activeElement = document.activeElement;
                const isTextareaFocused =
                    activeElement &&
                    (activeElement.id === 'additionalContext' ||
                        activeElement.closest('#additionalContext'));
                if (!isTextareaFocused) {
                    event.preventDefault();
                    event.stopPropagation();
                    refreshPropositions();
                }
            }
        },
        [handleSubmitProposedTasks, refreshPropositions]
    );

    if (!currentTask) {
        return null;
    }

    return (
        <BaseDialog
            open={open}
            onCancel={onCancel}
            title={`Unravel Task: ${currentTask.title}`}
            description={`Unravel Task: ${currentTask.title}`}
            extraKeyHandlers={extraKeyHandlers}
            closeAnimationDuration={500}
            contentClassName={'min-w-[600px]'}
        >
            <form ref={formRef} onSubmit={handleSubmitProposedTasks}>
                <div className="flex flex-col">
                    <label
                        htmlFor="additionalContext"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Context
                    </label>
                    <Textarea
                        id="additionalContext"
                        name="additionalContext"
                        value={additionalContext}
                        onChange={e => setAdditionalContext(e.target.value)}
                        placeholder="Additional context for the task"
                        className={'mb-6'}
                    />
                    <Button
                        type="button"
                        onClick={refreshPropositions}
                        disabled={isLoading}
                        className={'mx-0.5'}
                    >
                        {isLoading ? 'Loading...' : 'Regenerate propositions'}
                    </Button>
                </div>
            </form>
            <div
                className={
                    'max-h-[600px] overflow-auto px-8 py-2 flex flex-col space-y-2'
                }
            >
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <TaskLoadingPlaceholder nTasks={3} />
                    </div>
                ) : proposedTasks.length > 0 ? (
                    <>
                        <TaskListsProvider
                            listNames={['SCRATCH']}
                            persistenceProvider={persistenceProvider}
                        >
                            <TaskActionProvider
                                persistenceProvider={persistenceProvider}
                            >
                                <TaskPropertiesProvider
                                    isDraggable={false}
                                    isFoldable={false}
                                >
                                    <WalkableUnravelTaskList />
                                </TaskPropertiesProvider>
                            </TaskActionProvider>
                        </TaskListsProvider>
                    </>
                ) : (
                    <p className="text-gray-500">No tasks generated.</p>
                )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <Button type="button" onClick={onCancel} variant="secondary">
                    Cancel
                </Button>
                <Button
                    disabled={proposedTasks.length === 0 || isLoading}
                    onClick={handleSubmitProposedTasks}
                >
                    Submit
                </Button>
            </div>
        </BaseDialog>
    );
};

const WalkableUnravelTaskList: React.FC = () => {
    const listContext = useTaskList('SCRATCH');

    return (
        <TaskNavigationProvider>
            <ScratchTaskList
                taskList={listContext.taskList}
                placeholderNode={<></>}
            />
        </TaskNavigationProvider>
    );
};
