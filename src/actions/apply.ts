import { FIELDS, TYPES } from '../constants';
import { Diff, Path, ApplyOptions, PublicApplyFunction, CustomDiff } from '../types';
import * as diffs from '../diffs';

export const applyDiff = (
  value: any,
  diff: Diff,
  { customHandler }: Partial<ApplyOptions> = {}
): any => {
  const applyDiffInner: PublicApplyFunction = (v, d, path) => {
    const type = d[FIELDS.type]
    if (type === TYPES.custom) {
      if (customHandler) {
        const customParams = (d as CustomDiff)[FIELDS.customParams]
        return customHandler(v, customParams, path, applyDiffInner)
      }
      throw new Error('Custom handler not specified')
    }
    const handler = Object.values(diffs).find((module) => module.type === d[FIELDS.type])?.apply;
    if (!handler) {
      throw new Error('Invalid diff object');
    }
    return handler(v, d, path, applyDiffInner);
  }
  return applyDiffInner(value, diff, [])
};

export default applyDiff;
