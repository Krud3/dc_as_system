import { Link } from 'react-router-dom'
import DatacenterStage from '../components/DatacenterStage.jsx'
import './DatacenterPage.css'

export default function DatacenterPage() {
  return (
    <div className="dc-page noche">
      <Link className="dc-back" to="/">
        Inicio
      </Link>
      <DatacenterStage />
    </div>
  )
}
