# js-differ
A JavaScript library for get and apply diffs for JSON data values.
## Installation
    npm install js-differ
## API
### Types
```typescript
type Path = (string | number)[]

type CheckFunction = (from: any, to: any, path: Path) => boolean;

type GetCustomParamsFunction = (from: any, to: any, path: Path, getDiff: (from: any, to: any, path: Path) => Diff) => any;

type CustomHandlerFunction = (value: any, customParams: any, path: Path, apply: (value: any, diff: Diff, path: Path) => any) => any;
```
### Methods
#### getDiff(from, to, options)
Returns structure of diff to pass in [applyDiff](#applyDiffvalue-diff-options) functon.
| Param | Type | Required | Description |
| :- | :- | :-: | :- |
| from | any | + | Initial value. |
| to | any | + | Result value. |
| options | object | - | More info [here](#get-diff-options). |
#### applyDiff(value, diff, options)
Returns new value by applying diff to initial value.
| Param | Type | Required | Description |
| :- | :- | :-: | :- |
| value | any | + | Initial value. |
| diff | object | + | Result of [getDiff](#getdifffrom-to-options) function. |
| options | object | - | More info [here](#apply-diff-options). |
#### isEqualDefault(from, to, path)
#### isRemoveDefault(from, to, path)
#### isReplaceDefault(from, to, path)
## Options
### Get Diff Options
| Option | Type | Default Value | Description |
| :- | :- | :- | :- |
| isEqual | [CheckFunction](#types) | [isEqualDefault](#isequaldefaultfrom-to-path) | You can customize `isEqual` function. Priority `0`. |
| isRemove | [CheckFunction](#types) | [isRemoveDefault](#isRemoveDefaultfrom-to-path) | You can customize `isRemove` function. Priority `1`. |
| isReplace | [CheckFunction](#types) | [isReplaceDefault](#isReplaceDefaultfrom-to-path) | You can customize `isReplace` function. Priority `2`. |
| isCustom | [CheckFunction](#types) | - | You can specify your custom behaviour of diff. If you implement this function you must implement `getCustomParams` too. Also implement `customHandler` function of [Apply Diff Options](#Apply-Diff-Options) |
| getCustomParams | [GetCustomParamsFunction](#types) | - | Custom params getter. |
| customDiffPriority | number | 3 | Priority of `isCustom` check (by default is after repalce). Available values are `0, 1, 2, 3, 4` |
### Apply Diff Options
| Option | Type | Required | Description |
| :- | :- | :-: | :- |
| customHandler | [CustomHandlerFunction](#types) | - | If `isCustom` was implemented in [Get Diff Options](#Get-Diff-Options) you should implement this funciton. `customParams` is a result of `getCustomParams` |