'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useScrollLock } from '../lib/useScrollLock'

interface ImageData {
  src: string
  alt: string
  caption: string
}

interface ImageCarouselProps {
  images: ImageData[]
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  useScrollLock(modalOpen)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const imagesPerPage = 3
  const totalPages = Math.ceil(images.length / imagesPerPage)

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
  }

  const openModal = (index: number) => {
    setCurrentImageIndex(index)
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

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }

  const displayedImages = images.slice(currentPage * imagesPerPage, (currentPage + 1) * imagesPerPage)

  return (
    <>
      {/* Mobile: horizontal scroll */}
      <div className="md:hidden overflow-x-auto flex gap-4 pb-2">
        {images.map((image, index) => (
          <div
            key={index}
            className="w-[75vw] shrink-0 bg-surface shadow-md rounded-lg overflow-hidden cursor-pointer"
            onClick={() => openModal(index)}
          >
            <div className="aspect-video relative">
              <Image src={image.src} alt={image.alt} layout="fill" objectFit="cover" />
            </div>
            <div className="p-4">
              <p className="text-ink-2 truncate">{image.caption}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: paginated grid with buttons */}
      <div className="hidden md:block relative px-14">
        <div className="grid grid-cols-3 gap-6">
          {displayedImages.map((image, index) => (
            <div
              key={index}
              className="bg-surface shadow-md rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg cursor-pointer"
              onClick={() => openModal(currentPage * imagesPerPage + index)}
            >
              <div className="aspect-video relative">
                <Image src={image.src} alt={image.alt} layout="fill" objectFit="cover" />
              </div>
              <div className="p-4">
                <p className="text-ink-2 truncate">{image.caption}</p>
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
            className="bg-surface p-4 rounded-lg w-full flex flex-col mx-auto overflow-hidden"
            // 16:9 picture plus the caption and Close must fit the screen: the width
            // is capped by the viewport height as well as by 93.75rem
            style={{ maxWidth: 'min(93.75rem, calc((100dvh - 13rem) * 16 / 9))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video mb-4">
              <Image
                src={images[currentImageIndex].src}
                alt={images[currentImageIndex].alt}
                layout="fill"
                objectFit="contain"
              />
              <button
                className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-surface bg-opacity-50 hover:bg-opacity-75 rounded-full p-3 transition-all duration-300"
                onClick={prevImage}
              >
                <ChevronLeft className="w-6 h-6 text-ink" />
              </button>
              <button
                className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-surface bg-opacity-50 hover:bg-opacity-75 rounded-full p-3 transition-all duration-300"
                onClick={nextImage}
              >
                <ChevronRight className="w-6 h-6 text-ink" />
              </button>
            </div>
            <p className="text-center text-ink-2 mb-4">{images[currentImageIndex].caption}</p>
            <button
              className="mx-auto w-[200px] bg-surface-3 text-ink py-2 rounded-lg hover:bg-hairline-strong"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}