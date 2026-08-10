import { useState } from 'react'
import Map from './components/Map'
import SpotDetail from './components/SpotDetail'
import SpotCarousel from './components/SpotCarousel'
import spots from './data/spots.json'
import './App.css'

function App() {
  const [selectedId, setSelectedId] = useState(null)
  const selected = spots.find((spot) => spot.id === selectedId) ?? null

  return (
    <div className="app">
      <Map
        spots={spots}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onDeselect={() => setSelectedId(null)}
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
          <p className="brand-name">Kanagawa Fishing</p>
        </div>

        <div className="topbar-meta">
          <span className="topbar-line" />
          <p>
            {spots.length} <span>Spots</span>
          </p>
        </div>
      </div>

      <header className="hero">
        <p className="hero-eyebrow">Kanagawa Prefecture</p>
        <h1>
          Fishing for
          <em>Kanagawa</em>
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

      {/* The bottom belongs to one of the two: browse the carousel, or read the
          spot you just tapped. */}
      {selected ? (
        <SpotDetail spot={selected} onClose={() => setSelectedId(null)} />
      ) : (
        <SpotCarousel spots={spots} onSelect={setSelectedId} />
      )}
    </div>
  )
}

export default App
