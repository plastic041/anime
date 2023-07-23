'use client'

import { SWRConfig } from 'swr'
import { type Variables, request } from 'graphql-request'

///

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: (query: [string, Variables]) => {
          return request('https://graphql.anilist.co', ...query)
        },
      }}
    >
      {children}
    </SWRConfig>
  )
}
