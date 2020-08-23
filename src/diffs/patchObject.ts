import { TYPES, FIELDS } from '../constants';
import { PatchObjectDiff, PatchData, GetFunction, ApplyFunction, IsFunction } from '../types';
import * as remove from './remove';
import * as replace from './replace';
import * as leave from './leave';

export const type = TYPES.patchObject;
export const get: GetFunction = (from, to, path, getDiff) => {
  const data: PatchData = {};
  const fromKeys = new Set(Object.keys(from));
  let isAllReplace = true;
  let isChanged = false;
  for (const key of Object.keys(to)) {
    const diff = getDiff(from[key], to[key], path.concat(key));
    if (fromKeys.has(key)) {
      fromKeys.delete(key);
    }
    if (isAllReplace && !replace.is(diff)) {
      isAllReplace = false;
    }
    if (!leave.is(diff)) {
      isChanged = true;
      data[key] = diff;
    }
  }
  if (isChanged || fromKeys.size) {
    if (isAllReplace) {
      return replace.get(from, to, path, getDiff);
    }
    if (fromKeys.size) {
      fromKeys.forEach((key) => (data[key] = remove.get(from, to, path, getDiff)));
    }
    return {
      [FIELDS.type]: TYPES.patchObject,
      [FIELDS.data]: data,
    };
  }
  return leave.get(from, to, path, getDiff);
};
export const apply: ApplyFunction = (value, diff, path, applyDiff) => {
  const { [FIELDS.data]: data } = diff as PatchObjectDiff;
  const result = { ...value };

  for (const [key, patchDiff] of Object.entries(data)) {
    if (remove.is(patchDiff)) {
      delete result[key];
    } else {
      result[key] = applyDiff(value[key], patchDiff, path.concat(key));
    }
  }
  return result;
};
export const is: IsFunction = (diff) => diff[FIELDS.type] === type;
