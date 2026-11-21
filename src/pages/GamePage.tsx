import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import '../styles/game.css'

type Phase = 'ready' | 'loading' | 'playing' | 'paused' | 'error' | 'stopped'
type Action = 'pause' | 'resume' | 'mute' | 'unmute' | 'focus' | 'key-down' | 'key-up' | 'key-tap'
const channel = 'triunity-doom'

const phaseLabels: Record<Phase, string> = {
  ready: 'En espera',
  loading: 'Cargando Doom…',
  playing: 'En juego',
  paused: 'En pausa',
  error: 'No se pudo iniciar',
  stopped: 'Partida terminada',
}
const touchKeys = [
  { label: 'Girar a la izquierda', icon: 'back', code: 263, position: 'left' },
  { label: 'Avanzar', icon: 'up', code: 265, position: 'up' },
  { label: 'Girar a la derecha', icon: 'right', code: 262, position: 'right' },
  { label: 'Retroceder', icon: 'down', code: 264, position: 'down' },
  { label: 'Disparar', text: 'Disparar', code: 341, position: 'fire' },
  { label: 'Usar o abrir puertas', text: 'Usar', code: 32, position: 'use' },
  { label: 'Confirmar en el menú', text: 'Enter', code: 257, position: 'enter' },
  { label: 'Abrir el menú del juego', text: 'Menú', code: 256, position: 'menu' },
] as const

