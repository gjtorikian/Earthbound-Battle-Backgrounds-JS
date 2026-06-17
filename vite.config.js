import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs'

// Inline replacement for vite-plugin-arraybuffer.
// That plugin only implemented a `transform` hook and relied on the bundler's
// default loader to read the raw file first. Vite 8 switched to rolldown, whose
// native loader tries to open a file literally named `<file>?uint8array&base64`
// (query included) and fails with ENOENT before transform runs. Handling the
// query in resolveId + load keeps it working under both Rollup and rolldown.
const SUFFIX = '?uint8array&base64'

function uint8ArrayBase64 () {
  return {
    name: 'uint8array-base64',
    async resolveId (id, importer) {
      if (!id.endsWith(SUFFIX)) return
      const resolved = await this.resolve(id.slice(0, -SUFFIX.length), importer, { skipSelf: true })
      if (resolved) return resolved.id + SUFFIX
    },
    load (id) {
      if (!id.endsWith(SUFFIX)) return
      const file = id.slice(0, -SUFFIX.length)
      this.addWatchFile(file)
      const b64 = readFileSync(file).toString('base64')
      return `const b64 = ${JSON.stringify(b64)}
export default (typeof Uint8Array.fromBase64 === 'function')
  ? Uint8Array.fromBase64(b64)
  : (() => {
      const bin = atob(b64)
      const bytes = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
      return bytes
    })()`
    }
  }
}

export default defineConfig({
  base: '/Earthbound-Battle-Backgrounds-JS/',
  plugins: [uint8ArrayBase64()]
})
