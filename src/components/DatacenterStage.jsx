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
    stage.setAttribute('background', '#111114')
    stage.setAttribute('autorotate', '')

    const panel = document.createElement('aside')
    panel.id = 'panel'
    panel.innerHTML = `
      <header class="panel__header">
        <h1>Datacenter como <em>sistema</em></h1>
        <p>19 principios TGS · clic en un objeto para identificarlo</p>
      </header>
      <div class="modo" role="group" aria-label="Iluminación">
        <button type="button" id="mDia" aria-pressed="false"><span>Día</span></button>
        <button type="button" id="mNoche" aria-pressed="true"><span>Noche</span></button>
      </div>
      <div id="layers"></div>
      <div id="sel">—</div>
    `

    const guide = document.createElement('aside')
    guide.id = 'anim-guide'
    guide.className = 'anim-guide'
    guide.hidden = true
    guide.setAttribute('aria-live', 'polite')
    guide.innerHTML = `
      <button type="button" class="anim-guide__close" id="anim-guide-close" aria-label="Cerrar guía">×</button>
      <div class="anim-guide__meta">
        <span class="anim-guide__num" id="anim-guide-num">00</span>
        <h2 class="anim-guide__name" id="anim-guide-name"></h2>
      </div>
      <p class="anim-guide__status" id="estado"></p>
      <div class="anim-guide__evidencia-wrap">
        <span class="anim-guide__eyebrow">Cómo se evidencia</span>
        <p class="anim-guide__evidencia" id="anim-guide-evidencia"></p>
      </div>
    `

    host.append(stage, panel, guide)

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
      guide.remove()
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
