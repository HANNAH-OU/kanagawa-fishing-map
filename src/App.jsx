import { useState } from 'react'
import Map from './components/Map'
import SpotDetail from './components/SpotDetail'
import Legend from './components/Legend'
import spots from './data/spots.json'
import './App.css'

function App() {
  const [selectedId, setSelectedId] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const selected = spots.find((spot) => spot.id === selectedId) ?? null

  // Picking a different lamp swaps the card and drops back out of the sheet.
  function selectSpot(id) {
    setSelectedId(id)
    setDetailOpen(false)
  }

  function closeSpot() {
    setSelectedId(null)
    setDetailOpen(false)
  }

  return (
    <div className={`app${detailOpen ? ' has-sheet' : ''}`}>
      <Map
        spots={spots}
        selected={detailOpen ? null : selected}
        selectedId={selectedId}
        onSelect={selectSpot}
        onDeselect={closeSpot}
        onOpenDetail={() => setDetailOpen(true)}
      />

      <div className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 20 20">
              <path
                fill="currentColor"
                d="M3.2 10c2.3-2.9 5-4.2 7.4-4.2 2.5 0 4.5 1.4 5.8 4.2-1.3 2.8-3.3 4.2-5.8 4.2-2.4 0-5.1-1.3-7.4-4.2Z"
              />
              <path fill="currentColor" d="M3.2 10 .2 6.4v7.2z" />
            </svg>
          </span>
          <p className="brand-name">Hannah’s Fishing Map</p>
        </div>

        <div className="topbar-meta">
          <span className="topbar-line" />
          <p>
            {spots.length} <span>Spots</span>
          </p>
        </div>
      </div>

      <header className="hero">
        <p className="hero-eyebrow">A personal fishing guide</p>
        <h1>
          Hannah’s
          <em>Hobby</em>
        </h1>
        <p className="hero-lead">
          海釣り施設・堤防・磯を{spots.length}か所。
          <br />
          潮の色が変わる場所を、地図から探す。
        </p>

        {/* Visual only — no search is wired up yet, so it lets clicks fall
            through to the map rather than offering a dead control. */}
        <span className="btn-outline">Explore Spots</span>
      </header>

      <Legend />

      {/* The compact card is anchored to its lamp inside the map; only the full
          sheet lives out here, and only once 詳細 is pressed. */}
      {selected && detailOpen && (
        <SpotDetail spot={selected} onClose={() => setDetailOpen(false)} />
      )}
    </div>
  )
}

export default App
