import { FavoritesProvider } from "./context/FavoritesContext";
import Home from "./pages/Home";

function App() {
  return (
    <FavoritesProvider>
      <div className="app-container">
        <Home />
      </div>
    </FavoritesProvider>
  );
}

export default App;