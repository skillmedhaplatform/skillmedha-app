export const metadata = {
  title: 'SkillMedha | Unified Login',
  description: 'Single sign-on for all SkillMedha portals',
}

export default function LoginLayout({ children }) {
  return (
    <div className="font-sans antialiased min-h-screen">
      {children}
    </div>
  )
}
