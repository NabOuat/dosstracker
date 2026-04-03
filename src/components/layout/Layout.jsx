import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <Navbar />
      {/* Offset pour la navbar fixe */}
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  )
}
