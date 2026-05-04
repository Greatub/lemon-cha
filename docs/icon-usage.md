# llmon cha Icon Usage

This project uses a small, local SVG icon wrapper in `src/components/AppIcon.js`.

The icon style follows the Lucide visual language: clean outline icons, rounded caps and joins, and lightweight strokes. The current project is a vanilla Chrome extension without React or a bundler, so `lucide-react` is not installed or imported directly. This avoids adding a React build chain only for icons.

## Defaults

- Color: `currentColor`
- Size: `20`
- Stroke width: `1.75`
- Fill: `none`
- Stroke linecap: `round`
- Stroke linejoin: `round`

## Usage

Create icons through the shared wrapper:

```js
const icon = window.AppIcon.create("send");
button.append(icon);
```

For buttons, prefer the helper in `popup.js`:

```js
setButtonContent(button, "发送", "send");
```

For static HTML icon slots:

```html
<span class="icon-slot" data-icon="settings" aria-hidden="true"></span>
```

`popup.js` mounts these slots through `mountStaticIcons()`.

## Rules

- Use icons only from `src/components/AppIcon.js`.
- Add new icons only when a real UI need exists.
- Keep icons outline-only and compatible with `currentColor`.
- Do not hardcode icon colors in SVG.
- Keep icon-only buttons accessible with `title` and `aria-label`.
- Prefer text + icon for menu items and important actions.
- Use icon-only controls only for familiar actions such as settings, collapse, theme, edit, delete, copy, and send.

## Current Icon Mapping

- AI assistant: `bot`
- Thinking: `brain`
- New chat: `plus`
- Sidebar collapse / expand: `chevronLeft`, `chevronRight`
- Settings: `settings`
- Theme: `moon`, `sun`
- Export / import: `download`, `upload`
- Markdown export: `fileText`
- Send / stop: `send`, `square`
- Copy: `copy`
- Regenerate: `refreshCw`
- Continue from here: `route`
- Rename: `edit`
- Delete / clear history: `trash`
- Translation workflows: `languages`
- History: `history`

## Adding Icons

When adding a new icon:

1. Add only the needed SVG paths to `APP_ICON_PATHS`.
2. Keep the icon name semantic, not visual.
3. Do not add broad icon packs or unused icons.
4. Verify the icon is readable at 16px, 20px, and 24px.
5. Check both light and dark mode.
