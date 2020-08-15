import {
  getDiff,
  applyDiff,
  isLeaveDiff,
  isRemoveDiff,
  isReplaceDiff,
  getReplaceValue,
  isPatchDiff,
  getPatchDatumValue,
  getPatchData,
  getIsArrayFlag,
} from './index';

describe('JS Differ', () => {
  it('Replace literals', () => {
    expect(applyDiff(1, getDiff(1, 2))).toEqual(2);
  });
});
