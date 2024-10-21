'use client'

import { useState } from 'react'
import Image from 'next/image'
import { YouTubeVideo } from './YouTubeVideo'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface VideoData {
  videoId: string
  title: string
  thumbnail: string
}

interface VideoGalleryProps {
  videos: VideoData[]
}

export default function VideoGallery({ videos }: VideoGalleryProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

  const openModal = (index: number) => {
    setCurrentVideoIndex(index)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
  }

  const nextVideo = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length)
  }

  const prevVideo = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex - 1 + videos.length) % videos.length)
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg cursor-pointer"
            onClick={() => openModal(index)}
          >
            <div className="aspect-video relative">
              <Image
                src={video.thumbnail}
                alt={video.title}
                layout="fill"
                objectFit="cover"
              />
            </div>
            <div className="p-4">
              <p className="text-gray-600">{video.title}</p>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-[93.75rem] flex flex-col mx-auto overflow-hidden">
            <div className="relative aspect-video">
              <YouTubeVideo
                videoId={videos[currentVideoIndex].videoId}
                title={videos[currentVideoIndex].title}
                autoplay={true}
                width="100%"
                height="100%"
              />
              <button
                className="absolute top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-3 z-10 shadow-md transition-all duration-300 left-4"
                onClick={prevVideo}
              >
                <ChevronLeft size={24} className="text-gray-800" />
              </button>
              <button
                className="absolute top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-3 z-10 shadow-md transition-all duration-300 right-4"
                onClick={nextVideo}
              >
                <ChevronRight size={24} className="text-gray-800" />
              </button>
            </div>
            <div className="p-4 flex flex-col items-center">
              <p className="text-center text-gray-600 mb-2">{videos[currentVideoIndex].title}</p>
              <button
                className="w-[100px] bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 text-sm"
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