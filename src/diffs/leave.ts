import { TYPES, FIELDS } from '../constants';
import { LeaveDiff, GetFunction, ApplyFunction, IsFunction } from '../types';

export const type = TYPES.leave;
const DIFF: LeaveDiff = { [FIELDS.type]: type };
export const get: GetFunction = () => DIFF;
export const apply: ApplyFunction = (value) => value;
export const is: IsFunction = (diff) => diff[FIELDS.type] === type;
