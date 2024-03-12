import { Route, Routes } from 'react-router-dom'

import { Layout } from './components/Layout'
import { Nav } from './components/Nav'
import { Home } from './screens/Home'
import './style.css'

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
