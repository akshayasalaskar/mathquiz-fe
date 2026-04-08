import { Navigate, Route, Routes } from 'react-router-dom'

import { JoinPage } from './pages/JoinPage'
import { PlayPage } from './pages/PlayPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<JoinPage />} />
      <Route path="/join" element={<JoinPage />} />
      <Route path="/play" element={<PlayPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
