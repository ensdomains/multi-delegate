import { Route, Routes, useLocation } from 'react-router-dom'

import { Layout } from './components/Layout'
import { Nav } from './components/Nav'
import { Home } from './screens/Home'
import { Manage } from './screens/Manage'
import { SharedStrategy } from './screens/SharedStrategy'
import { Strategy } from './screens/Strategy'
import './style.css'

function App() {
  const pathname = useLocation().pathname

  return (
    <Layout pathname={pathname}>
      <Nav />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/strategy" element={<Strategy />} />
          <Route path="/strategy/:addressOrName" element={<SharedStrategy />} />
          <Route path="/manage" element={<Manage />} />
        </Routes>
      </main>

      <footer />
    </Layout>
  )
}

export default App
