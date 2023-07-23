import { Effect, pipe } from 'effect'
import { gql, request } from 'graphql-request'
import { z } from 'zod'
import { MediaInfo } from './media-info'
import { safeParseInt } from '~/_lib/parse-int'

const query = gql`
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title {
        romaji
        native
      }
      coverImage {
        extraLarge
        large
        medium
        color
      }
      description(asHtml: true)
      bannerImage
    }
  }
`

const MediaDataSchema = z.object({
  Media: z.object({
    id: z.number(),
    title: z.object({
      romaji: z.string(),
      native: z.string(),
    }),
    coverImage: z.object({
      extraLarge: z.string().url(),
      large: z.string().url(),
      medium: z.string().url(),
      color: z.string(),
    }),
    description: z.string(),
    bannerImage: z.string().url(),
  }),
})

export type MediaData = z.infer<typeof MediaDataSchema>

async function getMedia(
  id: number,
): Promise<Effect.Effect<never, Error, MediaData>> {
  return pipe(
    Effect.tryPromise({
      try: () => {
        const res = request<MediaData>('https://graphql.anilist.co', query, { id })
        return res
      },
      catch: () => new Error('Failed to fetch anime'),
    }),
    Effect.flatMap((res) => {
      const parse = MediaDataSchema.safeParse(res)

      if (!parse.success)
        return Effect.fail(new Error('Failed to parse anime'))

      return Effect.succeed(parse.data)
    }),
  )
}

export default async function AnimePage({
  params: { id },
}: {
  params: { id: string }
}) {
  const parsedId = Effect.runSync(safeParseInt(id))
  const data = await Effect.runPromise(await getMedia(parsedId))

  return (
    <MediaInfo media={data.Media} />
  )
}
