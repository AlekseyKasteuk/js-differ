import { TYPES } from './constants';
import {
  ArrayPatch,
  ArrayDiff,
  Diff,
  Path,
  CheckFunction,
  GetFunctionGeneric,
  ObjectPatch,
  ObjectDiff,
  GetOptions,
  ObjectKey,
} from './types';

const isReplaceDefault: CheckFunction = (source, target) => {
  const sourceType = typeof source;
  const targetType = typeof target;
  return (
    sourceType !== targetType ||
    sourceType !== 'object' ||
    source === null ||
    target === null ||
    Array.isArray(source) !== Array.isArray(target)
  );
};

const getArrayDiff = (getDiff: GetFunctionGeneric<Diff>, source: any[], target: any[], path: Path): Diff => {
  const diffs: ArrayDiff = [];
  let replacedCount = 0;
  for (let index = 0; index < target.length; index++) {
    const item = target[index];
    const sourceItem = source[index];
    if (item !== sourceItem) {
      const indexInSource = source.findIndex((sourceItem) => sourceItem === item);
      if (indexInSource !== -1) {
        diffs.push([index, indexInSource !== -1 ? indexInSource : getDiff(sourceItem, item, path.concat(index))]);
      } else {
        const diff = getDiff(sourceItem, item, path.concat(index));
        if (diff !== null) {
          if (diff[0] === TYPES.replace) {
            replacedCount++;
          }
          diffs.push([index, diff]);
        }
      }
    }
  }

  if (target.length === source.length && diffs.length === 0) {
    return null;
  }

  if (target.length === replacedCount) {
    return [TYPES.replace, target];
  }

  return [TYPES.patchArray, [target.length, diffs]];
};

const getObjectDiff = (getDiff: GetFunctionGeneric<Diff>, source: object, target: object, path: Path): Diff => {
  const sourceKeys = new Set(Reflect.ownKeys(source));
  const diffs: ObjectDiff = [];
  const targetKeys = Reflect.ownKeys(target);
  let replacedCount = 0;
  for (const key of targetKeys) {
    const diff = getDiff(source[key as keyof object], target[key as keyof object], path.concat(key));
    if (diff !== null) {
      if (diff[0] === TYPES.replace) {
        replacedCount++;
      }
      diffs.push([key as ObjectKey, diff]);
    }
    sourceKeys.delete(key);
  }

  if (sourceKeys.size === 0 && diffs.length === 0) {
    return null;
  }

  if (targetKeys.length === replacedCount) {
    return [TYPES.replace, target];
  }

  return [TYPES.patchObject, [Array.from(sourceKeys) as ObjectKey[], diffs]];
};

const getDiffCreator = (isEqual: CheckFunction, isReplace: CheckFunction): GetFunctionGeneric<Diff> => {
  return function getDiff(source, target, path) {
    if (source === target || isEqual(source, target, path)) {
      return null;
    }
    if (isReplaceDefault(source, target, path) || isReplace(source, target, path)) {
      return [TYPES.replace, target];
    }
    if (Array.isArray(source) && Array.isArray(target)) {
      return getArrayDiff(getDiff, source, target, path);
    }
    if (typeof source === 'object' && typeof target === 'object') {
      return getObjectDiff(getDiff, source, target, path);
    }
    throw Error('Invalid diff confog');
  };
};

export const getDiff = (
  source: any,
  target: any,
  { isEqual = () => false, isReplace = () => false }: GetOptions = {},
) => getDiffCreator(isEqual, isReplace)(source, target, []);

export default getDiff;
