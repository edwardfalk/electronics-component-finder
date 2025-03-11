import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Box, Container } from '@mui/material'
import Header from './components/Header'
import SearchPage from './pages/SearchPage'
import PartsListPage from './pages/PartsListPage'
import DatasheetsPage from './pages/DatasheetsPage'

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <Container component="main" sx={{ flex: 1, py: 4 }}>
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/parts-lists" element={<PartsListPage />} />
            <Route path="/datasheets" element={<DatasheetsPage />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  )
}

export default App 