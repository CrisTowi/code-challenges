import type { TrimInput, TrimType } from "./algorithm";

export const customInputs: Record<string, { input: TrimInput; description?: string }> = {
  leading: {
    input: {
      str: '   hello world   ',
      trimType: 'leading' as TrimType,
    },
    description: 'classic: leading trim only',
  },
  trailing: {
    input: {
      str: '   hello world   ',
      trimType: 'trailing' as TrimType,
    },
    description: 'classic: trailing trim only',
  },
  both: {
    input: {
      str: '   hello world   ',
      trimType: 'both' as TrimType,
    },
    description: 'classic: both sides trim',
  },
  empty: {
    input: {
      str: '',
      trimType: 'both' as TrimType,
    },
    description: 'empty string — nothing to eat',
  },
  noop: {
    input: {
      str: 'helloworld',
      trimType: 'both' as TrimType,
    },
    description: 'no surrounding whitespace — pacman never moves',
  },
  "all-spaces": {
    input: {
      str: '       ',
      trimType: 'both' as TrimType,
    },
    description: 'all spaces — both pacmen eat everything',
  },
  mixed: {
    input: {
      str: '  hello   world  ',
      trimType: 'both' as TrimType,
    },
    description: 'internal spaces are preserved — only the ends are eaten',
  },
  "single-each": {
    input: {
      str: ' hello world ',
      trimType: 'both' as TrimType,
    },
    description: 'one leading + one trailing space',
  },
};