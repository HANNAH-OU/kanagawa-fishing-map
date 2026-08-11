import { useEffect, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Pane,
  Polygon,
  Popup,
  SVGOverlay,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

import SpotCard from './SpotCard'
import { markerColor } from '../typeStyles'

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

// Plain object rather than a Map instance — `Map` is this module's component.
const iconCache = {}

// One lamp per spot. --lamp carries the colour to every lit part, so the amber
// sea markers keep exactly the values they had.
function lampIcon(spot, isSelected) {
  const key = `${spot.id}:${isSelected}`

  if (!iconCache[key]) {
    iconCache[key] = L.divIcon({
      className: `spot-mark${isSelected ? ' is-selected' : ''}`,
      html: `<span class="lamp" style="--lamp:${markerColor(spot.type)}">
          <span class="mark-glow"></span>
          <span class="mark-pulse"></span>
          <span class="mark-dot"></span>
          <span class="mark-label">${spot.name}</span>
        </span>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    })
  }

  return iconCache[key]
}

// Outlines traced to each region's real extent — the Doshi river corridor along
// the Yamanashi border, the Shonan coastal strip, the Miura peninsula — rather
// than circles dropped on the map. The label sits inside, clear of the lamps.
const AREAS = [
  {
    id: 'doshi',
    en: 'Doshi',
    ja: '道志',
    label: [35.556, 139.055],
    shape: [
      [35.585, 138.955],
      [35.59, 139.06],
      [35.575, 139.15],
      [35.53, 139.185],
      [35.48, 139.14],
      [35.47, 139.04],
      [35.505, 138.945],
    ],
  },
  {
    id: 'shonan',
    en: 'Shonan',
    ja: '湘南',
    label: [35.325, 139.44],
    shape: [
      [35.36, 139.31],
      [35.368, 139.4],
      [35.36, 139.49],
      [35.352, 139.57],
      [35.288, 139.575],
      [35.278, 139.49],
      [35.282, 139.4],
      [35.292, 139.31],
    ],
  },
  {
    id: 'miura',
    en: 'Miura',
    ja: '三浦',
    label: [35.23, 139.66],
    shape: [
      [35.318, 139.605],
      [35.32, 139.7],
      [35.28, 139.75],
      [35.205, 139.73],
      [35.15, 139.7],
      [35.12, 139.64],
      [35.128, 139.595],
      [35.215, 139.585],
    ],
  },
].map((area) => ({ ...area, glow: glowBounds(area.shape) }))

// Water names stay plain type: they name a sea, they do not enclose a place.
const SEAS = [
  { id: 'sagami', ja: '相模湾', lat: 35.185, lng: 139.29 },
  { id: 'tokyo', ja: '東京湾', lat: 35.4, lng: 139.722 },
]

// A box far larger than anything the app frames, filled flat. Uniform darkness
// has no shape and therefore no edge — nothing here traces a region. It has to
// be a map layer rather than a CSS overlay: .leaflet-map-pane carries a
// transform, so a container-level overlay would stack above the lamps too.
const VEIL_RING = [
  [20, 120],
  [20, 160],
  [50, 160],
  [50, 120],
]

const VEIL_STYLE = {
  className: 'map-veil',
  stroke: false,
  fillColor: '#061523',
  fillOpacity: 0.78,
}

// The light ramp, unchanged in shape: peak at the centre, zero before the box
// edge. Only its level is dialled per region.
const GLOW_STOPS = ['0%', '30%', '58%', '80%', '100%']
const GLOW_COLORS = ['#bcdcf5', '#a6cdec', '#8fbde0', '#7fb1d6', '#7fb1d6']
// Halved: a wash that lifts the ground a little, not a lit patch. The curve is
// unchanged so the falloff still reaches zero well before the box edge.
const GLOW_RAMP = [0.15, 0.095, 0.045, 0.013, 0]

// Doshi is the reference. Shonan and Miura lie over paler, busier coastal ground
// where the same value reads brighter, so they are trimmed again until all three
// land at the same apparent softness.
const GLOW_LEVEL = { doshi: 0.85, shonan: 0.69, miura: 0.69 }
const GLOW_CORE = { doshi: 1, shonan: 0.9, miura: 0.9 }

function glowStops(id) {
  const level = GLOW_LEVEL[id] ?? 0.85
  const core = GLOW_CORE[id] ?? 1

  return GLOW_RAMP.map((value, index) => ({
    offset: GLOW_STOPS[index],
    color: GLOW_COLORS[index],
    opacity: value * level * (index === 0 ? core : 1),
  }))
}

// The regions are lit, not drawn. Each shape only yields a box; the light itself
// is a radial gradient that peaks at the centre and reaches zero before the box
// edge, so there is no boundary anywhere to see.
function glowBounds(shape, spread = 1.75) {
  const lats = shape.map((point) => point[0])
  const lngs = shape.map((point) => point[1])
  const midLat = (Math.min(...lats) + Math.max(...lats)) / 2
  const midLng = (Math.min(...lngs) + Math.max(...lngs)) / 2
  const reachLat = ((Math.max(...lats) - Math.min(...lats)) / 2) * spread
  const reachLng = ((Math.max(...lngs) - Math.min(...lngs)) / 2) * spread

  return [
    [midLat - reachLat, midLng - reachLng],
    [midLat + reachLat, midLng + reachLng],
  ]
}

const regionCache = {}

function areaIcon(area) {
  if (!regionCache[area.id]) {
    regionCache[area.id] = L.divIcon({
      className: 'region is-area',
      html: `<span class="region-inner">
          <span class="region-en">${area.en}</span>
          <span class="region-ja">${area.ja}</span>
        </span>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    })
  }

  return regionCache[area.id]
}

function seaIcon(sea) {
  if (!regionCache[sea.id]) {
    regionCache[sea.id] = L.divIcon({
      className: 'region is-sea',
      html: `<span class="region-inner">
          <span class="region-ja">${sea.ja}</span>
        </span>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    })
  }

  return regionCache[sea.id]
}

// veil 320 → region wash 340 → outline 430 → labels 450, all between the basemap
// at 200 and the lamps at 600. The veil and the regions ride with the map, so
// the light patches stay over the right ground as you pan.
function RegionLayer() {
  const map = useMap()
  const [zoom, setZoom] = useState(() => map.getZoom())

  useMapEvents({ zoomend: () => setZoom(map.getZoom()) })

  // Names stop meaning anything zoomed into one shoreline; the veil stays, or the
  // background would snap back to full brightness.
  const showLabels = zoom >= 8 && zoom <= 12

  return (
    <>
      <Pane name="regionVeil" style={{ zIndex: 320 }}>
        <Polygon
          positions={VEIL_RING}
          pathOptions={VEIL_STYLE}
          interactive={false}
          pane="regionVeil"
        />
      </Pane>

      {/* Screen blending puts light back rather than painting a translucent
          colour over the chart, so roads and names inside a region stay legible
          instead of being washed out. */}
      <Pane name="regionGlow" style={{ zIndex: 340 }}>
        {AREAS.map((area) => (
          <SVGOverlay
            key={area.id}
            bounds={area.glow}
            attributes={{ class: 'region-glow' }}
            interactive={false}
            pane="regionGlow"
          >
            <defs>
              <radialGradient id={`glow-${area.id}`}>
                {glowStops(area.id).map((stop) => (
                  <stop
                    key={stop.offset}
                    offset={stop.offset}
                    stopColor={stop.color}
                    stopOpacity={stop.opacity}
                  />
                ))}
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill={`url(#glow-${area.id})`} />
          </SVGOverlay>
        ))}
      </Pane>

      <Pane name="regions" style={{ zIndex: 450 }}>
        {showLabels &&
          AREAS.map((area) => (
            <Marker
              key={area.id}
              position={area.label}
              icon={areaIcon(area)}
              interactive={false}
              pane="regions"
            />
          ))}
        {showLabels &&
          SEAS.map((sea) => (
            <Marker
              key={sea.id}
              position={[sea.lat, sea.lng]}
              icon={seaIcon(sea)}
              interactive={false}
              pane="regions"
            />
          ))}
      </Pane>
    </>
  )
}

// Leaflet measures its container once, at construction. With the height coming
// down a 100% chain and 100dvh, that measurement can land before layout settles,
// and the map then paints short of the real width — leaving a strip of bare
// container colour down the right edge. Re-measuring after the first frame fixes
// it; Leaflet handles later window resizes itself.
function FitToContainer() {
  const map = useMap()

  useEffect(() => {
    const frame = requestAnimationFrame(() => map.invalidateSize({ animate: false }))

    const observer = new ResizeObserver(() =>
      map.invalidateSize({ animate: false }),
    )
    observer.observe(map.getContainer())

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [map])

  return null
}

// Keeps an opened card clear of the chrome. The desktop values reserve the whole
// hero column, which on a 375px screen would exceed the viewport and make
// Leaflet's auto-pan arithmetic meaningless — a phone only reserves the top bar,
// and the hero steps aside in CSS instead.
function panPadding() {
  const narrow = typeof window !== 'undefined' && window.innerWidth < 768

  return narrow
    ? { topLeft: [16, 84], bottomRight: [16, 28] }
    : { topLeft: [352, 92], bottomRight: [28, 28] }
}

// Tapping bare map closes the detail sheet and brings the carousel back.
function DeselectOnMapClick({ onDeselect }) {
  useMapEvents({ click: onDeselect })
  return null
}

function Map({ spots, selected, selectedId, onSelect, onDeselect, onOpenDetail }) {
  const pad = panPadding()

  return (
    <MapContainer
      /* Framed to every spot rather than a fixed centre, so the Doshi-michi
         waters inland and the Kanagawa coast are both in view on load. */
      bounds={spots.map((spot) => [spot.lat, spot.lng])}
      boundsOptions={{ padding: [52, 52] }}
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

      <FitToContainer />

      <RegionLayer />

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

      {/* Anchored to the lamp and carried by the map. Rendering is driven purely
          by React state, so picking another lamp swaps the card rather than
          opening a second one. autoPan keeps it clear of the hero panel and the
          top bar when the lamp sits near an edge. */}
      {selected && (
        <Popup
          key={selected.id}
          position={[selected.lat, selected.lng]}
          className="spot-popup"
          closeButton={false}
          closeOnClick={false}
          autoClose={false}
          offset={[0, -10]}
          autoPanPaddingTopLeft={pad.topLeft}
          autoPanPaddingBottomRight={pad.bottomRight}
        >
          <SpotCard spot={selected} onOpenDetail={onOpenDetail} />
        </Popup>
      )}
    </MapContainer>
  )
}

export default Map
