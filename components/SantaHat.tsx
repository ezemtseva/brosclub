import Image from 'next/image'

interface SantaHatProps {
  className?: string
}

export function SantaHat({ className = '' }: SantaHatProps) {
  return (
    <div className={`absolute -top-6 -left-2 ${className}`}>
      <Image
        src="/imgs/santa-hat.png"
        alt=""
        width={40}
        height={40}
        className="transform -rotate-12"
      />
    </div>
  )
}

