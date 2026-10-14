# BADA_WEB Repository Instructions

## Scope

- These instructions apply only to the BADA web repository.
- Before changing TypeScript, React, styles, API code, tests, or project structure, read `docs/CODE_CONVENTIONS.md` and apply the relevant sections.
- Do not apply rules from the BADA app repository to this repository.
- BADA app and web share product design values. Treat `src/shared/design-system` as the web source of truth for those shared values without applying the app repository's workflow or architecture rules.
- Preserve user changes already present in the working tree. Do not overwrite or revert unrelated work.

## Development workflow

- For a requested implementation using the standard development flow, proceed in this order when repository state and GitHub authentication allow it: inspect the repository, propose the issue, obtain approval, create the issue, propose the branch, obtain approval, create the branch, implement, verify, review the diff, and commit.
- Before creating each GitHub issue, show the proposed issue type, title, and summary, then ask the user for explicit confirmation. Do not create the issue until the user confirms.
- After an issue number is available, show the exact base branch and proposed branch name, then ask the user for explicit confirmation. Do not create or switch to the new branch until the user confirms.
- Treat issue creation and branch creation as separate approval points. A request to implement work or use the standard flow is not approval to create either one.
- Do not create an issue or branch for investigation-only work or a small documentation-only change unless the user requests it.
- Derive issue titles, branch names, and commit messages from the types and formats in `docs/CODE_CONVENTIONS.md`.
- Before committing, run `npm run lint` and `npm run build` unless the task does not affect executable code or a check cannot run. Report any skipped or failing check.
- Do not push, open a pull request, merge, or deploy unless the user explicitly requests that action.

## Architecture guardrails

- Follow the FSD dependency direction and Public API rules in `docs/CODE_CONVENTIONS.md`.
- Treat the same-layer import prohibition as a prohibition on imports between different slices. Relative imports inside one slice are allowed.
- Use layer aliases for cross-layer imports and expose slices through `index.ts`.
- Keep UI rendering in `ui`, behavior and state in `model`, and HTTP request functions in `api`.

## Design system

- Use the color, typography, radius, and effect tokens exposed by `src/shared/design-system` when implementing or updating UI.
- Prefer semantic Tailwind utilities such as `text-label-normal`, `bg-primary-normal`, `border-line-normal`, and `bg-fill-field` over primitive palette utilities or arbitrary values.
- Use primitive palette tokens only when the design explicitly requires a primitive color and no semantic role represents it.
- Use the typography utilities `text-display1`, `text-display2`, `text-title1`, `text-title2`, `text-headline1`, `text-headline2`, `text-body`, `text-label`, and `text-caption` for the corresponding hierarchy.
- Use `rounded-control`, `rounded-component`, `rounded-card`, `rounded-dialog`, and `rounded-pill` for standard radii.
- Use `shadow-elevated-card`, `shadow-surface-card`, and `shadow-subtle-card` for the documented card elevations.
- Do not introduce a hardcoded color, font size, radius, or shadow when an equivalent design-system token exists.
- Keep the exported TypeScript values and `theme.css` Tailwind values synchronized when the shared design system changes.
