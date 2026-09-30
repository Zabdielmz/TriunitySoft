import { Link } from 'react-router-dom'

export function Logo() {
  return <Link className="logo" to="/" aria-label="Triunity, ir al inicio">
    <span>TRIUNITY</span>
  </Link>
}
