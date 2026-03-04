import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./pages/home/Home.tsx";
import Offres from "./pages/offres/Offres.tsx";
import Postule from "./pages/postule/Postule.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/offres" element={<Offres />} />
        <Route path="/postulees" element={<Postule />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
