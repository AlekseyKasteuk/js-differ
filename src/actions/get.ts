import { FIELDS, TYPES } from '../constants';
import { Diff, Path, CheckFunction, GetOptions, GetFunction } from '../types';
import * as diffs from '../diffs';

export const isEqualDefault: CheckFunction = (from, to) => from === to;
export const isRemoveDefault: CheckFunction = (_, to) => to === undefined;
export const isReplaceDefault: CheckFunction = (from, to) => {
  const fromType = typeof from;
  const toType = typeof to;
  return fromType !== toType || fromType !== 'object' || from === null || to === null;
};

const isPatch: CheckFunction = (from, to) =>
  typeof from === 'object' &&
  from !== null &&
  typeof to === 'object' &&
  to !== null &&
  Array.isArray(from) === Array.isArray(to);

export const getDiff = (
  from: any,
  to: any,
  {
    isEqual = isEqualDefault,
    isRemove = isRemoveDefault,
    isReplace = isReplaceDefault,
    isCustom,
    getCustomParams,
    customDiffPriority = 3,
  }: Partial<GetOptions> = {},
) => {
  const conditionToGetterPairs: [CheckFunction, GetFunction][] = [
    [isEqual, diffs.leave.get],
    [isRemove, diffs.remove.get],
    [isReplace, diffs.replace.get],
    [isPatch, (...args) => (Array.isArray(args[0]) ? diffs.patchArray.get(...args) : diffs.patchObject.get(...args))],
  ];
  if (isCustom) {
    if (!getCustomParams) {
      throw new Error('Custom params getter not specified');
    }
    conditionToGetterPairs.splice(customDiffPriority, 0, [
      isCustom,
      (...args) => ({ [FIELDS.type]: TYPES.custom, [FIELDS.customParams]: getCustomParams(...args) }),
    ]);
  }
  const getDiffInner = (f: any, t: any, path: Path): Diff => {
    const getDiffLocal = conditionToGetterPairs.find(([condition]) => condition(f, t, path))?.[1];
    if (!getDiffLocal) {
      throw new Error('Unhandled condition');
    }
    return getDiffLocal(f, t, path, getDiffInner);
  };
  return getDiffInner(from, to, []);
};

export default getDiff;
