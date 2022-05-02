import { TYPES } from './constants';

export type ObjectKey = string | symbol;

export type ReplaceDiff = [TYPES.replace, unknown];

export type ObjectDiff = Array<[ObjectKey, Diff]>;
export type ObjectPatch = [ObjectKey[], ObjectDiff];
export type PatchObjectDiff = [TYPES.patchObject, ObjectPatch];

export type ArrayDiff = Array<[number, Diff | number]>;
export type ArrayPatch = [number, ArrayDiff];
export type PatchArrayDiff = [TYPES.patchArray, ArrayPatch];

export type Diff = ReplaceDiff | PatchObjectDiff | PatchArrayDiff | null;

export type Path = Array<ObjectKey | number>;

export type GetFunctionGeneric<T> = (source: any, target: any, path: Path) => T;

export type CheckFunction = GetFunctionGeneric<boolean>;

export type GetOptions = { isEqual?: CheckFunction; isReplace?: CheckFunction };

export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[]
  ? ElementType
  : never;
