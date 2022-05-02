import { TYPES } from './constants';
import {
  Diff,
  ArrayPatch,
  ObjectPatch,
  ObjectKey,
  ArrayDiff,
  ArrayElement,
  ReplaceDiff,
  PatchArrayDiff,
} from './types';

const replace = <T>(value: T): T => value;

const patchArray = ([length, patches]: ArrayPatch, source: any[]): any => {
  const result = new Array<unknown>(length);
  const patchMap = patches.reduce<{ [key: number]: Diff | number }>((acc, [index, diff]) => {
    acc[index] = diff;
    return acc;
  }, {});
  for (let index = 0; index < length; index++) {
    if (index in patchMap) {
      const patch = patchMap[index];
      if (typeof patch === 'number') {
        result[index] = source[patch];
      } else {
        result[index] = applyDiff(source[index], patch);
      }
    } else {
      result[index] = source[index];
    }
  }
  return result;
};

const patchObject = ([deletedKeys, patches]: ObjectPatch, source: any): any => {
  const result = { ...source };
  for (const key of deletedKeys) {
    delete result[key as keyof object];
  }
  for (const [key, diff] of patches) {
    result[key as keyof object] = applyDiff(result[key as keyof object], diff);
  }
  return result;
};

export const applyDiff = (source: any, diff: Diff): any => {
  if (diff === null) {
    return source;
  }
  const [type, options] = diff;
  switch (type) {
    case TYPES.replace:
      return replace(options);
    case TYPES.patchArray:
      if (!Array.isArray(source)) {
        throw new TypeError('Source is not an array');
      }
      return patchArray(options as ArrayPatch, source);
    case TYPES.patchObject:
      if (typeof source !== 'object') {
        throw new TypeError('Source is not an object');
      }
      return patchObject(options as ObjectPatch, source);
    default:
      throw new TypeError('Invalid diff config');
  }
};

export default applyDiff;
