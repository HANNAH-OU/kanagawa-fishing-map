import { markerColor } from '../typeStyles'

// Keyed to what the lamps actually encode: salt water versus managed inland
// water. The amber row covers 海釣り施設・堤防・磯, which all share one colour.
const KEYS = [
  { label: '海釣り', type: '海釣り施設' },
  { label: '管理釣り場', type: '管理釣り場' },
]

function Legend() {
  return (
    <div className="legend">
      <p className="legend-title">Legend</p>
      <ul>
        {KEYS.map((key) => (
          <li key={key.type}>
            <span
              className="legend-lamp"
              style={{ '--lamp': markerColor(key.type) }}
            />
            {key.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Legend
