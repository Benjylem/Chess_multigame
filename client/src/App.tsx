import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { CreateGame } from "./pages/CreateGame";
import { GamePage } from "./pages/GamePage";
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

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Placeholder label="Parties en cours" />} />
          <Route path="/create-game" element={<CreateGame />} />
          <Route path="/history" element={<Placeholder label="Historique" />} />
          <Route path="/games/:id" element={<GamePage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
