import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Esto ayuda a que las librerías que esperan 'jest' funcionen con 'vitest'
window.jest = vi;