/* Isolated from the site's CSS and React lifecycle. All game assets are local. */
(() => {
  const channel = 'triunity-doom'
  // Vercel cleanUrls redirects index.html to /games/doom (without a slash).
  // Resolve assets from an explicit directory, never from the document URL.
  const assetBase = new URL('/games/doom/', window.location.origin)
  const allowedKeys = new Set([256, 257, 262, 263, 264, 265, 341, 32, 340])
  const heldKeys = new Set()
  const host = document.getElementById('dos')
  let player
  let command
  let disposed = false

  function report(type, extra = {}) {
    window.parent.postMessage({ channel, type, ...extra }, window.location.origin)
  }
  function releaseKeys() {
    for (const code of heldKeys) command?.sendKeyEvent(code, false)
    heldKeys.clear()
  }
  function pause() {
    releaseKeys()
    player?.setPaused(true)
    report('paused')
  }
  // Use KeyboardEvent.key rather than the legacy keyCode used by DOSBox's UI.
  // Capture here so a physical key is delivered exactly once to the emulator.
  function keyboardCode(event) {
    const keys = { Escape: 256, Enter: 257, Backspace: 259, ArrowRight: 262, ArrowLeft: 263, ArrowDown: 264, ArrowUp: 265, ' ': 32, Control: 341, Shift: 340, Alt: 342 }
    if (keys[event.key] !== undefined) return keys[event.key]
    if (/^[a-z0-9]$/i.test(event.key)) return event.key.toUpperCase().charCodeAt(0)
    if (/^F([1-9]|1[0-2])$/.test(event.key)) return 289 + Number(event.key.slice(1))
    return null
  }
  for (const type of ['keydown', 'keyup']) {
    window.addEventListener(type, (event) => {
      // Let Tab leave the game and reach the page controls with a keyboard.
      if (event.key === 'Tab') { releaseKeys(); event.stopImmediatePropagation(); return }
      const code = keyboardCode(event)
      if (code === null || !command) return
      event.preventDefault()
      event.stopImmediatePropagation()
      if (type === 'keydown') heldKeys.add(code)
      else heldKeys.delete(code)
      command.sendKeyEvent(code, type === 'keydown')
    }, true)
  }
  window.addEventListener('blur', releaseKeys)
  const watchdog = window.setTimeout(() => report('error'), 90000)

  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.channel !== channel || disposed) return
    const { action, key } = event.data
    switch (action) {
      case 'pause': pause(); break
      case 'resume': player?.setPaused(false); host.focus({ preventScroll: true }); report('playing'); break
      case 'mute': player?.setVolume(0); break
      case 'unmute': player?.setVolume(.6); break
      case 'focus': host.focus({ preventScroll: true }); break
      case 'key-down':
        if (allowedKeys.has(key) && command) { heldKeys.add(key); command.sendKeyEvent(key, true) }
        break
      case 'key-up':
        if (allowedKeys.has(key) && command) { heldKeys.delete(key); command.sendKeyEvent(key, false) }
        break
      case 'key-tap':
        if (allowedKeys.has(key)) command?.simulateKeyPress(key)
        break
    }
  })
  window.addEventListener('error', (event) => report('error', { reason: event.message }))
  window.addEventListener('unhandledrejection', (event) => report('error', { reason: String(event.reason) }))
  document.addEventListener('visibilitychange', () => { if (document.hidden && command) pause() })
  window.addEventListener('pagehide', () => {
    disposed = true
    window.clearTimeout(watchdog)
    releaseKeys()
    void player?.stop().catch(() => {})
  }, { once: true })

  try {
    if (typeof window.Dos !== 'function') throw new Error('Emulator unavailable')
    player = window.Dos(host, {
      url: new URL('doom-shareware.jsdos?v=1', assetBase).href,
      opfsRoot: 'triunity-doom-shareware-v1',
      pathPrefix: new URL('vendor/', assetBase).href,
      backend: 'dosbox',
      backendLocked: true,
      autoStart: true,
      kiosk: true,
      noCloud: true,
      fsChanges: { local: false },
      mouseCapture: false,
      renderAspect: '4/3',
      renderBackend: 'canvas',
      imageRendering: 'pixelated',
      volume: new URLSearchParams(window.location.search).get('muted') === '1' ? 0 : .6,
      onEvent: (event, value) => {
        if (disposed) return
        if (event === 'ci-ready') {
          command = value
          window.clearTimeout(watchdog)
          command.events().onExit(() => report('stopped'))
          host.focus({ preventScroll: true })
          report('playing')
        }
      },
    })
    player.setNoCloud(true)
  } catch (error) {
    console.error('[doom] Emulator could not start:', error)
    window.clearTimeout(watchdog)
    report('error', { reason: String(error) })
  }
})()
