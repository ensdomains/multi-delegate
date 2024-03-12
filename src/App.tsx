import { Route, Routes } from 'react-router-dom'

import './style.css'
import { Home } from './screens/Home'
import { Layout } from './components/Layout'
import { Nav } from './components/Nav'

function App() {
  return (
    <Layout>
      <Nav />

      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Layout>
  )
}

export default App
