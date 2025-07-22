import { createFileRoute } from '@tanstack/react-router'
import logo from '@/logo.svg'

export const Route = createFileRoute('/_app/')({
  component: App,
})

function App() {
  return (
    <div className="text-center">
      <div className="h-[calc(100vh-5rem)] flex flex-col items-center justify-center text-[calc(10px+2vmin)]">
        <img
          src={logo}
          className="h-[40vmin] pointer-events-none animate-[spin_20s_linear_infinite]"
          alt="logo"
        />
        <p>
          Edit <code>src/routes/index.tsx</code> and save to reload.
        </p>
        <a
          className="text-[#61dafb] hover:underline"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <a
          className="text-[#61dafb] hover:underline"
          href="https://tanstack.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn TanStack
        </a>
      </div>
    </div>
  )
}
