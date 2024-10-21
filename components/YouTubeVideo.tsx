'use client'

import { useState, useEffect } from 'react'
import { Play } from 'lucide-react'
import Image from 'next/image'

interface YouTubeVideoProps {
  videoId: string;
  title: string;
  autoplay?: boolean;
  width?: string | number;
  height?: string | number;
}

export function YouTubeVideo({ videoId, title, autoplay = false, width = '100%', height = '100%' }: YouTubeVideoProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay)

  useEffect(() => {
    if (autoplay) {
      setIsPlaying(true)
    }
  }, [autoplay, videoId])

  const handlePlay = () => {
    setIsPlaying(true)
  }

  const src = `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&autoplay=1`

  return (
    <div className="relative w-full h-full" style={{ aspectRatio: '16 / 9' }}>
      {!isPlaying ? (
        <div className="absolute inset-0">
          <Image
            src="/imgs/fifa/fifathumbnail.jpg"
            alt={`Thumbnail for ${title}`}
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <button
              onClick={handlePlay}
              className="bg-red-600 text-white rounded-full p-4 flex items-center justify-center hover:bg-red-700 transition-colors"
              aria-label={`Play ${title}`}
            >
              <Play size={24} />
            </button>
          </div>
        </div>
      ) : (
        <iframe
          width={width}
          height={height}
          src={src}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        ></iframe>
      )}
    </div>
  )
}