## Your focus: code review

Review the change for correctness and maintainability:

- Logic errors, unhandled edge cases, wrong error handling, race conditions.
- Data handling in IndexedDB (Dexie): schema or migration changes that could lose or
  corrupt a user's study data.
- The SM-2 spaced repetition behaviour: any change to intervals, ease factor or due
  dates must match the algorithm and keep existing cards' schedules valid.
- React and Zustand state: stale state, missing cleanup, effects that run too often.
- TypeScript: unsafe casts, `any`, types that no longer match runtime values.
- Tests: behaviour changes without tests, tests that do not test what they claim.
- Security: secrets in code, unsafe HTML injection, credentials sent to the browser.
