import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { DraggableProvider, useDraggable } from '../../../src/components/context/DraggableContext';

const mockProvided: Partial<DraggableProvided> = {
    draggableProps: {
        'data-rfd-draggable-context-id': 'mock-cid',
        'data-rfd-draggable-id': 'mock-id'
    },
    innerRef: vi.fn()
};

const mockSnapshot: DraggableStateSnapshot = {
    isDragging: false,
    draggingOver: null,
    dropAnimation: null,
    mode: 'FLUID',
    combineTargetFor: null,
    combineWith: null,
    isDropAnimating: false,
    isClone: false,
};

const TestComponent: React.FC = () => {
    const { provided, snapshot } = useDraggable();
    return (
        <div data-testid="test-component">
            <p data-testid="drag-props">
                Dragging: {snapshot.isDragging ? 'Yes' : 'No'}
            </p>
            <p data-testid="drag-id">{provided.draggableProps['data-rfd-draggable-context-id']}</p>
        </div>
    );
};

describe('DraggableContext', () => {
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
    })

    afterEach(() => {
        vi.restoreAllMocks();
    })

    it('should throw an error if useDraggable is used outside DraggableProvider', () => {
        expect(() => render(<TestComponent />)).toThrow(
            'useDraggable must be used within a DraggableProvider'
        );
    });

    it('should provide context correctly when wrapped in DraggableProvider', () => {
        render(
            <DraggableProvider provided={mockProvided as DraggableProvided} snapshot={mockSnapshot}>
                <TestComponent />
            </DraggableProvider>
        );

        const component = screen.getByTestId('test-component');
        const dragProps = screen.getByTestId('drag-props');
        const dragId = screen.getByTestId('drag-id');

        expect(component).toBeInTheDocument();
        expect(dragProps).toHaveTextContent('Dragging: No');
        expect(dragId).toHaveTextContent('mock-cid');
    });
});
