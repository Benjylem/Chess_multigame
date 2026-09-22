import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { TestPlateau } from "./dev/TestPlateau";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { CreateGame } from "./pages/CreateGame";
import "./App.css";

function Placeholder({ label }: { label: string }) {
  return <p>{label} (TODO)</p>;
}

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Route de dev temporaire, a retirer une fois GamePage pret (voir src/dev/) */}
        <Route path="/test-echecs" element={<TestPlateau />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Placeholder label="Parties en cours" />} />
          <Route path="/create-game" element={<CreateGame />} />
          <Route path="/history" element={<Placeholder label="Historique" />} />
          <Route path="/games/:id" element={<Placeholder label="Partie" />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
