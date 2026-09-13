import { useEffect, useRef, useState } from 'react'
import '../lib/three-d-stage.js'

/**
 * Bridge React ↔ Three.js imperativo (sin R3F).
 * Monta <three-d-stage> + panel y ejecuta la escena existente.
 */
export default function DatacenterStage() {
  const hostRef = useRef(null)
  const [status, setStatus] = useState('Cargando escena…')
  const [error, setError] = useState(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined

    let cancelled = false

    const stage = document.createElement('three-d-stage')
    stage.setAttribute('name', 'datacenter')
    stage.setAttribute('background', '#0a0a0a')
    stage.setAttribute('autorotate', '')

    const panel = document.createElement('aside')
    panel.id = 'panel'
    panel.innerHTML = `
      <h1>Datacenter como sistema</h1>
      <p>19 principios TGS · clic en un objeto para identificarlo</p>
      <div class="modo" role="group" aria-label="Iluminación">
        <button type="button" id="mDia" aria-pressed="false">Día</button>
        <button type="button" id="mNoche" aria-pressed="true">Noche</button>
      </div>
      <div id="layers"></div>
      <div id="estado"></div>
      <div id="sel">—</div>
    `

    host.append(stage, panel)

    ;(async () => {
      try {
        const { mountDatacenterScene } = await import('../scene/datacenterScene.js')
        await mountDatacenterScene(stage)
        if (!cancelled) setStatus('Lista')
      } catch (err) {
        console.error(err)
        if (!cancelled) {
          setError(String(err?.message || err))
          setStatus('Error')
        }
      }
    })()

    return () => {
      cancelled = true
      if (window.datacenter?.stage === stage) {
        try {
          delete window.datacenter
        } catch (_) {
          /* ignore */
        }
      }
      stage.remove()
      panel.remove()
      host.replaceChildren()
    }
  }, [])

  return (
    <>
      <div ref={hostRef} className="dc-stage-host" />
      {status !== 'Lista' && !error && (
        <div className="dc-loading" role="status">
          {status}
        </div>
      )}
      {error && (
        <div className="dc-loading dc-loading--error" role="alert">
          No se pudo cargar la escena: {error}
        </div>
      )}
    </>
  )
}
