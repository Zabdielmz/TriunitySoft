import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/game.css'

type Signal = 0 | 1 | 2
type Phase = 'ready' | 'showing' | 'playing' | 'round-clear' | 'won' | 'lost'

type GameState = {
  phase: Phase
  round: number
  sequence: Signal[]
  inputIndex: number
  active: Signal | null
  message: string
}

const signals = [
  { name: 'uno', key: '1' },
  { name: 'dos', key: '2' },
  { name: 'tres', key: '3' },
] as const

const totalRounds = 10
const firstRoundLength = 2

const phaseTitles: Record<Phase, string> = {
  ready: 'Sistema en espera',
  showing: 'Memoriza la señal',
  playing: 'Tu turno',
  'round-clear': 'Ronda sincronizada',
  won: 'Conexión completa',
  lost: 'Interferencia detectada',
}

const initialGame: GameState = {
  phase: 'ready',
  round: 0,
  sequence: [],
  inputIndex: 0,
  active: null,
  message: 'Diez rondas. Una sola conexión.',
}

function newSequence(): Signal[] {
  return Array.from({ length: firstRoundLength + totalRounds - 1 }, () => Math.floor(Math.random() * signals.length) as Signal)
}

export function GamePage() {
  const [game, setGame] = useState<GameState>(initialGame)
  const roundLength = game.round + firstRoundLength

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Protocolo 03 — Triunity'
    return () => { document.title = previousTitle }
  }, [])

  useEffect(() => {
    if (game.phase !== 'showing') return

    const timers: number[] = []
    const pattern = game.sequence.slice(0, roundLength)
    const firstCue = 650
    const cueInterval = Math.max(560, 1000 - game.round * 50)
    const activeDuration = Math.round(cueInterval * .64)

    pattern.forEach((signal, index) => {
      timers.push(window.setTimeout(() => {
        setGame((current) => current.phase === 'showing' ? {
          ...current,
          active: signal,
          message: `Señal ${index + 1} de ${pattern.length}: ${signals[signal].name}.`,
        } : current)
      }, firstCue + index * cueInterval))
      timers.push(window.setTimeout(() => {
        setGame((current) => current.phase === 'showing' ? { ...current, active: null } : current)
      }, firstCue + index * cueInterval + activeDuration))
    })

    timers.push(window.setTimeout(() => {
      setGame((current) => current.phase === 'showing' ? {
        ...current,
        phase: 'playing',
        active: null,
        message: `Repite las ${pattern.length} señales en el mismo orden.`,
      } : current)
    }, firstCue + pattern.length * cueInterval))

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [game.phase, game.round, game.sequence, roundLength])

  const guess = useCallback((signal: Signal) => {
    setGame((current) => {
      if (current.phase !== 'playing') return current
      if (current.sequence[current.inputIndex] !== signal) return {
        ...current,
        phase: 'lost',
        message: 'La secuencia se cortó. Puedes repetir esta misma ronda.',
      }

      const inputIndex = current.inputIndex + 1
      const needed = current.round + firstRoundLength
      if (inputIndex === needed) return {
        ...current,
        inputIndex,
        phase: current.round === totalRounds - 1 ? 'won' : 'round-clear',
        message: current.round === totalRounds - 1
          ? 'Las tres señales están en sincronía. ¡Lo lograste!'
          : `Completaste la ronda ${current.round + 1}.`,
      }

      return { ...current, inputIndex, message: `${inputIndex} de ${needed} señales correctas.` }
    })
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return
      const target = event.target as HTMLElement | null
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return
      if (event.key === '1' || event.key === '2' || event.key === '3') guess((Number(event.key) - 1) as Signal)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [guess])

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) setGame((current) => current.phase === 'showing' ? {
        ...current,
        phase: 'lost',
        active: null,
        message: 'La vista se interrumpió. Repite esta ronda cuando regreses.',
      } : current)
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  const start = () => setGame({
    phase: 'showing',
    round: 0,
    sequence: newSequence(),
    inputIndex: 0,
    active: null,
    message: 'Observa las señales.',
  })

  const replay = () => setGame((current) => ({
    ...current,
    phase: 'showing',
    inputIndex: 0,
    active: null,
    message: 'Observa las señales otra vez.',
  }))

  const nextRound = () => setGame((current) => {
    const round = current.round + 1
    return {
      ...current,
      phase: 'showing',
      round,
      inputIndex: 0,
      active: null,
      message: round >= 7
        ? 'Etapa final: más señales y menos tiempo entre ellas.'
        : round >= 3
          ? 'La secuencia crece y el ritmo acelera. Observa con atención.'
          : 'La secuencia crece. Observa con atención.',
    }
  })

  return <main className="game-page" id="main">
    <div className="container game-layout">
      <div className="game-intro">
        <Link className="back-link" to="/#tridente">← Volver a Triunity</Link>
        <h1>Sincroniza las tres señales<span className="period">.</span></h1>
        <p>Observa el patrón de luz y repítelo en el mismo orden. Supera diez rondas: la secuencia crece y las señales se aceleran.</p>
        <p className="game-instructions"><span>Toca las señales o usa las teclas</span><span className="game-key-group"><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd></span></p>
      </div>

      <section className="game-console" aria-label="Minijuego Protocolo 03" data-phase={game.phase}>
        <div className="game-console-top"><span>TRIUNITY / PROTOCOLO 03</span><span>● EN LÍNEA</span></div>
        <div className="game-console-body">
          <div className="game-round"><span>RONDA {game.phase === 'ready' ? '—' : String(game.round + 1).padStart(2, '0')} / {String(totalRounds).padStart(2, '0')}</span><div className="game-round-bars" aria-hidden="true">{Array.from({ length: totalRounds }, (_, step) => <i key={step} className={game.phase !== 'ready' && step <= game.round ? 'is-lit' : ''} />)}</div></div>

          <div className="game-message" role="status" aria-live="polite" aria-atomic="true">
            <h2>{phaseTitles[game.phase]}</h2>
            <p>{game.message}</p>
          </div>

          <div className="game-pads">
            {signals.map((signal, index) => <button
              className={`game-pad game-pad-${index}${game.active === index ? ' is-active' : ''}`}
              type="button"
              key={signal.key}
              disabled={game.phase !== 'playing'}
              onClick={() => guess(index as Signal)}
              aria-label={`Señal ${signal.name}, tecla ${signal.key}`}
            ><span className="game-pad-core" aria-hidden="true" /><span className="game-pad-key" aria-hidden="true">0{signal.key}</span></button>)}
          </div>

          <div className="game-progress"><span>{game.phase === 'ready' ? 'SECUENCIA' : `TU SECUENCIA · ${game.inputIndex} / ${roundLength}`}</span><div aria-hidden="true">{Array.from({ length: game.phase === 'ready' ? firstRoundLength : roundLength }, (_, index) => <i key={index} className={index < game.inputIndex ? 'is-done' : ''} />)}</div></div>

          <div className="game-controls">
            {game.phase === 'ready' && <button className="button button-primary" type="button" onClick={start}>Comenzar <span aria-hidden="true">↗</span></button>}
            {game.phase === 'showing' && <span className="game-wait">Observa el patrón...</span>}
            {game.phase === 'playing' && <button className="game-text-button" type="button" onClick={replay}>Ver secuencia otra vez</button>}
            {game.phase === 'round-clear' && <button className="button button-primary" type="button" onClick={nextRound}>Siguiente ronda <span aria-hidden="true">↗</span></button>}
            {game.phase === 'won' && <button className="button button-primary" type="button" onClick={start}>Jugar otra vez <span aria-hidden="true">↗</span></button>}
            {game.phase === 'lost' && <><button className="button button-primary" type="button" onClick={replay}>Repetir ronda <span aria-hidden="true">↗</span></button><button className="game-text-button" type="button" onClick={start}>Nuevo patrón</button></>}
          </div>
        </div>
      </section>
    </div>
  </main>
}
