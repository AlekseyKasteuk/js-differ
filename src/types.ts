import { FIELDS, TYPES } from './constants';

export type LeaveDiff = { [FIELDS.type]: TYPES.leave };
export type RemoveDiff = { [FIELDS.type]: TYPES.remove };
export type ReplaceDiff = { [FIELDS.type]: TYPES.replace; [FIELDS.value]: any };
export type PatchData = { [key: string]: Diff };
export type PatchObjectDiff = { [FIELDS.type]: TYPES.patchObject; [FIELDS.data]: PatchData };
export type PatchArrayDiff = { [FIELDS.type]: TYPES.patchArray; [FIELDS.length]: number; [FIELDS.data]: PatchData };
export type CustomDiff = { [FIELDS.type]: TYPES.custom; [FIELDS.customParams]: any };

export type Diff = LeaveDiff | RemoveDiff | ReplaceDiff | PatchObjectDiff | PatchArrayDiff | CustomDiff;

export type Path = (string | number)[];

export type CheckFunction = (from: any, to: any, path: Path) => boolean;

export type GetCustomParamsFunction = (from: any, to: any, path: Path, getDiff: PublicGetFunction) => any;
export type GetOptions = {
  isEqual: CheckFunction;
  isRemove: CheckFunction;
  isReplace: CheckFunction;
  isCustom: CheckFunction;
  getCustomParams: GetCustomParamsFunction;
  customDiffPriority: 0 | 1 | 2 | 3 | 4;
};

export type CustomHandlerFunction = (value: any, customParams: any, path: Path, apply: PublicApplyFunction) => any;
export type ApplyOptions = {
  customHandler: CustomHandlerFunction;
};

export type PublicGetFunction = (from: any, to: any, path: Path) => Diff;
export type GetFunction = (from: any, to: any, path: Path, get: PublicGetFunction) => Diff;

export type PublicApplyFunction = (value: any, diff: Diff, path: Path) => any;
export type ApplyFunction = (value: any, diff: Diff, path: Path, apply: PublicApplyFunction) => any;

export type IsFunction = (diff: Diff) => boolean;
