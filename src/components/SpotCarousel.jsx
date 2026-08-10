import SpotPhoto from './SpotPhoto'
import { typeColor } from '../typeStyles'
import './SpotCarousel.css'

function feeTag(fee) {
  if (!fee) return { text: '料金 準備中', tone: 'muted' }
  if (fee.adult === '無料') return { text: '無料', tone: 'free' }
  return { text: fee.adult, tone: 'paid' }
}

function SpotCarousel({ spots, onSelect }) {
  return (
    <div className="carousel">
      <div className="carousel-track">
        {spots.map((spot) => {
          const fee = feeTag(spot.fee)
          const fish = spot.fishSpecies
            .slice(0, 3)
            .map((entry) => entry.name)
            .join('・')

          return (
            <button
              key={spot.id}
              type="button"
              className="spotcard"
              style={{ '--accent': typeColor(spot.type) }}
              onClick={() => onSelect(spot.id)}
            >
              <div className="spotcard-photo">
                <SpotPhoto spot={spot} />
              </div>

              <div className="spotcard-info">
                <p className="spotcard-type">{spot.type}</p>
                <p className="spotcard-name">{spot.name}</p>
                <p className="spotcard-city">{spot.city}</p>

                <p className="spotcard-fish">{fish || '魚種 準備中'}</p>

                <div className="spotcard-foot">
                  <span className={`spotcard-fee is-${fee.tone}`}>{fee.text}</span>
                  <span className="spotcard-more">詳細</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default SpotCarousel
