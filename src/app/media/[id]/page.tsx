import { Effect } from 'effect'
import { gql } from 'graphql-request'
import { z } from 'zod'
import { MediaInfo } from './media-info'
import { safeParseInt } from '~/_lib/parse-int'
import { graphFetcher } from '~/_lib/graph-fetcher'

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

export default async function AnimePage({
  params: { id },
}: {
  params: { id: string }
}) {
  const parsedId = Effect.runSync(safeParseInt(id))
  const getDataProgram = await graphFetcher(
    query,
    { id: parsedId },
    MediaDataSchema,
  )
  const data = await Effect.runPromise(getDataProgram)

  return <MediaInfo media={data.Media} />
}
