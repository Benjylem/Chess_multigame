import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { ProtectedRoute } from './components/ProtectedRoute'

// Placeholders temporaires : les vraies pages (Lot 1 = auth, Lot 2 = lobby/historique,
// Lot 3 = plateau) seront ajoutées dans src/pages/ sur leurs branches respectives et
// remplaceront ces éléments inline.
function Placeholder({ label }: { label: string }) {
  return <p>{label} (TODO)</p>
}

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Placeholder label="Connexion" />} />
        <Route path="/signup" element={<Placeholder label="Créer un compte" />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Placeholder label="Parties en cours" />} />
          <Route path="/history" element={<Placeholder label="Historique" />} />
          <Route path="/games/:id" element={<Placeholder label="Partie" />} />
        </Route>
      </Routes>
    </>
  )
}

export default App