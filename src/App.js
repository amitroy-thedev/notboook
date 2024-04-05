import './App.css';
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Home from "./pages/Home"
import Favourite from './pages/Favourite';
import Account from './pages/Account';
import NotesToAdd from './pages/NotesToAdd';
import Main from './components/Main';
import NotFoundPage from './pages/NotFoundPage';
import Search from './pages/Search';
import PublicNotes from './pages/PublicNotes';

export default function App() {
  const { currentUser } = useAuth();

  const ProtectedRoute = ({ children }) => {
    return currentUser ? children : <Navigate to="/LoginPage" />;
  };
  const PublicRoute = ({ children }) => {
    return currentUser ?  <Navigate to="/Dashboard/Main" /> : children ;
  };
  
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/LoginPage" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/RegisterPage" element={<RegisterPage />} />
      <Route path="/Dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
        <Route path="main" element={<Main />}/>
        <Route path="search" element={<Search />}/>
        <Route path="notes" element={<NotesToAdd />}/>
        <Route path="favourite" element={<Favourite />}/>
        <Route path="publicnotes" element={<PublicNotes />}/>
        <Route path="account" element={<Account />}/>
      </Route>
      <Route path="*" element={<NotFoundPage/>} />
    </Routes>
  );
}
