import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Assess from './pages/Assess'
import Results from './pages/Results'
import About from './pages/About'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="assess" element={<Assess />} />
        <Route path="results" element={<Results />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  )
}
