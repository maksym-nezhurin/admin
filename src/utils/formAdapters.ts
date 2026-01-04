import type { TSelectOption } from '../types/common';

export const prepareOptionsForSelect = (options: Array<TSelectOption> = []) => {
    return options.map((opt) => ({
        label: String(opt.label),
        value: String(opt.value),
    }));
}