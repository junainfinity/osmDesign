# Skills Protocol

Skills are reusable design workflows that tell osmDesign how to create a specific kind of artifact. A skill can include a `SKILL.md` manifest, optional seed assets, and optional references that the model should read before writing project files.

## Front Matter

osmDesign reads an optional `od:` block from skill front matter.

```yaml
---
name: web-prototype
description: Create a responsive prototype from a product brief.
od:
  mode: prototype
  preview: html
  defaultFor:
    - prototype
---
```

Supported fields:

- `mode` - `prototype`, `deck`, `template`, `design-system`, `image`, `video`, or `audio`.
- `preview` - currently `html` for files rendered in the preview pane.
- `defaultFor` - project creation tabs where this skill should be the default.
- `platform` - optional hint such as `desktop`, `mobile`, or `web`.
- `scenario` - optional grouping label for search and filtering.

## Skill Folders

```text
skills/
  web-prototype/
    SKILL.md
    assets/
    references/
```

- `SKILL.md` contains the workflow.
- `assets/` contains starter files the agent can copy or inspect.
- `references/` contains checklists, layouts, visual rules, or examples.

## Runtime Behavior

When a project starts, osmDesign combines:

- the base designer prompt,
- the selected design system,
- the selected skill,
- project metadata from the creation panel,
- and any user-provided files.

The model writes project files into the project directory. The preview pane renders the selected HTML entry file.

## Testing

Skill changes should be validated with at least one realistic brief and a preview smoke test. Skills that affect shared deck or media behavior should also run the relevant package tests.
