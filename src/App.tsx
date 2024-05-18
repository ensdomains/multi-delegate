import { Route, Routes } from 'react-router-dom'

import { Layout } from './components/Layout'
import { Nav } from './components/Nav'
import { Home } from './screens/Home'
import { Manage } from './screens/Manage'
import { Strategy } from './screens/Strategy'
import './style.css'

function App() {
  return (
    <Layout>
      <Nav />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/strategy" element={<Strategy />} />
          <Route path="/manage" element={<Manage />} />
        </Routes>
      </main>
    </Layout>
  )
}

export default App
