import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import RightSidebar from "./components/RightSidebar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Nosotros from "./pages/Nosotros";
import TyC from "./pages/TyC";
import ForgotPassword from "./pages/ForgotPassword";
import LevelsPage from "./pages/LevelsPage";
import StatsPage from "./pages/StatsPage";
import StreamSetupPage from "./pages/StreamSetupPage";
import StreamPage from "./pages/StreamPage";
import GiftManagementPage from "./pages/GiftManagementPage";
import CommunitySettingsPage from "./pages/CommunitySettingsPage";
import LiveDashboardPage from "./pages/LiveDashboardPage";
import ExplorarPage from "./pages/ExplorarPage";
import CategoryPage from "./pages/CategoryPage";
import DestacadosPage from "./pages/DestacadosPage";
import ClipPage from "./pages/ClipPage";
import ProfilePage from "./pages/ProfilePage";
import { FaBars } from "react-icons/fa";
import "./App.css";

function MainLayout() {
  const [isRightSidebarVisible, setRightSidebarVisible] = useState(true);

  const toggleRightSidebar = () => {
    setRightSidebarVisible(!isRightSidebarVisible);
  };

  return (
    <div className={`app-grid-container ${isRightSidebarVisible ? '' : 'collapsed'}`}>
      <Sidebar />
      <main className="page-content">
        <button 
          onClick={toggleRightSidebar} 
          className="sidebar-toggle-button"
          style={{ right: isRightSidebarVisible ? '300px' : '20px' }}
        >
          <FaBars />
        </button>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explorar" element={<ExplorarPage />} />
          <Route path="/destacados" element={<DestacadosPage />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/tyc" element={<TyC />} />
          <Route path="/levels" element={<LevelsPage />} />
          <Route path="/estadisticas" element={<StatsPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/stream/setup" element={<StreamSetupPage />} />
          <Route path="/stream/live" element={<LiveDashboardPage />} />
          <Route path="/stream/:streamId" element={<StreamPage />} />
          <Route path="/clip/:clipId" element={<ClipPage />} />
          <Route path="/dashboard/gifts" element={<GiftManagementPage />} />
          <Route path="/dashboard/community" element={<CommunitySettingsPage />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
        </Routes>
      </main>
      {isRightSidebarVisible && <RightSidebar />}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/*" element={<MainLayout />} />
    </Routes>
  );
}
