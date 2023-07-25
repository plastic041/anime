import { Effect, pipe } from 'effect'
import request, { gql } from 'graphql-request'
import { z } from 'zod'
import { Button } from '~/_components/ui/button'
import { Input } from '~/_components/ui/input'
import { Label } from '~/_components/ui/label'

const query = gql`
  query ($search: String) {
    Page {
      media(search: $search) {
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

  return (
    <div>
      <h1>Search results for {q}</h1>
      <form className="flex flex-col max-w-sm space-y-1.5">
        <Label htmlFor="q">Search</Label>
        <div className="flex flex-row space-x-1.5">
          <Input type="text" name="q" id="q" defaultValue={q} />
          <Button type="submit">Search</Button>
        </div>
      </form>
    </div>
  )
}
