// Marker discs, the key, cards and the detail sheet all read type colour and
// glyph from here, so they never drift apart.

export const AMBER = '#f5b731'
export const LIME = '#7ede4f'
export const SEA = '#1d5b6b'

// Bright enough to read as lit points on the midnight basemap; amber leads,
// since it is the road and marker colour of the map reference.
export const TYPE_COLORS = {
  海釣り施設: '#f5b731',
  堤防: '#5bc8a5',
  磯: '#ef8354',
  河口: '#6ba8d6',
  管理釣り場: '#3fd39b',
}

// Lamp colour on the map. Everything on salt water keeps the amber it already
// has; only the inland managed waters get their own colour.
export const MARKER_SEA = '#f5b942'

export function markerColor(type) {
  return type === '管理釣り場' ? TYPE_COLORS[type] : MARKER_SEA
}

export const DEFAULT_TYPE_COLOR = '#9fb0bd'

// Inner SVG markup drawn inside a 20x20 box. Dark ink on the bright disc, so it
// stays legible now that the discs are lit rather than dark. Kept as strings
// because Leaflet's divIcon takes HTML, not React nodes; the React side injects
// the same strings so both stay identical.
export const TYPE_ICONS = {
  海釣り施設:
    '<path fill="#0d1b26" d="M3.2 10c2.3-2.9 5-4.2 7.4-4.2 2.5 0 4.5 1.4 5.8 4.2-1.3 2.8-3.3 4.2-5.8 4.2-2.4 0-5.1-1.3-7.4-4.2Z"/><path fill="#0d1b26" d="M3.2 10 .2 6.4v7.2z"/>',
  堤防: '<path fill="#0d1b26" d="M1.5 12.6h17v4.4h-17z"/><path fill="#0d1b26" d="M4.6 7h4.2v4.4H4.6zM11.2 7h4.2v4.4h-4.2z"/>',
  磯: '<path fill="#0d1b26" d="M.8 16.4 6.4 7.4l3.4 5.2 3.8-6.4 5.6 10.2z"/>',
  河口:
    '<path fill="none" stroke="#0d1b26" stroke-width="1.9" stroke-linecap="round" d="M1.6 7.4c2.6-2 4.7-2 7.2 0s4.7 2 7.2 0M1.6 12.6c2.6-2 4.7-2 7.2 0s4.7 2 7.2 0"/>',
  管理釣り場:
    '<path fill="none" stroke="#0d1b26" stroke-width="2" stroke-linecap="round" d="M12.4 4.2v7.6a3.6 3.6 0 1 1-7.2 0"/>',
}

const DEFAULT_ICON = '<circle cx="10" cy="10" r="4.6" fill="#0d1b26"/>'

export function typeColor(type) {
  return TYPE_COLORS[type] ?? DEFAULT_TYPE_COLOR
}

export function typeIcon(type) {
  return TYPE_ICONS[type] ?? DEFAULT_ICON
}
