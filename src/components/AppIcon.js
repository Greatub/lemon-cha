const APP_ICON_DEFAULTS = {
  size: 20,
  strokeWidth: 1.75
};

const APP_ICON_PATHS = {
  alertTriangle: [
    '<path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z" />',
    '<path d="M12 9v4" />',
    '<path d="M12 17h.01" />'
  ],
  bot: [
    '<path d="M12 8V4H8" />',
    '<rect width="16" height="12" x="4" y="8" rx="2" />',
    '<path d="M2 14h2" />',
    '<path d="M20 14h2" />',
    '<path d="M15 13v2" />',
    '<path d="M9 13v2" />'
  ],
  brain: [
    '<path d="M12 5a3 3 0 0 0-5.6-1.5A3 3 0 0 0 4 8a3 3 0 0 0 0 6 3 3 0 0 0 2.4 4.5A3 3 0 0 0 12 17" />',
    '<path d="M12 5a3 3 0 0 1 5.6-1.5A3 3 0 0 1 20 8a3 3 0 0 1 0 6 3 3 0 0 1-2.4 4.5A3 3 0 0 1 12 17" />',
    '<path d="M12 5v12" />',
    '<path d="M8 12h8" />'
  ],
  chevronLeft: ['<path d="m15 18-6-6 6-6" />'],
  chevronRight: ['<path d="m9 18 6-6-6-6" />'],
  copy: [
    '<rect width="14" height="14" x="8" y="8" rx="2" />',
    '<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />'
  ],
  copyPlus: [
    '<rect width="14" height="14" x="8" y="8" rx="2" />',
    '<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />',
    '<path d="M15 12v6" />',
    '<path d="M12 15h6" />'
  ],
  download: [
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />',
    '<path d="M7 10l5 5 5-5" />',
    '<path d="M12 15V3" />'
  ],
  edit: [
    '<path d="M12 20h9" />',
    '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />'
  ],
  fileText: [
    '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />',
    '<path d="M14 2v4a2 2 0 0 0 2 2h4" />',
    '<path d="M10 9H8" />',
    '<path d="M16 13H8" />',
    '<path d="M16 17H8" />'
  ],
  folder: [
    '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.2a2 2 0 0 1-1.4-.6L9.6 3.6A2 2 0 0 0 8.2 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />'
  ],
  folderPlus: [
    '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.2a2 2 0 0 1-1.4-.6L9.6 3.6A2 2 0 0 0 8.2 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />',
    '<path d="M12 10v6" />',
    '<path d="M9 13h6" />'
  ],
  history: [
    '<path d="M3 12a9 9 0 1 0 9-9 9.8 9.8 0 0 0-6.4 2.4L3 8" />',
    '<path d="M3 3v5h5" />',
    '<path d="M12 7v5l4 2" />'
  ],
  languages: [
    '<path d="m5 8 6 6" />',
    '<path d="m4 14 6-6 2-3" />',
    '<path d="M2 5h12" />',
    '<path d="M7 2h1" />',
    '<path d="m22 22-5-10-5 10" />',
    '<path d="M14 18h6" />'
  ],
  menu: [
    '<path d="M4 12h16" />',
    '<path d="M4 6h16" />',
    '<path d="M4 18h16" />'
  ],
  moreHorizontal: [
    '<circle cx="12" cy="12" r="1" />',
    '<circle cx="19" cy="12" r="1" />',
    '<circle cx="5" cy="12" r="1" />'
  ],
  panelLeft: [
    '<rect width="18" height="18" x="3" y="3" rx="2" />',
    '<path d="M9 3v18" />'
  ],
  messageCircle: [
    '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />'
  ],
  monitor: [
    '<rect width="20" height="14" x="2" y="3" rx="2" />',
    '<path d="M8 21h8" />',
    '<path d="M12 17v4" />'
  ],
  moon: ['<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />'],
  plus: [
    '<path d="M5 12h14" />',
    '<path d="M12 5v14" />'
  ],
  refreshCw: [
    '<path d="M3 12a9 9 0 0 1 15.1-6.6L21 8" />',
    '<path d="M21 3v5h-5" />',
    '<path d="M21 12a9 9 0 0 1-15.1 6.6L3 16" />',
    '<path d="M3 21v-5h5" />'
  ],
  route: [
    '<circle cx="6" cy="19" r="3" />',
    '<path d="M9 19h8.5a3.5 3.5 0 0 0 0-7H6.5a3.5 3.5 0 0 1 0-7H15" />',
    '<circle cx="18" cy="5" r="3" />'
  ],
  send: [
    '<path d="m22 2-7 20-4-9-9-4Z" />',
    '<path d="M22 2 11 13" />'
  ],
  settings: [
    '<path d="M12.2 2h-.4a2 2 0 0 0-2 1.8l-.1 1a2 2 0 0 1-1.1 1.5l-.9.5a2 2 0 0 1-1.8.1l-.9-.4a2 2 0 0 0-2.5.9l-.2.3a2 2 0 0 0 .5 2.6l.8.6a2 2 0 0 1 .7 1.7v1a2 2 0 0 1-.7 1.7l-.8.6a2 2 0 0 0-.5 2.6l.2.3a2 2 0 0 0 2.5.9l.9-.4a2 2 0 0 1 1.8.1l.9.5a2 2 0 0 1 1.1 1.5l.1 1a2 2 0 0 0 2 1.8h.4a2 2 0 0 0 2-1.8l.1-1a2 2 0 0 1 1.1-1.5l.9-.5a2 2 0 0 1 1.8-.1l.9.4a2 2 0 0 0 2.5-.9l.2-.3a2 2 0 0 0-.5-2.6l-.8-.6a2 2 0 0 1-.7-1.7v-1a2 2 0 0 1 .7-1.7l.8-.6a2 2 0 0 0 .5-2.6l-.2-.3a2 2 0 0 0-2.5-.9l-.9.4a2 2 0 0 1-1.8-.1l-.9-.5a2 2 0 0 1-1.1-1.5l-.1-1a2 2 0 0 0-2-1.8Z" />',
    '<circle cx="12" cy="12" r="3" />'
  ],
  square: ['<rect width="14" height="14" x="5" y="5" rx="2" />'],
  sun: [
    '<circle cx="12" cy="12" r="4" />',
    '<path d="M12 2v2" />',
    '<path d="M12 20v2" />',
    '<path d="m4.9 4.9 1.4 1.4" />',
    '<path d="m17.7 17.7 1.4 1.4" />',
    '<path d="M2 12h2" />',
    '<path d="M20 12h2" />',
    '<path d="m6.3 17.7-1.4 1.4" />',
    '<path d="m19.1 4.9-1.4 1.4" />'
  ],
  text: [
    '<path d="M4 7V4h16v3" />',
    '<path d="M9 20h6" />',
    '<path d="M12 4v16" />'
  ],
  trash: [
    '<path d="M3 6h18" />',
    '<path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />',
    '<path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />',
    '<path d="M10 11v6" />',
    '<path d="M14 11v6" />'
  ],
  upload: [
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />',
    '<path d="M17 8l-5-5-5 5" />',
    '<path d="M12 3v12" />'
  ],
  x: [
    '<path d="M18 6 6 18" />',
    '<path d="m6 6 12 12" />'
  ]
};

function createAppIcon(name, options = {}) {
  const size = options.size || APP_ICON_DEFAULTS.size;
  const strokeWidth = options.strokeWidth || APP_ICON_DEFAULTS.strokeWidth;
  const paths = APP_ICON_PATHS[name] || APP_ICON_PATHS.messageCircle;
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.classList.add("app-icon");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("width", String(size));
  icon.setAttribute("height", String(size));
  icon.setAttribute("fill", "none");
  icon.setAttribute("stroke", "currentColor");
  icon.setAttribute("stroke-width", String(strokeWidth));
  icon.setAttribute("stroke-linecap", "round");
  icon.setAttribute("stroke-linejoin", "round");

  if (options.title) {
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = options.title;
    icon.append(title);
  } else {
    icon.setAttribute("aria-hidden", "true");
  }

  for (const path of paths) {
    const template = document.createElementNS("http://www.w3.org/2000/svg", "g");
    template.innerHTML = path;
    icon.append(...template.childNodes);
  }

  return icon;
}

window.AppIcon = {
  create: createAppIcon,
  defaults: APP_ICON_DEFAULTS,
  names: Object.freeze(Object.keys(APP_ICON_PATHS))
};
