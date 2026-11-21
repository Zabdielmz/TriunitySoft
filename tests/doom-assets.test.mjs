import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { runInNewContext } from 'node:vm'
import test from 'node:test'

const root = fileURLToPath(new URL('../', import.meta.url))
const publicRoot = join(root, 'public')
const gameRoot = join(publicRoot, 'games', 'doom')
const html = readFileSync(join(gameRoot, 'index.html'), 'utf8')
const player = readFileSync(join(gameRoot, 'player.js'), 'utf8')
const documentPaths = ['/games/doom', '/games/doom/', '/games/doom/index', '/games/doom/index.html']

for (const path of documentPaths) {
  test(`assets resolve after cleanUrls canonicalization to ${path}`, () => {
    const location = new URL(`${path}?v=2&muted=1`, 'https://www.triunity.com.mx')
    for (const [, resource] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      const url = new URL(resource, location)
      assert.equal(url.origin, location.origin)
      assert.ok(url.pathname.startsWith('/games/doom/'), `Wrong directory: ${url.pathname}`)
      assert.ok(existsSync(join(publicRoot, url.pathname)), `Missing resource: ${url.pathname}`)
    }

    let options
    const window = {
      location,
      parent: { postMessage() {} },
      addEventListener() {},
      setTimeout() { return 1 },
      clearTimeout() {},
      Dos(_host, value) { options = value; return { setNoCloud() {} } },
    }
    runInNewContext(player, {
      window, URL, URLSearchParams, console,
      document: { getElementById() { return {} }, addEventListener() {} },
    })
    assert.ok(options, 'Player initialization failed')
    assert.equal(new URL(options.url).pathname, '/games/doom/doom-shareware.jsdos')
    assert.equal(options.pathPrefix, 'https://www.triunity.com.mx/games/doom/vendor/')
    assert.equal(options.volume, 0, 'Muted startup must survive the redirect')
  })
}

test('game binaries are real WASM/ZIP files rather than an SPA fallback', () => {
  for (const file of ['wdosbox.wasm', 'wlibzip.wasm']) {
    assert.equal(readFileSync(join(gameRoot, 'vendor', file)).subarray(0, 8).toString('hex'), '0061736d01000000')
  }
  assert.equal(readFileSync(join(gameRoot, 'doom-shareware.jsdos')).subarray(0, 4).toString('hex'), '504b0304')
})

test('Vercel serves game resources separately from SPA routes and API handlers', () => {
  const config = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'))
  const fallback = new RegExp(`^${config.rewrites[0].source}$`)
  for (const path of ['/games/doom', '/games/doom/vendor/missing.js', '/api/auth/session']) assert.equal(fallback.test(path), false, path)
  for (const path of ['/jugar', '/proyectos/nexo', '/']) assert.equal(fallback.test(path), true, path)
})
