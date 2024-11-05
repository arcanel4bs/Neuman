import React from 'react'
import heroImage from '@/public/hero-image.png'
import Image from 'next/image'

function Hero() {
  return (
    <div>
      <Image src={heroImage} alt="hero-image" />
    </div>
  )
}

export default Hero
