import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./pages/home/Home.tsx";
import Offres from "./pages/offres/Offres.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/offres" element={<Offres />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
