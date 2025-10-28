import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./features/auth";
import AppRoutes from "./routes";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;