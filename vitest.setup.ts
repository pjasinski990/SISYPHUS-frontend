import { vi } from "vitest";
import '@testing-library/jest-dom';

window.HTMLElement.prototype.scrollTo = vi.fn();
