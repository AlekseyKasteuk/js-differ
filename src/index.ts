enum DIFF_TYPES {
  leave,
  remove,
  replace,
  patch,
}
const TYPE_FIELD = 0;
enum REPLACE_FIELDS {
  value = 1,
}
enum PATCH_FIELDS {
  isArray = 2,
  data = 3,
}
enum PATCH_DATUM_FIELDS {
  key = 0,
  diff = 1,
}

type LeaveDiff = { [TYPE_FIELD]: DIFF_TYPES.leave };
type RemoveDiff = { [TYPE_FIELD]: DIFF_TYPES.remove };
type ReplaceDiff = { [TYPE_FIELD]: DIFF_TYPES.replace; [REPLACE_FIELDS.value]: any };
type PatchDatum = { [PATCH_DATUM_FIELDS.key]: string | number; [PATCH_DATUM_FIELDS.diff]: Diff };
type PatchDiff = { [TYPE_FIELD]: DIFF_TYPES.patch; [PATCH_FIELDS.isArray]: boolean; [PATCH_FIELDS.data]: PatchDatum[] };

type Diff = LeaveDiff | RemoveDiff | ReplaceDiff | PatchDiff;

type CheckFunction = (fromValue: any, toValue: any, path: (string | number)[]) => boolean;

const getType = (diff: Diff): DIFF_TYPES => diff[TYPE_FIELD];

export const isLeaveDiff = (diff: Diff): diff is LeaveDiff => getType(diff) === DIFF_TYPES.leave;
export const isRemoveDiff = (diff: Diff): diff is RemoveDiff => getType(diff) === DIFF_TYPES.remove;
export const isReplaceDiff = (diff: Diff): diff is ReplaceDiff => getType(diff) === DIFF_TYPES.replace;
export const isPatchDiff = (diff: Diff): diff is PatchDiff => getType(diff) === DIFF_TYPES.patch;

export const isEqualDefault: CheckFunction = (fromValue, toValue) => fromValue === toValue;
export const isRemoveDefault: CheckFunction = (_, toValue) => toValue === undefined;
export const isReplaceDefault: CheckFunction = (fromValue, toValue) => {
  const fromType = typeof fromValue;
  const toType = typeof toValue;
  return fromType !== toType || fromType !== 'object' || fromType === null || toType === null;
};

const LEAVE_DIFF = { [TYPE_FIELD]: DIFF_TYPES.leave } as LeaveDiff;
const REMOVE_DIFF = { [TYPE_FIELD]: DIFF_TYPES.remove } as RemoveDiff;
const getReplaceDiff = (value: any): ReplaceDiff => ({
  [TYPE_FIELD]: DIFF_TYPES.replace,
  [REPLACE_FIELDS.value]: value,
});
export const getReplaceValue = (diff: Diff): any => (diff as ReplaceDiff)[REPLACE_FIELDS.value];
const getPatchDatum = (key: string | number, diff: Diff): PatchDatum => ({
  [PATCH_DATUM_FIELDS.key]: key,
  [PATCH_DATUM_FIELDS.diff]: diff,
});
export const getPatchDatumValue = (datum: PatchDatum): { key: string | number; diff: Diff } => ({
  key: datum[PATCH_DATUM_FIELDS.key],
  diff: datum[PATCH_DATUM_FIELDS.diff],
});
const getPatchDiff = (isArray: boolean, data: PatchDatum[]): PatchDiff => ({
  [TYPE_FIELD]: DIFF_TYPES.patch,
  [PATCH_FIELDS.isArray]: isArray,
  [PATCH_FIELDS.data]: data,
});
export const getIsArrayFlag = (diff: Diff): boolean => (diff as PatchDiff)[PATCH_FIELDS.isArray];
export const getPatchData = (diff: Diff): PatchDatum[] => (diff as PatchDiff)[PATCH_FIELDS.data];

type Options = {
  isEqual?: CheckFunction;
  isRemove?: CheckFunction;
  isReplace?: CheckFunction;
};
export function getDiff(
  fromValue: any,
  toValue: any,
  { isEqual = isEqualDefault, isRemove = isRemoveDefault, isReplace = isReplaceDefault }: Options = {},
): Diff {
  const getDiffInner = (fromV: any, toV: any, path: (string | number)[]): Diff => {
    if (!isEqual(fromV, toV, path)) {
      if (isRemove(fromV, toV, path)) {
        return REMOVE_DIFF;
      }
      if (isReplace(fromV, toV, path)) {
        return getReplaceDiff(toV);
      }
      const data: PatchDatum[] = [];
      const fromKeys = new Set(Object.keys(fromV));
      for (const key of Object.keys(toV)) {
        const diff = getDiffInner(fromV[key], toV[key], path.concat(key));
        if (fromKeys.has(key)) {
          fromKeys.delete(key);
        }
        if (diff[TYPE_FIELD] !== DIFF_TYPES.leave) {
          data.push(getPatchDatum(key, diff));
        }
      }
      if (fromKeys.size) {
        fromKeys.forEach((key) => data.push(getPatchDatum(key, REMOVE_DIFF)));
      }
      if (data.length) {
        return getPatchDiff(Array.isArray(toV), data);
      }
    }
    return LEAVE_DIFF;
  };
  return getDiffInner(fromValue, toValue, []);
}

export function applyDiff(value: any, diff: Diff): any {
  const type = getType(diff);
  switch (type) {
    case DIFF_TYPES.leave:
      return value;
    case DIFF_TYPES.remove:
      return undefined;
    case DIFF_TYPES.replace:
      return getReplaceValue(diff);
    case DIFF_TYPES.patch: {
      const isArray = getIsArrayFlag(diff);
      const data = getPatchData(diff);
      const result = isArray ? [...value] : { ...value };
      for (const datum of data) {
        const { key, diff: patchDiff } = getPatchDatumValue(datum);
        if (isRemoveDiff(patchDiff)) {
          if (isArray) {
            result.splice(key, 1);
          } else {
            delete result[key];
          }
        } else {
          result[key] = applyDiff(value[key], patchDiff);
        }
      }
      return result;
    }
  }
}
