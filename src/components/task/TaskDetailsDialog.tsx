import React from 'react';
import { Task } from '../../service/taskService';
import { TaskDetails } from './TaskItemContent';

interface TaskDetailsDialogProps {
    task: Task;
    onClose: () => void;
}

export const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({
    task,
    onClose,
}) => {
    return (
        <div
            className="modal-overlay"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1000,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
            onClick={onClose}
        >
            <div
                className="modal-content"
                style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    maxWidth: '600px',
                    width: '90%',
                    maxHeight: '90%',
                    overflowY: 'auto',
                    position: 'relative',
                }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="close-button"
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '18px',
                        cursor: 'pointer',
                    }}
                >
                    ×
                </button>
                <h2 style={{ marginBottom: '20px' }}>{task.title}</h2>
                <TaskDetails task={task} />
            </div>
        </div>
    );
};
