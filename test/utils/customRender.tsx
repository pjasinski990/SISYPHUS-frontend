import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MockAuthProvider } from '../mocks/MockAuthContext';
import { AuthContextType } from '../../src/components/context/AuthContext';
import { MockShortcutsProvider } from '../mocks/MockShortcutsContext';
import { ShortcutsContextType } from '../../src/components/context/ShortcutsContext';

interface CustomRenderOptions extends RenderOptions {
    authValue?: Partial<AuthContextType>;
    shortcutsValue?: Partial<ShortcutsContextType>;
}

const customRender = (
    ui: ReactElement,
    { authValue, shortcutsValue, ...options }: CustomRenderOptions = {}
) => {
    return render(
        <MockAuthProvider value={authValue}>
            <MockShortcutsProvider value={shortcutsValue}>
                {ui}
            </MockShortcutsProvider>
        </MockAuthProvider>,
        options
    );
};

export * from '@testing-library/react';
export { customRender };
