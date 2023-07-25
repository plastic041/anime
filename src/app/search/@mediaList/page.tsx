import { Effect, pipe } from 'effect'
import request, { gql } from 'graphql-request'
import { z } from 'zod'
import { P, match } from 'ts-pattern'
import Link from 'next/link'

const query = gql`
  query ($search: String) {
    Page {
      media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
        id
        title {
          romaji
        }
      }
    }
  }
`

const MediaPageDataSchema = z.object({
  Page: z.object({
    media: z.array(
      z.object({
        id: z.number(),
        title: z.object({
          romaji: z.string(),
        }),
      }),
    ),
  }),
})

export type MediaPageData = z.infer<typeof MediaPageDataSchema>

async function getMediaPage(
  search: string,
): Promise<Effect.Effect<never, Error, MediaPageData>> {
  return pipe(
    Effect.tryPromise({
      try: () => {
        const res = request<MediaPageData>(
          'https://graphql.anilist.co',
          query,
          { search },
        )
        return res
      },
      catch: () => new Error('Failed to fetch anime'),
    }),
    Effect.flatMap((res) => {
      const parse = MediaPageDataSchema.safeParse(res)

      if (!parse.success)
        return Effect.fail(new Error('Failed to parse media page'))

      return Effect.succeed(parse.data)
    }),
  )
}

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const q = searchParams.q
  const hasQuery = typeof q === 'string' && q.length > 0
  const data = hasQuery ? await Effect.runPromise(await getMediaPage(q)) : null

  return match([hasQuery, data])
    .with([true, P.not(P.nullish)], ([_, data]) => (
      <ul className="flex flex-col divide-y">
        {data.Page.media.map(media => (
          <li className="flex flex-col" key={media.id}>
            <Link className="flex p-4 bg-white hover:bg-slate-100" href={`/media/${media.id}`}>
              {media.title.romaji}
            </Link>
          </li>
        ))}
      </ul>
    ))
    .otherwise(() => null)
}