import { TYPE_COLORS } from '../typeStyles'

function Legend() {
  return (
    <div className="legend">
      <p className="legend-title">Type</p>
      <ul>
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <li key={type}>
            <span className="legend-dot" style={{ backgroundColor: color }} />
            {type}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Legend
