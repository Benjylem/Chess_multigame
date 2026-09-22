import { Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CreateGame } from "./pages/CreateGame";
import { MyGames } from "./pages/MyGames";
import { History } from "./pages/History";

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

        <Route
          path="/signup"
          element={<Placeholder label="Créer un compte" />}
        />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MyGames />} />

          <Route
            path="/create-game"
            element={<CreateGame />}
          />

          <Route
            path="/history"
            element={<History />}
          />

          <Route
            path="/games/:id"
            element={<Placeholder label="Partie" />}
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;