import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Icon.Default resolves icon URLs by prepending a path it sniffs out of
// leaflet.css, so it would concatenate that onto the asset URLs below instead of
// using them. Override it to return the configured URL verbatim, then point the
// options at the images Vite processed.
L.Icon.Default.prototype._getIconUrl = function (name) {
  return this.options[name + 'Url']
}

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

const CENTER = [35.35, 139.45]
const ZOOM = 10

// Plain object rather than a Map instance — `Map` is this module's component.
const iconCache = {}

// One lamp per spot: every marker is the same amber, so the only thing the eye
// picks out of the dark chart is where you can fish.
function lampIcon(spot, isSelected) {
  const key = `${spot.id}:${isSelected}`

  if (!iconCache[key]) {
    iconCache[key] = L.divIcon({
      className: `spot-mark${isSelected ? ' is-selected' : ''}`,
      html: `<span class="mark-glow"></span>
        <span class="mark-pulse"></span>
        <span class="mark-dot"></span>
        <span class="mark-label">${spot.name}</span>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    })
  }

  return iconCache[key]
}

// Tapping bare map closes the detail sheet and brings the carousel back.
function DeselectOnMapClick({ onDeselect }) {
  useMapEvents({ click: onDeselect })
  return null
}

function Map({ spots, selectedId, onSelect, onDeselect }) {
  return (
    <MapContainer
      center={CENTER}
      zoom={ZOOM}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      {/* GSI's pale sheet, inverted to a night chart in CSS: greys out the park
          greens, sinks land to navy-black and leaves roads as faint lines. */}
      <TileLayer
        url="https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png"
        attribution='出典：<a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>'
        maxZoom={18}
        className="basemap-night"
      />

      <DeselectOnMapClick onDeselect={onDeselect} />

      {spots.map((spot) => {
        const isSelected = spot.id === selectedId

        return (
          <Marker
            key={spot.id}
            position={[spot.lat, spot.lng]}
            icon={lampIcon(spot, isSelected)}
            zIndexOffset={isSelected ? 1000 : 0}
            eventHandlers={{ click: () => onSelect(spot.id) }}
          />
        )
      })}
    </MapContainer>
  )
}

export default Map
