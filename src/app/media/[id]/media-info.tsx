import Image from 'next/image'
import { Effect } from 'effect'
import type { MediaData } from './page'
import { makeBlur } from './make-blur'

interface MediaInfoProps {
  media: MediaData['Media']
}

export function MediaInfo({ media }: MediaInfoProps) {
  const dataURL = Effect.runSync(makeBlur(media.coverImage.color))

  return (
    <div className="flex flex-col items-stretch">
      <div className="w-screen h-[200px] relative">
        <Image
          fill
          src={media.bannerImage}
          alt={`Alternate cover image of ${media.title.romaji}`}
          blurDataURL={dataURL}
          placeholder="blur"
          className="object-cover w-full h-full origin-center"
        />
        <div
          aria-hidden
          className="w-full h-full bg-gradient-to-r absolute banner-overlay"
          style={
            {
              '--tw-gradient-from': `${media.coverImage.color} var(--tw-gradient-from-position)`,
              '--tw-gradient-to': `${media.coverImage.color} var(--tw-gradient-to-position)`,
              '--tw-gradient-stops':
                'var(--tw-gradient-from), transparent var(--tw-gradient-via-position), var(--tw-gradient-to)',
            } as React.CSSProperties
          }
        />
      </div>
      <div className="flex bg-white p-4 rounded mx-4 -mt-4 relative">
        <div className="flex flex-row">
          <Image
            width={150}
            height={200}
            className="w-[150px] h-[200px] object-cover"
            src={media.coverImage.large}
            blurDataURL={dataURL}
            placeholder="blur"
            alt={`Cover of ${media.title}`}
          />
          <div className="ml-4">
            <h2 className="flex flex-col">
              <span
                aria-label="Title in native language"
                className="text-4xl font-bold text-slate-900"
              >
                {media.title.native}
              </span>
              <span
                aria-label="Title in romaji"
                className="text-xl text-slate-500 mt-2"
              >
                {media.title.romaji}
              </span>
            </h2>
          </div>
        </div>
        <article
          className="prose prose-slate ml-4"
          dangerouslySetInnerHTML={{
            __html: media.description.replaceAll(/<br>(?!<\/br>|<br\s\/>)/g, ''),
          }}
        />
      </div>
    </div>
  )
}
