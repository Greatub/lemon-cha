# Project Rules

## Product Direction

This project is **llmon cha**, a browser AI chat extension.

The product should feel fresh, natural, lightweight, lemon-like, low-pressure, and approachable. It should not feel like an oppressive or overly technical AI tool.

## UI Rules

- Use a palette centered around lemon yellow, leaf green, and warm white.
- Keep boundaries clear and maintain enough contrast for readability.
- Treat chat bubbles and lemon visual elements as core brand signals.
- Avoid heavy cyberpunk styling, harsh neon, or dark sci-fi AI aesthetics.
- Prefer calm, soft, natural interactions over dense enterprise or futuristic dashboard patterns.
- UI controls should feel light and precise, with enough spacing to avoid visual pressure.

## Implementation Notes

- Preserve the existing brand direction unless the user explicitly asks for a redesign.
- When adding new UI, match the current llmon cha visual language before introducing new patterns.
- Do not add decorative elements that compete with the lemon/chat identity.

## UI Design Rules

Before modifying any UI, layout, component, CSS, Tailwind class, or visual copy, you must read:

- `docs/design.md`

You must follow the visual system, spacing, colors, typography, interaction style, and component rules defined there.

## Frontend Workflow

When asked to build or modify UI:

1. First inspect the existing UI structure and component library.
2. Read `docs/design.md`.
3. Reuse existing components when possible.
4. Do not introduce a new UI library unless explicitly asked.
5. Keep changes consistent with the current tech stack.
6. After changes, run lint/typecheck/build if available.

## Design Implementation Expectations

- Prefer reusable components over one-off styles.
- Use design tokens instead of hardcoded random values.
- Maintain accessibility: readable contrast, semantic HTML, keyboard focus states.
- Keep responsive behavior for mobile, tablet, and desktop.
- Do not create visually inconsistent colors, shadows, border radii, or typography.
