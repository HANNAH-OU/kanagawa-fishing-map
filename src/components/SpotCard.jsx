import SpotPhoto from './SpotPhoto'
import { typeColor } from '../typeStyles'
import './SpotCard.css'

function feeTag(fee) {
  if (!fee) return { text: '料金 準備中', tone: 'muted' }
  if (fee.adult === '無料') return { text: '無料', tone: 'free' }
  return { text: fee.adult, tone: 'paid' }
}

// The card that opens over a tapped lamp. It lives inside a Leaflet popup, which
// stops its own clicks from reaching the map, so nothing in here can close it.
function SpotCard({ spot, onOpenDetail }) {
  const fee = feeTag(spot.fee)
  const fish = spot.fishSpecies
    .slice(0, 3)
    .map((entry) => entry.name)
    .join('・')

  return (
    <div className="spotcard" style={{ '--accent': typeColor(spot.type) }}>
      <div className="spotcard-photo">
        <SpotPhoto spot={spot} />
      </div>

      <div className="spotcard-info">
        <p className="spotcard-type">{spot.type}</p>
        <p className="spotcard-name">{spot.name}</p>
        <p className="spotcard-city">{spot.city}</p>

        <p className="spotcard-fish">{fish || '魚種 準備中'}</p>
        {spot.hours && <p className="spotcard-hours">{spot.hours}</p>}

        <div className="spotcard-foot">
          <span className={`spotcard-fee is-${fee.tone}`}>{fee.text}</span>
          <button type="button" className="spotcard-more" onClick={onOpenDetail}>
            詳細
          </button>
        </div>

        {spot.officialUrl && (
          <a
            className="spotcard-site"
            href={spot.officialUrl}
            target="_blank"
            rel="noreferrer"
          >
            公式サイト
            <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </div>
  )
}

export default SpotCard
