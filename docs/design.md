# llmon cha Design System

This document defines the local UI rules for **llmon cha**, a browser AI chat extension. It is inspired by Material Design 3 principles, but adapted for this product's own lemon, natural, lightweight brand direction.

## Design Intent

llmon cha should feel calm, fresh, and easy to approach. The interface should support repeated AI conversations without visual pressure. It should feel more like a natural chat companion than a technical control panel.

Core qualities:

- Fresh and lemon-like
- Natural and lightweight
- Warm, low-pressure, and readable
- Clear enough for focused work
- Friendly without becoming decorative or childish

Avoid:

- Heavy cyberpunk or sci-fi AI styling
- Dense enterprise dashboard layouts
- Harsh neon colors
- Overly dark, metallic, or high-contrast futuristic surfaces
- Decorative effects that compete with chat bubbles or the lemon identity

## Material 3 Adaptation

Use Material Design 3 ideas as practical guidance:

- Start from tokens: color, spacing, shape, elevation, and type should be systematic.
- Make components stateful: hover, focus, active, disabled, selected, loading, and error states should be visible.
- Keep hierarchy clear: primary actions, secondary controls, content, and metadata should be visually distinct.
- Prefer soft surfaces and meaningful elevation over heavy borders or shadows.
- Use rounded shapes with restraint. Rounded corners should feel friendly, not bubbly or toy-like.
- Design for accessibility first: readable contrast, keyboard focus, semantic HTML, and predictable interaction.

Do not copy Material components blindly. Adapt them to the llmon cha brand.

## Color System

Primary palette:

- Lemon yellow: primary brand signal and active emphasis.
- Leaf green: success, send, available, and natural accent.
- Warm white: primary background and calm surface base.

Supporting colors:

- Soft warm neutrals for page backgrounds and masks.
- Muted gray-green for secondary text and quiet metadata.
- Gentle red only for destructive actions or clear errors.

Rules:

- Use existing CSS custom properties before adding new values.
- Prefer `--color-*` tokens over hardcoded one-off colors.
- Keep contrast high enough for text, controls, and selected states.
- Dark mode should preserve the lemon and leaf identity, not become cyberpunk.
- Do not introduce unrelated purples, electric blues, neon gradients, metallic grays, or harsh black surfaces.

## Typography

Typography should feel clean and product-focused.

Rules:

- Use the existing font stack and typography scale unless there is a clear product reason.
- Keep chat text highly readable with comfortable line height.
- Labels and compact controls can use smaller, heavier type, but must remain legible.
- Do not use oversized marketing-style headings inside the chat surface.
- Avoid negative letter spacing.

## Spacing and Layout

The layout should feel centered, calm, and scannable.

Rules:

- Keep the main conversation width constrained for comfortable reading.
- Align related elements to the same rail when they belong to the same workflow.
- Use consistent spacing tokens rather than arbitrary pixel values.
- Preserve breathing room around chat bubbles, input controls, and sidebar items.
- Avoid full-width text lines on large screens.
- Keep input controls reachable without crowding the message area.

Responsive expectations:

- Desktop: centered conversation rail, calm side navigation, strong input affordance.
- Tablet: preserve the conversation rail and avoid cramped action rows.
- Mobile: stack controls when needed and keep tap targets usable.

## Shape and Elevation

The product should feel soft and light.

Rules:

- Use existing radius tokens.
- Chat bubbles may be more rounded than utility controls, but should still feel precise.
- Use elevation sparingly for floating input, menus, and overlays.
- Avoid heavy shadows that make the UI feel dense or dramatic.
- Avoid nested card-on-card compositions.

## Components

### Chat Bubbles

Chat bubbles are a core brand element.

Rules:

- Keep assistant and user bubbles visually distinct.
- Preserve readable contrast in both light and dark mode.
- Message actions should stay compact and quiet.
- Avoid putting large decorative assets inside every message.

### Input Box

The input box is a primary product surface.

Rules:

- Keep it visually clear and easy to locate.
- Bottom controls should be compact and aligned.
- The send action should remain visually primary.
- Secondary controls such as model, prompt preset, and thinking mode should feel lightweight.
- When floating over messages, use masks or surfaces so messages do not visually bleed through the input.

### Sidebar

The sidebar should support navigation without feeling heavy.

Rules:

- Product logo and name should feel unified.
- Conversation history should be grouped by time when helpful.
- The collapse/expand button should not jump vertically between states.
- Permanent actions should be easy to find, but avoid crowding the sidebar.

### Menus and Selects

Rules:

- Menus must appear above other surfaces and should not be clipped by the input area.
- Menus may open upward or downward depending on available screen space.
- Menu styling should match the current surface, border, radius, and typography tokens.
- Menu options should remain readable when labels are long.

### Settings

Rules:

- Settings pages should feel like part of the app, not a modal pasted on top.
- Use tabs and grouped fields for clarity.
- Avoid exposing redundant controls when the same setting is available elsewhere.

## Interaction Rules

- Every interactive control should have a visible hover and focus state.
- Keyboard focus must be visible.
- Disabled states should be clear but not invisible.
- Loading states should explain what is happening without adding anxiety.
- Local model latency should show a calm, dynamic waiting state.
- Avoid sudden layout jumps when toggling sidebars, menus, or settings.

## Accessibility

Minimum expectations:

- Use semantic HTML controls whenever possible.
- Maintain readable contrast for text and controls.
- Keep focus states visible.
- Make icon-only buttons accessible with labels or titles.
- Do not rely on color alone to communicate critical state.
- Keep controls usable with keyboard navigation.

## Copy Tone

Copy should be concise, natural, and calm.

Rules:

- Prefer simple action labels.
- Avoid technical jargon unless it is necessary.
- Avoid dramatic AI language.
- System messages should not clutter the conversation; use temporary notices when possible.

## Implementation Rules

- Inspect existing UI structure before changing visuals.
- Reuse existing component patterns where possible.
- Prefer CSS variables and existing tokens.
- Add new tokens only when the value will be reused.
- Do not add a new UI library unless explicitly requested.
- Keep changes scoped to the requested UI behavior.
- Verify visual changes across relevant viewport sizes when practical.
