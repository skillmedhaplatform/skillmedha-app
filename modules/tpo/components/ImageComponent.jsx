import Image from 'next/image'
import React from 'react'
import profile from '@/public/tpo/profilrImage.svg'
import profiles from './styles/profileImage.module.scss'

const ImageComponent = () => {
  return (
    <div className={profiles.image}>
        <Image src={profile} height={90} width={90} alt="Profile Image"/>
    </div>
  )
}

export default ImageComponent