import { Effect, pipe } from 'effect'
import type { Variables } from 'graphql-request'
import request from 'graphql-request'
import type { z } from 'zod'

export async function graphFetcher<T>(
  query: string,
  variables: Variables,
  schema: z.ZodSchema<T>,
): Promise<Effect.Effect<never, Error, z.infer<typeof schema>>> {
  return pipe(
    Effect.tryPromise({
      try: () => {
        const res = request<z.infer<typeof schema>>('https://graphql.anilist.co', query, variables)
        return res
      },
      catch: () => new Error('Failed to fetch anime'),
    }),
    Effect.flatMap((res) => {
      const parse = schema.safeParse(res)

      if (!parse.success)
        return Effect.fail(new Error('Failed to parse anime'))

      return Effect.succeed(parse.data)
    }),
  )
}
