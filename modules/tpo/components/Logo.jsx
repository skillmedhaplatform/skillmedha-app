import React from 'react'
import logo from '@/public/tpo/logo.svg'
import logotext from '@/public/tpo/skill_medha.svg'
import Image from 'next/image'
import logoStyle from './styles/logo.module.scss'

const Logo = () => {
  return (
    <>
        <div className={logoStyle.logo}>
            <Image src={logo} alt="Skillmedha Logo" />
            <Image src={logotext} alt="Skillmedha" style={{ filter: "brightness(0) invert(1)" }} />
        </div>
    </>
  )
}

export default Logo
