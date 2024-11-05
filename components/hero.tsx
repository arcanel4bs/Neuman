import React from 'react'
import heroImage from '@/public/hero-image.jpeg'
import Image from 'next/image'

function Hero() {
  return (
    <div>
      <Image src={heroImage} alt="Hero Image" />
    </div>
  )
}

export default Hero
