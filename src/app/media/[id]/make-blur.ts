import { Effect, pipe } from 'effect'

// Pixel GIF code adapted from https://stackoverflow.com/a/33919020/266535
const KEY_STRING
  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=' as const

function triplet(e1: number, e2: number, e3: number) {
  return (
    KEY_STRING.charAt(e1 >> 2)
    + KEY_STRING.charAt(((e1 & 3) << 4) | (e2 >> 4))
    + KEY_STRING.charAt(((e2 & 15) << 2) | (e3 >> 6))
    + KEY_STRING.charAt(e3 & 63)
  )
}

function rgbDataURL(r: number, g: number, b: number) {
  return `data:image/gif;base64,R0lGODlhAQABAPAA${
    triplet(0, r, g) + triplet(b, 255, 255)
  }/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==`
}

function hexToRgb(hex: string) {
  const bigint = Number.parseInt(hex.slice(1), 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return { r, g, b }
}

/**
 * Make a blur dataURL from a hex color
 * @param string hex in #rrggbb format
 */
export function makeBlur(hex: string): Effect.Effect<never, never, string> {
  return pipe(
    Effect.succeed(hexToRgb(hex)),
    Effect.map(({ r, g, b }) => rgbDataURL(r, g, b)),
  )
}
