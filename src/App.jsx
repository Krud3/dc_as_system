import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'

const DatacenterPage = lazy(() => import('./pages/DatacenterPage.jsx'))

export default function App() {
  return (
    <Suspense fallback={<div className="dc-loading" style={{ position: 'fixed', inset: 0, displayContent: 'center' }}>Cargando…</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/escena" element={<DatacenterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
