'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { YouTubeVideo } from './YouTubeVideo'
import { useScrollLock } from '../lib/useScrollLock'

interface VideoData {
  videoId: string
  title: string
  thumbnail: string
  coverageText: string
  /** Lime card with dark ink, for the season's standout clip */
  highlight?: boolean
}

interface VideoCarouselProps {
  videos: VideoData[]
}

export default function VideoCarousel({ videos }: VideoCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  useScrollLock(modalOpen)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

  const videosPerPage = 3
  const totalPages = Math.ceil(videos.length / videosPerPage)

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
  }

  const openModal = (index: number) => {
    setCurrentVideoIndex(index)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
  }

  // Esc closes the viewer too
  useEffect(() => {
    if (!modalOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalOpen])

  const nextVideo = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length)
  }

  const prevVideo = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex - 1 + videos.length) % videos.length)
  }

  const displayedVideos = videos.slice(currentPage * videosPerPage, (currentPage + 1) * videosPerPage)

  return (
    <>
      {/* Mobile: horizontal scroll */}
      <div className="md:hidden overflow-x-auto flex gap-4 pb-2">
        {videos.map((video, index) => (
          <div
            key={index}
            className={`w-[75vw] shrink-0 shadow-md rounded-lg overflow-hidden cursor-pointer ${video.highlight ? "bg-accent" : "bg-surface"}`}
            onClick={() => openModal(index)}
          >
            <div className="aspect-video relative">
              <Image src={video.thumbnail} alt={video.title} layout="fill" objectFit="cover" />
              <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-filter backdrop-blur-sm flex items-center justify-center">
                <p className="text-white text-lg font-semibold">{video.coverageText}</p>
              </div>
            </div>
            <div className="p-4">
              <p className={`truncate ${video.highlight ? "font-semibold text-accent-foreground" : "text-ink-2"}`}>{video.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: paginated grid with buttons */}
      <div className="hidden md:block relative px-14">
        <div className="grid grid-cols-3 gap-6">
          {displayedVideos.map((video, index) => (
            <div
              key={index}
              className={`${video.highlight ? "bg-accent" : "bg-surface"} shadow-md rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg cursor-pointer`}
              onClick={() => openModal(currentPage * videosPerPage + index)}
            >
              <div className="aspect-video relative">
                <Image src={video.thumbnail} alt={video.title} layout="fill" objectFit="cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-filter backdrop-blur-sm flex items-center justify-center">
                  <p className="text-white text-lg font-semibold">{video.coverageText}</p>
                </div>
              </div>
              <div className="p-4">
                <p className={`truncate ${video.highlight ? "font-semibold text-accent-foreground" : "text-ink-2"}`}>{video.title}</p>
              </div>
            </div>
          ))}
        </div>
        {totalPages > 1 && (
          <>
            <button
              className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-surface bg-opacity-75 hover:bg-opacity-100 rounded-full p-3 shadow-md transition-all duration-300"
              onClick={prevPage}
            >
              <ChevronLeft size={20} className="text-ink" />
            </button>
            <button
              className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-surface bg-opacity-75 hover:bg-opacity-100 rounded-full p-3 shadow-md transition-all duration-300"
              onClick={nextPage}
            >
              <ChevronRight size={20} className="text-ink" />
            </button>
          </>
        )}
      </div>

      {modalOpen && (
        // A click on the dimmed backdrop closes it
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div
            className="bg-surface rounded-lg w-full flex flex-col mx-auto overflow-hidden"
            // 16:9 video plus the caption and Close must fit the screen: the width
            // is capped by the viewport height as well as by 93.75rem
            style={{ maxWidth: 'min(93.75rem, calc((100dvh - 11rem) * 16 / 9))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video">
              <YouTubeVideo
                videoId={videos[currentVideoIndex].videoId}
                title={videos[currentVideoIndex].title}
                autoplay={true}
                width="100%"
                height="100%"
              />
              <button
                className="absolute top-1/2 transform -translate-y-1/2 bg-surface bg-opacity-50 hover:bg-opacity-75 rounded-full p-3 z-10 shadow-md transition-all duration-300 left-4"
                onClick={prevVideo}
              >
                <ChevronLeft size={20} className="text-ink" />
              </button>
              <button
                className="absolute top-1/2 transform -translate-y-1/2 bg-surface bg-opacity-50 hover:bg-opacity-75 rounded-full p-3 z-10 shadow-md transition-all duration-300 right-4"
                onClick={nextVideo}
              >
                <ChevronRight size={20} className="text-ink" />
              </button>
            </div>
            <div className="p-4 flex flex-col items-center">
              <p className="text-center text-ink-2 mb-2">{videos[currentVideoIndex].title}</p>
              <button
                className="w-[100px] bg-surface-3 text-ink py-2 px-4 rounded-md hover:bg-hairline-strong text-sm"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}