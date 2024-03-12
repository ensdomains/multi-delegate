import { Route, Routes } from 'react-router-dom'

import './style.css'
import { Home } from './screens/Home'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  )
}

export default App
