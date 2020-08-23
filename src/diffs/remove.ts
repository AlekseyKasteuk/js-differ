import { TYPES, FIELDS } from '../constants';
import { RemoveDiff, GetFunction, ApplyFunction, IsFunction } from '../types';

export const type = TYPES.remove;
const DIFF: RemoveDiff = { [FIELDS.type]: type };
export const get: GetFunction = () => DIFF;
export const apply: ApplyFunction = () => undefined;
export const is: IsFunction = (diff) => diff[FIELDS.type] === type;
