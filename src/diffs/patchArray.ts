import { TYPES, FIELDS } from '../constants';
import { PatchArrayDiff, PatchData, GetFunction, ApplyFunction, IsFunction } from '../types';
import * as replace from './replace';
import * as leave from './leave';

export const type = TYPES.patchArray;
export const get: GetFunction = (from, to, path, getDiff) => {
  const data: PatchData = {};
  const length = (to as any[]).length;
  let isAllReplace = true;
  let isChanged = false;
  for (let i = 0; i < length; i++) {
    const diff = getDiff(from[i], to[i], path.concat(i));
    if (isAllReplace && !replace.is(diff)) {
      isAllReplace = false;
    }
    if (!leave.is(diff)) {
      isChanged = true;
      data[i] = diff;
    }
  }
  if (isChanged || from.length !== length) {
    if (isAllReplace) {
      return replace.get(from, to, path, getDiff);
    }
    return {
      [FIELDS.type]: TYPES.patchArray,
      [FIELDS.length]: length,
      [FIELDS.data]: data,
    };
  }
  return leave.get(from, to, path, getDiff);
};
export const apply: ApplyFunction = (value, diff, path, applyDiff) => {
  const { [FIELDS.length]: length, [FIELDS.data]: data } = diff as PatchArrayDiff;
  const result = new Array(length);

  for (let i = 0; i < length; i++) {
    const patchDiff = data[i];
    if (patchDiff) {
      result[i] = applyDiff(value[i], patchDiff, path.concat(i));
    } else {
      result[i] = value[i];
    }
  }
  return result;
};
export const is: IsFunction = (diff) => diff[FIELDS.type] === type;
