import { TYPES, FIELDS } from '../constants';
import { ReplaceDiff, GetFunction, ApplyFunction, IsFunction } from '../types';

export const type = TYPES.replace;
export const get: GetFunction = (_, value) => ({ [FIELDS.type]: type, [FIELDS.value]: value });
export const apply: ApplyFunction = (_, diff) => (diff as ReplaceDiff)[FIELDS.value];
export const is: IsFunction = (diff) => diff[FIELDS.type] === type;
