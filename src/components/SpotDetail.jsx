import { useState } from 'react'
import SpotPhoto from './SpotPhoto'
import { typeColor } from '../typeStyles'

import './SpotDetail.css'

// spots.json keys fees in English; unknown keys fall through untranslated rather
// than being dropped, so new tiers still show up.
const FEE_LABELS = {
  adult: '大人',
  child: '子供',
  senior: 'シニア',
  student: '学生',
  parking: '駐車場',
}

function feeLabel(key) {
  return FEE_LABELS[key] ?? key
}

function CloseGlyph() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M4 4l8 8M12 4l-8 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SpotDetail({ spot, onClose }) {
  const [expanded, setExpanded] = useState(false)

  const hasSpecies = spot.fishSpecies.length > 0
  const hasFacilities = spot.facilities.length > 0
  const hasAccess = Boolean(spot.access.station)
  const hasDetails =
    hasSpecies || hasFacilities || hasAccess || Boolean(spot.fee)

  return (
    <aside
      className={`detail${expanded ? ' is-expanded' : ''}`}
      style={{ '--accent': typeColor(spot.type) }}
    >
      <button
        type="button"
        className="detail-grip"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
        aria-label={expanded ? '詳細を閉じる' : '詳細を開く'}
      />

      <div className="detail-hero">
        <div className="detail-heroimg">
          <SpotPhoto spot={spot} />
        </div>

        <div className="detail-headline">
          <p className="detail-type">{spot.type}</p>
          <h2 className="detail-name">{spot.name}</h2>
          <p className="detail-kana">{spot.nameKana}</p>
          <span className="detail-city">{spot.city}</span>
        </div>

        <button
          type="button"
          className="detail-close"
          onClick={onClose}
          aria-label="閉じる"
        >
          <CloseGlyph />
        </button>
      </div>

      <div className="detail-body">
        <p className="detail-desc">{spot.description}</p>

        {hasSpecies && (
          <section className="card">
            <h3>魚種</h3>
            <dl className="detail-pairs">
              {spot.fishSpecies.map((fish) => (
                <div key={fish.name}>
                  <dt>{fish.name}</dt>
                  <dd>{fish.season}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {spot.fee && (
          <section className="card">
            <h3>料金</h3>
            <dl className="detail-pairs">
              {Object.entries(spot.fee).map(([key, value]) => (
                <div key={key}>
                  <dt>{feeLabel(key)}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {hasFacilities && (
          <section className="card">
            <h3>設備</h3>
            <ul className="chips">
              {spot.facilities.map((facility) => (
                <li key={facility}>{facility}</li>
              ))}
            </ul>
          </section>
        )}

        {hasAccess && (
          <section className="card">
            <h3>アクセス</h3>
            <p className="detail-access">
              {spot.access.station}
              {spot.access.walkMinutes !== null &&
                `　徒歩${spot.access.walkMinutes}分`}
            </p>
          </section>
        )}

        {!hasDetails && (
          <div className="detail-todo">
            <p>魚種・料金・設備の情報は準備中です。</p>
          </div>
        )}

        {spot.officialUrl && (
          <a
            className="detail-link"
            href={spot.officialUrl}
            target="_blank"
            rel="noreferrer"
          >
            公式サイトを見る
          </a>
        )}

        <p className="detail-updated">Updated {spot.updatedAt}</p>
      </div>
    </aside>
  )
}

export default SpotDetail
