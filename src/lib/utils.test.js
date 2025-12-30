import { cn } from './utils';

describe('cn', () => {
  it('merges class names and handles conditionals', () => {
    const result = cn('a', undefined, null, false && 'x', 'b', ['c', ['d']], { e: true, f: false });
    expect(result).toContain('a');
    expect(result).toContain('b');
    expect(result).toContain('c');
    expect(result).toContain('d');
    expect(result).toContain('e');
    expect(result).not.toContain('f');
  });
});
