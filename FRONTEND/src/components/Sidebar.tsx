import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaCompass, FaStar, FaUser, FaPlus, FaChartBar, FaUsers, FaFileContract, FaGift, FaCog } from "react-icons/fa";
import { getActiveUser } from "../utils/storage";
import "./Sidebar.css";

export default function Sidebar() {
  const [user, setUser] = useState(getActiveUser());

  useEffect(() => {
    const handleUserChange = () => { setUser(getActiveUser()); };
    window.addEventListener("userChanged", handleUserChange);
    return () => { window.removeEventListener("userChanged", handleUserChange); };
  }, []);

  return (
    <div className="sidebar d-flex flex-column p-3 vh-100">
      <h5 className="text-center mb-4">Streaming–UL</h5>
      
      <input type="text" placeholder="🔍 Buscar" className="sidebar-search form-control mb-3" />

      <NavLink to="/" className="sidebar-link"><FaHome /> Inicio</NavLink>
      <NavLink to="/explorar" className="sidebar-link"><FaCompass /> Explorar</NavLink>
      <NavLink to="/destacados" className="sidebar-link"><FaStar /> Destacados</NavLink>
      <NavLink to="/perfil" className="sidebar-link"><FaUser /> Perfil</NavLink>
      
      {user && (
        <>
          <NavLink to="/stream/setup" className="sidebar-link"><FaPlus /> Crear</NavLink>
          <NavLink to="/estadisticas" className="sidebar-link"><FaChartBar /> Estadísticas</NavLink>
          <NavLink to="/dashboard/gifts" className="sidebar-link"><FaGift /> Gestionar Regalos</NavLink>
          <NavLink to="/dashboard/community" className="sidebar-link">
            <FaCog /> Comunidad
          </NavLink>
        </>
      )}

      <div className="mt-auto pt-3 border-top">
        <NavLink to="/nosotros" className="sidebar-link"><FaUsers /> Nosotros</NavLink>
        <NavLink to="/tyc" className="sidebar-link"><FaFileContract /> TyC</NavLink>
        <p className="small mt-3 text-center text-secondary">© 2025 StreamingUL. Todos los derechos reservados.</p>
      </div>
    </div>
  );
}