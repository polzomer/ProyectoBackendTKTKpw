import { useNavigate } from 'react-router-dom';
import './TyC.css';

export default function TyC() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="tyc-page">
      <div className="tyc-header">
        <h2 className="tyc-title">Términos y Condiciones</h2>
        <p className="tyc-subtitle">
          Al usar Streaming-UL, aceptas nuestras políticas. Última actualización: 15 de julio de 2024.
        </p>
      </div>

      <div className="tyc-image-wrapper">
        <img 
          src="https://picsum.photos/seed/terms/1200/400" 
          alt="Banner de Términos y Condiciones" 
        />
      </div>

      <div className="tyc-content">
        <h4>1. Aceptación de los Términos</h4>
        <p>
          Este es un texto de ejemplo. Al acceder o utilizar nuestro servicio, confirmas que has leído, entendido y aceptado estar sujeto a estos Términos. Si no estás de acuerdo con estos términos, no debes utilizar el servicio.
        </p>

        <h4>2. Cuentas de Usuario</h4>
        <p>
          Para acceder a ciertas funciones, debes registrarte y crear una cuenta. Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran en tu cuenta. Debes notificarnos inmediatamente sobre cualquier uso no autorizado.
        </p>

        <h4>3. Contenido y Conducta</h4>
        <p>
          No está permitido publicar contenido que sea ilegal, difamatorio, obsceno o que infrinja los derechos de propiedad intelectual de terceros. Nos reservamos el derecho de eliminar cualquier contenido y suspender cuentas que violen estas políticas sin previo aviso.
        </p>
        
      </div>

      <div className="tyc-footer">
        <button onClick={handleGoBack} className="back-button">
          ‹ Regresar a Inicio
        </button>
      </div>
    </div>
  );
}