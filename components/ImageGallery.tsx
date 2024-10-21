'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageData {
  src: string
  alt: string
  caption: string
}

interface ImageGalleryProps {
  images: ImageData[]
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const openModal = (index: number) => {
    setCurrentImageIndex(index)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
  }

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg cursor-pointer"
            onClick={() => openModal(index)}
          >
            <div className="aspect-video relative">
              <Image
                src={image.src}
                alt={image.alt}
                layout="fill"
                objectFit="cover"
              />
            </div>
            <div className="p-4">
              <p className="text-gray-600">{image.caption}</p>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-[93.75rem] w-full flex flex-col mx-auto overflow-hidden">
            <div className="relative aspect-video mb-4">
              <Image
                src={images[currentImageIndex].src}
                alt={images[currentImageIndex].alt}
                layout="fill"
                objectFit="contain"
              />
              <button
                className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-3 transition-all duration-300"
                onClick={prevImage}
              >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </button>
              <button
                className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-3 transition-all duration-300"
                onClick={nextImage}
              >
                <ChevronRight className="w-6 h-6 text-gray-800" />
              </button>
            </div>
            <p className="text-center text-gray-600 mb-4">{images[currentImageIndex].caption}</p>
            <button
              className="mx-auto w-[200px] bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
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