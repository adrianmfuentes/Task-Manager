import React from 'react';
import { Button, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../Css/LandingPage.css'; 

const { Title, Text } = Typography;

const LandingPage = () => {
  const { t } = useTranslation(); // Usa el hook para obtener la función de traducción

  return (
    <div className="landing-page-container">
      <div className="landing-page-content">
        <Title className="landing-title">{t("Welcome to TaskMaster!")}</Title>
        <Text className="landing-text">
          {t("Simplify project and task management with TaskMaster.")}<br />
          {t("Create your account or log in now to start organizing your life efficiently and productively.")}
        </Text>
        <br /><br />

        {/* Contenedor de botones */}
        <div className="landing-buttons">
          {/* Botón de registro */}
          <Link to="/register">
            <Button 
              type="primary" 
              size="large" 
              className="landing-button" // Clase para botones responsivos
            >
              {t("Register")}
            </Button>
          </Link>

          {/* Botón de inicio de sesión */}
          <Link to="/login">
            <Button 
              type="default" 
              size="large" 
              className="landing-button" // Clase para botones responsivos
            >
              {t("Login")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
