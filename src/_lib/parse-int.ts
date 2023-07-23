import { Effect } from 'effect'
import { z } from 'zod'

export function safeParseInt(value: unknown): Effect.Effect<never, Error, number> {
  const result = z.coerce.number().safeParse(value)

  if (result.success)
    return Effect.succeed(result.data)

  return Effect.fail(new Error(result.error.message))
}
