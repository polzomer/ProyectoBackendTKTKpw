import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { findUserByUsername, setActiveUser } from "../utils/storage";
import { registerUser } from "../utils/api";
import { passwordMeetsRules, usernameAllowed, isNameValid } from "../utils/validators";
import "./Login.css";

type UsernameStatus = 'idle' | 'available' | 'taken' | 'invalid';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [dob, setDob] = useState("");
  const [usePhone, setUsePhone] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [sentCode, setSentCode] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [errors, setErrors] = useState<string | null>(null);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const baseUsername = username.trim().slice(0, 15).toLowerCase();
    if (showSuggestions && baseUsername.length >= 4) {
      const potentialSuggestions = [
        `${baseUsername}${Math.floor(Math.random() * 90) + 10}`,
        `${baseUsername}_pro`,
        `${baseUsername}123`
      ];
      const suggestions = potentialSuggestions
        .filter(sugg => sugg.length <= 20 && !findUserByUsername(sugg));
      setUsernameSuggestions(suggestions);
    } else {
      setUsernameSuggestions([]);
    }
  }, [username, showSuggestions]);

  const handleUsernameBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      if (username.trim() === '') {
        setUsernameStatus('idle');
        return;
      }
      if (!usernameAllowed(username)) {
        setUsernameStatus('invalid');
        return;
      }
      if (findUserByUsername(username)) {
        setUsernameStatus('taken');
      } else {
        setUsernameStatus('available');
      }
    }, 150);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setUsername(suggestion);
    setUsernameStatus('available');
    setShowSuggestions(false);
  };

  const isOldEnough = () => {
    if (!dob) return false;
    const birth = new Date(dob);
    const age = (Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return age >= 13;
  };

  const sendCode = () => {
    if (!dob) { setErrors("Selecciona tu fecha de nacimiento"); return; }
    if (!isOldEnough()) { setErrors("Debes tener al menos 13 años para registrarte"); return; }
    if (!usePhone && !email) { setErrors("Ingresa un correo electrónico"); return; }
    if (usePhone && !phone) { setErrors("Ingresa un número de teléfono"); return; }
    setErrors(null);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(code);
    alert(`Código simulado: ${code} (en una app real se enviaría por SMS o email)`);
    setStep(2);
  };

  const verifyCode = () => {
    if (!sentCode) return;
    if (codeInput.trim() === sentCode) {
      setStep(3);
      setErrors(null);
    } else {
      setErrors("Código incorrecto");
    }
  };

  const finishRegister = async () => {
    setErrors(null);
    if (!name.trim() || !isNameValid(name.trim())) { setErrors("El nombre completo solo debe contener letras."); return; }
    if (usernameStatus !== 'available') {
      setErrors("El nombre de usuario no está disponible o es inválido.");
      return;
    }
    const pwRules = passwordMeetsRules(password);
    if (!pwRules.ok) { setErrors("La contraseña no cumple los requisitos (8+ caracteres, mayúscula, minúscula y número)."); return; }
    if (password !== password2) { setErrors("Las contraseñas no coinciden."); return; }
    try {
      const dbUser = await registerUser({ nombre: name.trim(), username: username.trim(), email: email.trim() || undefined, telefono: phone.trim() || undefined, fecha_nacimiento: dob, password });
      const mapped = {
        id: String(dbUser.id),
        name: dbUser.nombre,
        username: dbUser.username || undefined,
        email: dbUser.email || undefined,
        phone: dbUser.telefono || undefined,
        dob: dbUser.fecha_nacimiento || undefined,
        coins: dbUser.monedas || 0,
        points: dbUser.puntos || 0,
        likedVideos: [],
        streamerHours: dbUser.horas_streamer || 0,
        customGifts: [],
        viewerLevelConfig: [],
        following: [],
      } as any;
      setActiveUser(mapped);
    } catch (e: any) {
      setErrors(e?.message || 'No se pudo registrar el usuario');
      return;
    }
    window.dispatchEvent(new CustomEvent("userChanged"));
    navigate("/");
  };

  return (
    <div className="login-container">
      <div className="login-form" style={{ width: 420 }}>
        <h2>Registrarse</h2>

        {step === 1 && (
          <>
            <p>¿Cuál es tu fecha de nacimiento?</p>
            <input type="date" value={dob} onChange={e => setDob(e.target.value)} max={new Date().toISOString().split("T")[0]} required />
            <p style={{ marginTop: 12 }}>Método de registro</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button type="button" onClick={() => setUsePhone(false)} style={{ flex: 1, background: !usePhone ? "#ff0050" : "#333", color: "#fff", padding: 8 }}>Correo</button>
              <button type="button" onClick={() => setUsePhone(true)} style={{ flex: 1, background: usePhone ? "#ff0050" : "#333", color: "#fff", padding: 8 }}>Teléfono</button>
            </div>
            {!usePhone ? (
              <input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} />
            ) : (
              <input type="tel" placeholder="Teléfono (ej: +51 9xxxxxxx)" value={phone} onChange={e => setPhone(e.target.value)} />
            )}
            <button style={{ marginTop: 12 }} onClick={sendCode}>Enviar código</button>
            <p style={{ fontSize: 12, opacity: 0.8 }}>Se enviará un código de 6 dígitos (simulado)</p>
          </>
        )}

        {step === 2 && (
          <>
            <p>Ingresa el código de 6 dígitos que recibiste</p>
            <input placeholder="Código" value={codeInput} onChange={e => setCodeInput(e.target.value)} />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={verifyCode}>Verificar</button>
              <button onClick={() => { setStep(1); setSentCode(null); }}>Reenviar</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <label>Nombre completo</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" />
            
            <label>Nombre de usuario</label>
            <div className="input-with-validation">
              <input 
                value={username} 
                onChange={e => { setUsername(e.target.value); setUsernameStatus('idle'); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={handleUsernameBlur}
                placeholder="usuario_unico (máx. 20 caracteres)"
                maxLength={20}
              />
              <span className="validation-icon">
                {usernameStatus === 'available' && '✅'}
                {usernameStatus === 'taken' && '❌'}
                {usernameStatus === 'invalid' && '❌'}
              </span>
            </div>

            {showSuggestions && usernameStatus !== 'available' && usernameSuggestions.length > 0 && (
              <div className="suggestions-container">
                Sugerencias:
                {usernameSuggestions.map(sugg => (
                  <span key={sugg} onMouseDown={() => handleSuggestionClick(sugg)} className="suggestion-chip">
                    {sugg}
                  </span>
                ))}
              </div>
            )}
            
            <label>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" />
            <label>Repite la contraseña</label>
            <input type="password" value={password2} onChange={e => setPassword2(e.target.value)} placeholder="Repite la contraseña" />
            
            <button 
              style={{ marginTop: 12 }} 
              onClick={finishRegister}
              disabled={usernameStatus !== 'available'}
            >
              Crear cuenta
            </button>
          </>
        )}
        
        {errors && <div className="error-message" style={{ marginTop: 10 }}>{errors}</div>}
        <p style={{ marginTop: 12 }}>
          ¿Ya tienes cuenta?{" "}
          <span style={{ color: "#ff0050", cursor: "pointer" }} onClick={() => navigate("/login")}>
            Iniciar sesión
          </span>
        </p>
      </div>
    </div>
  );
}
