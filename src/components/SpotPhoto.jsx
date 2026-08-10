import { typeColor, typeIcon } from '../typeStyles'

// Real photo when spots.json has one; otherwise a washed placeholder in the
// spot's type tint, closer to a watercolour swatch than a UI gradient.
function SpotPhoto({ spot }) {
  if (spot.photos.length > 0) {
    return (
      <img className="photo-img" src={spot.photos[0]} alt={spot.name} loading="lazy" />
    )
  }

  return (
    <div className="photo-ph" style={{ '--accent': typeColor(spot.type) }}>
      <svg
        className="photo-ph-wash"
        viewBox="0 0 240 140"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          fill="rgba(255,255,255,0.3)"
          d="M0 84c30-19 58 9 92-2s58-24 90-9 58 4 58 4v63H0z"
        />
        <path
          fill="rgba(255,255,255,0.42)"
          d="M0 106c28-14 64 10 100 1s56-15 88-4 52 3 52 3v34H0z"
        />
      </svg>
      <span className="photo-ph-icon">
        {/* Same glyph markup the type key uses — a local constant, not user
            input. */}
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: typeIcon(spot.type) }}
        />
      </span>
    </div>
  )
}

export default SpotPhoto
