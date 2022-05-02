import { Path, CheckFunction, GetOptions } from './types';
import { getDiff, applyDiff } from './index';

const getResult = (from: any, to: any, options?: GetOptions) => {
  const diff = getDiff(from, to, options);
  const result = applyDiff(from, diff);
  return result;
};

const get = (value: any, path: Path): any => {
  if (!path.length) {
    return value;
  }
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }
  const [key, ...rest] = path;
  return get(value[key], rest);
};

const strictEqual = (from: any, to: any, options?: GetOptions, compareWith: any = to) => {
  const result = getResult(from, to, options);
  return expect(result).toBe(compareWith);
};
const equal = (from: any, to: any, options?: GetOptions, compareWith: any = to) =>
  expect(getResult(from, to, options)).toStrictEqual(compareWith);

const sum = (array: any[]): number => array.reduce((acc: number, item: any): number => acc + item, 0);

describe('JS Differ', () => {
  it('Common functionality', () => {
    const from = {
      a: new Array(5).fill(0).map((_, i) => ({ i })),
      b: {
        a: new Array(5).fill(0).map((_, i) => ({ i })),
        b: {
          a: 10,
          b: 20,
          c: 30,
        },
        c: 100,
      },
      c: 100,
    };
    const to = {
      a: new Array(5).fill(0).map((_, i) => ({ i })),
      b: {
        a: [1, 2, 3, 4],
        b: from.b.b,
        c: 100,
      },
      c: 10,
    };
    equal(from, to);
  });
  describe('Custom check functions', () => {
    it('Custom isEqual function', () => {
      const structure = {
        constant: 'constant',
        abs: 'abs',
        sum: 'sum',
      };
      const from = {
        constant: 100,
        abs: 1,
        sum: [3, 7],
      };
      const to = {
        constant: 10,
        abs: -1,
        sum: [2, 8],
      };
      const isEqual: CheckFunction = (from, to, path) => {
        switch (get(structure, path)) {
          case 'constant':
            return true;
          case 'abs':
            return Math.abs(from) === Math.abs(to);
          case 'sum':
            return sum(from) === sum(to);
        }
        return false;
      };
      strictEqual(from, to);
      strictEqual(from, to, { isEqual }, from);
    });
    it('Custom isReplace function', () => {
      const isReplace: CheckFunction = (from, to, path) => path[0] === 'b';
      const from = { a: new Array(100).fill({}), b: new Array(100).fill({}) };
      const to = { a: new Array(100).fill({}), b: new Array(100).fill({}) };
      strictEqual(from, to, {}, from);
      const result = getResult(from, to, { isReplace });
      expect(result.a).toBe(from.a);
      expect(result.b).toBe(to.b);
    });
  });
});
