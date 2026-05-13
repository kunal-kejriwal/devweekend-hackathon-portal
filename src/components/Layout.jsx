import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} DevWeekend · Powered by{' '}
        <a href="https://theapiengine.com" target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
          APIEngine
        </a>
      </footer>
    </div>
  )
}
