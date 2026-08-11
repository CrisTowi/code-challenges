import type { TrimInput, TrimType } from "./algorithm";

export const customInputs: Record<string, { input: TrimInput; description?: string }> = {
  leading: {
    input: {
      str: '   hello world   ',
      trimType: 'leading' as TrimType
    }
  },
  trailing: {
    input: {
      str: '   hello world   ',
      trimType: 'trailing' as TrimType
    }
  },
  both: {
    input: {
      str: '   hello world   ',
      trimType: 'both' as TrimType
    }
  },
};
