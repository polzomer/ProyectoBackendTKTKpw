import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getActiveUser, setActiveUser } from "../utils/storage";
import { loginUser } from "../utils/api";
import "./Login.css";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (getActiveUser()) navigate("/");
  }, [navigate]);

  useEffect(() => {
    const blocked = localStorage.getItem("pw_block_until");
    if (blocked) {
      const time = parseInt(blocked);
      if (Date.now() < time) {
        setBlockedUntil(time);
      } else {
        localStorage.removeItem("pw_block_until");
      }
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (blockedUntil && Date.now() < blockedUntil) {
      const remaining = Math.ceil((blockedUntil - Date.now()) / 1000);
      setError(`Cuenta bloqueada. Intenta nuevamente en ${remaining}s`);
      return;
    }

    let user: any = null;
    try {
      const dbUser = await loginUser(identifier.trim(), password);
      user = {
        id: String(dbUser.id),
        name: dbUser.nombre,
        username: dbUser.username || undefined,
        email: dbUser.email || undefined,
        phone: dbUser.telefono || undefined,
        dob: dbUser.fecha_nacimiento || undefined,
        coins: dbUser.monedas || 0,
        points: dbUser.puntos || 0,
        nivel_actual: dbUser.nivel_actual || undefined,
        likedVideos: [],
        streamerHours: dbUser.horas_streamer || 0,
        customGifts: [],
        viewerLevelConfig: [],
        following: [],
      };
    } catch (e) {
      user = null;
    }

    if (!user) {
      const attempts = parseInt(localStorage.getItem("pw_login_attempts") || "0") + 1;
      localStorage.setItem("pw_login_attempts", attempts.toString());

      if (attempts >= 3) {
        const blockTime = Date.now() + 30 * 1000;
        localStorage.setItem("pw_block_until", blockTime.toString());
        setBlockedUntil(blockTime);
        localStorage.removeItem("pw_login_attempts");
        setError("Demasiados intentos fallidos. Cuenta bloqueada por 30s.");
      } else {
        setError(`Credenciales inválidas. Quedan ${3 - attempts} intentos.`);
      }
      return;
    }

    localStorage.removeItem("pw_login_attempts");
    localStorage.removeItem("pw_block_until");
    setBlockedUntil(null);

    if (remember) {
      setActiveUser(user);
    } else {
      sessionStorage.setItem("pw_active_user", JSON.stringify(user));
    }

    window.dispatchEvent(new CustomEvent("userChanged"));
    navigate("/");
  };


  const getRemainingBlockTime = () => {
    if (!blockedUntil) return 0;
    const remaining = Math.max(0, Math.ceil((blockedUntil - Date.now()) / 1000));
    if (remaining === 0) {
      setBlockedUntil(null);
    }
    return remaining;
  };

  return (
    <div className="login-container">
      <form onSubmit={onSubmit} className="login-form">
        <h2>Iniciar sesión</h2>

        <label>Correo o usuario</label>
        <input
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Ingrese usuario o correo"
          disabled={!!blockedUntil}
        />

        <label>Contraseña</label>
        <div className="password-wrapper">
          <input
            required
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingrese contraseña"
            disabled={!!blockedUntil}
          />
          <span className="password-toggle-icon" onClick={() => setShowPass(!showPass)}>
            {showPass ? "🙈" : "👁️"}
          </span>
        </div>

        <div className="form-options">
          <label className="remember-me">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Recordar sesión
          </label>
          <span 
            className="forgot-password-link" 
            onClick={() => navigate('/forgot-password')}
          >
            ¿Olvidaste tu contraseña?
          </span>
        </div>

        <button type="submit" className="submit-button" disabled={!!blockedUntil}>
          Entrar
        </button>

        {blockedUntil && getRemainingBlockTime() > 0 && (
          <div className="error-message orange">
            Espera {getRemainingBlockTime()} segundos para volver a intentar.
          </div>
        )}
        {error && <div className="error-message">{error}</div>}

        <p className="register-link">
          ¿No tienes cuenta?{" "}
          <span onClick={() => navigate("/register")}>
            Registrarse
          </span>
        </p>

        <button type="button" className="back-to-home-button" onClick={() => navigate("/")}>
          Volver a la página principal
        </button>
      </form>
    </div>
  );
}
