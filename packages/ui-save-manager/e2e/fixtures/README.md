# End-to-end fixtures

Save files used by the scenarios. They are generated, never copied from a real game save: `input/` is not versioned,
so the suite has to run on a machine — and on a CI runner — that has no real save at hand.

`valid-save.json` is the output of `createFakeSaveContent()` called with no override, from
`packages/shared-save-processing/testing/createFakeSaveContent.js` (a wrapper around `createFakeSaveString.js`, the
generator the unit tests already rely on). Regenerate it, or produce another fixture, from the repository root:

```
bun -e "
import {createFakeSaveContent} from './packages/shared-save-processing/testing/createFakeSaveContent.js';
await Bun.write('packages/ui-save-manager/e2e/fixtures/valid-save.json', createFakeSaveContent());
"
```

Pass an override object to `createFakeSaveContent` to build a variant (`{players: []}`, a truncated section, …).
A fixture meant to be valid is checked with `bun validate -- --file=<path>`.