function GameIcon({ name }: { name: 'play' | 'pause' | 'sound' | 'muted' | 'expand' | 'close' | 'back' | 'up' | 'right' | 'down' }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {name === 'play' && <path d="m8 4 12 8-12 8V4Z" />}
    {name === 'pause' && <><path d="M7 4v16M17 4v16" /></>}
    {(name === 'sound' || name === 'muted') && <><path d="M11 4 5 9H2v6h3l6 5V4Z" />{name === 'sound' ? <><path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14" /></> : <path d="m16 9 6 6m0-6-6 6" />}</>}
    {name === 'expand' && <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />}
    {name === 'close' && <path d="m6 6 12 12M6 18 18 6" />}
    {name === 'back' && <path d="m14 6-6 6 6 6" />}
    {name === 'up' && <path d="m6 14 6-6 6 6" />}
    {name === 'right' && <path d="m10 6 6 6-6 6" />}
    {name === 'down' && <path d="m6 10 6 6 6-6" />}
  </svg>
}

export function GamePage() {
  const [phase, setPhase] = useState<Phase>('ready')
  const [muted, setMuted] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [bootMuted, setBootMuted] = useState(false)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const consoleRef = useRef<HTMLElement>(null)
  const startupTimer = useRef<number | undefined>(undefined)
  const active = phase === 'playing' || phase === 'paused'
  const mounted = phase === 'loading' || active
  const immersive = fullscreen || expanded

  const send = useCallback((action: Action, key?: number) => {
    frameRef.current?.contentWindow?.postMessage({ channel, action, key }, window.location.origin)
  }, [])

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'DOOM — El nivel secreto de Triunity'
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow || event.data?.channel !== channel) return
      const type: unknown = event.data.type
      if (type === 'error') console.error('[doom] Player error:', event.data.reason ?? 'Unknown error')
      if (type === 'playing' || type === 'paused' || type === 'error' || type === 'stopped') {
        window.clearTimeout(startupTimer.current)
        setPhase(type)
      }
    }
    const onFullscreenChange = () => setFullscreen(document.fullscreenElement === consoleRef.current)
    const onVisibilityChange = () => { if (document.hidden) send('pause') }
    window.addEventListener('message', receive)
    document.addEventListener('fullscreenchange', onFullscreenChange)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      document.title = previousTitle
      window.clearTimeout(startupTimer.current)
      window.removeEventListener('message', receive)
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [send])

  useEffect(() => {
    if (!expanded) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setExpanded(false) }
    window.addEventListener('keydown', onEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onEscape)
    }
  }, [expanded])

  const start = () => {
    window.clearTimeout(startupTimer.current)
    setBootMuted(muted)
    setAttempt((value) => value + 1)
    setPhase('loading')
    startupTimer.current = window.setTimeout(() => setPhase('error'), 95000)
  }

  const toggleFullscreen = async () => {
    try {
      if (fullscreen) await document.exitFullscreen()
      else if (expanded) setExpanded(false)
      else if (document.fullscreenEnabled && consoleRef.current?.requestFullscreen) await consoleRef.current.requestFullscreen()
      else setExpanded(true)
    } catch {
      setExpanded(true)
    }
  }

  const pressTouchKey = (event: PointerEvent<HTMLButtonElement>, code: number) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    send('key-down', code)
  }
  const releaseTouchKey = (code: number) => send('key-up', code)

  return <main className="doom-page" id="main">
    <div className="container doom-layout">
      <header className="doom-intro">
        <Link className="doom-back" to="/#tridente"><GameIcon name="back" />Volver a Triunity</Link>
        <div className="doom-heading">
          <div><h1>El nivel secreto<span className="period">.</span></h1><p>Doom clásico, directo en tu navegador. El primer episodio te espera.</p></div>
          <span className="doom-edition">DOOM · SHAREWARE 1.9</span>
        </div>
      </header>

      <section className={`doom-console${expanded ? ' is-expanded' : ''}`} ref={consoleRef} aria-label="Consola de Doom clásico">
        <div className="doom-console-bar">
          <span className="doom-console-brand">TRIUNITY <span>/ DOOM</span></span>
          <span className={`doom-status${phase === 'playing' ? ' is-playing' : ''}`} role="status" aria-live="polite">{phaseLabels[phase]}</span>
          <div className="doom-toolbar">
            <button type="button" onClick={() => send(phase === 'paused' ? 'resume' : 'pause')} disabled={!active} aria-label={phase === 'paused' ? 'Continuar partida' : 'Pausar partida'} title={phase === 'paused' ? 'Continuar partida' : 'Pausar partida'}><GameIcon name={phase === 'paused' ? 'play' : 'pause'} /><span>{phase === 'paused' ? 'Continuar' : 'Pausa'}</span></button>
            <button type="button" onClick={() => { send(muted ? 'unmute' : 'mute'); setMuted(!muted) }} aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'} aria-pressed={muted} title={muted ? 'Activar sonido' : 'Silenciar sonido'}><GameIcon name={muted ? 'muted' : 'sound'} /><span>{muted ? 'Sin sonido' : 'Sonido'}</span></button>
            <button type="button" onClick={() => void toggleFullscreen()} aria-label={immersive ? 'Salir de pantalla completa' : 'Pantalla completa'} title={immersive ? 'Salir de pantalla completa' : 'Pantalla completa'}><GameIcon name={immersive ? 'close' : 'expand'} /><span>{immersive ? 'Salir' : 'Ampliar'}</span></button>
          </div>
        </div>

        <div className="doom-stage" aria-busy={phase === 'loading'}>
          {mounted && <iframe
            key={attempt}
            ref={frameRef}
            className="doom-frame"
            src={`/games/doom/index.html?muted=${bootMuted ? '1' : '0'}`}
            title="Doom clásico, episodio 1"
            allow="autoplay; fullscreen"
            onError={() => { window.clearTimeout(startupTimer.current); setPhase('error') }}
          />}
          {!active && <div className={`doom-splash${phase === 'loading' ? ' is-loading' : ''}`}>
            <div className="doom-splash-content">
              {phase === 'loading' ? <><span className="doom-loader" aria-hidden="true" /><h2>Abriendo las puertas…</h2><p>Preparando el juego. La primera carga puede tardar unos segundos.</p></> : <>
                <div className="doom-game-title" aria-hidden="true">DOOM</div>
                <h2>{phase === 'error' ? 'No pudimos arrancar Doom' : phase === 'stopped' ? '¿Una partida más?' : 'Knee-Deep in the Dead'}</h2>
                <p>{phase === 'error' ? 'Hubo un problema al cargar el juego. Comprueba tu conexión y vuelve a intentarlo.' : phase === 'stopped' ? 'El primer episodio sigue esperando. Puedes empezar de nuevo.' : 'Un pasillo. Una escopeta. Y una muy buena razón para quedarte un rato.'}</p>
                <button className="doom-start" type="button" onClick={start}><GameIcon name="play" />{phase === 'error' ? 'Volver a intentar' : phase === 'stopped' ? 'Iniciar otra partida' : 'Iniciar Doom'}</button>
                <span className="doom-start-note">Sin instalaciones. Juega con teclado o controles táctiles.</span>
              </>}
            </div>
          </div>}
          {phase === 'paused' && <div className="doom-pause-overlay"><h2>Un respiro.</h2><p>Tu partida está en pausa.</p><button className="doom-start" type="button" onClick={() => send('resume')}><GameIcon name="play" />Continuar partida</button></div>}
        </div>

        <div className="doom-touch-controls" role="group" aria-label="Controles táctiles de Doom">
          {touchKeys.map((key) => <button
            key={key.code}
            className={`doom-touch-key touch-${key.position}`}
            type="button"
            aria-label={key.label}
            disabled={phase !== 'playing'}
            onPointerDown={(event) => pressTouchKey(event, key.code)}
            onPointerUp={() => releaseTouchKey(key.code)}
            onPointerCancel={() => releaseTouchKey(key.code)}
            onLostPointerCapture={() => releaseTouchKey(key.code)}
            onClick={(event) => { if (event.detail === 0) send('key-tap', key.code) }}
            onContextMenu={(event) => event.preventDefault()}
          >{'icon' in key ? <GameIcon name={key.icon} /> : key.text}</button>)}
        </div>
        <div className="doom-console-bottom"><span>Episodio 1 · Knee-Deep in the Dead</span><span>id Software © 1993–1995</span></div>
      </section>


      <section className="doom-controls-guide" aria-labelledby="doom-controls-title">
        <div><h2 id="doom-controls-title">Antes de entrar</h2><p>Haz clic dentro del juego para usar el teclado. En el menú original, elige <strong>New Game</strong> y confirma con <kbd>Enter</kbd>.</p></div>
        <dl className="doom-key-list">
          <div><dt><kbd>↑</kbd><kbd>↓</kbd></dt><dd>Moverse</dd></div>
          <div><dt><kbd>←</kbd><kbd>→</kbd></dt><dd>Girar</dd></div>
          <div><dt><kbd>Ctrl</kbd></dt><dd>Disparar</dd></div>
          <div><dt><kbd>Espacio</kbd></dt><dd>Abrir / usar</dd></div>
          <div><dt><kbd>Shift</kbd></dt><dd>Correr</dd></div>
          <div><dt><kbd>Esc</kbd></dt><dd>Menú</dd></div>
        </dl>
      </section>
      <footer className="doom-credits"><p>Edición shareware original: incluye únicamente el primer episodio de Doom.</p><a href="/games/doom/credits.html" target="_blank" rel="noopener noreferrer">Créditos y licencias</a></footer>
    </div>
  </main>
}
