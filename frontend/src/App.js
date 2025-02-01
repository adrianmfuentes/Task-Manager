import 'antd/dist/reset.css';
import React, { useEffect, useState, Suspense } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { Layout, Menu, notification, Dropdown, Button } from 'antd';
import { Content, Header } from 'antd/es/layout/layout';
import { MenuOutlined } from '@ant-design/icons';

import CreateUserComp from './Components/CreateUserComp';
import LoginUserComp from './Components/LoginUserComp';
import ViewTasksComp from './Components/ViewTasksComp';
import CreateProjectComp from './Components/CreateProjectComp';
import ViewProjectComp from './Components/ViewProjectsComp';
import EditProjectComp from './Components/EditProjectComp';
import EditTaskComp from './Components/EditTaskComp';
import CustomFooter from './Footer/CustomFooter';
import PrivacyPolicy from './Footer/PrivacyPolicy';
import TermsOfService from './Footer/TermsOfService';
import Contact from './Footer/Contact';
import LanguageSelector from './Components/LanguageSelector';
import { useTranslation } from 'react-i18next'; 
import { backendUrl } from './Globals';
import LandingPage from './Components/LandingPage';
import './Css/Navigation.css'; 
import './Css/Global.css';

const CreateTaskComp = React.lazy(() => import('./Components/CreateTaskComp'));

function App() {
  const { t } = useTranslation(); // Obtiene la función de traducción
  const [api, contextHolder] = notification.useNotification(); 
  const [login, setLogin] = useState(false);
  const navigate = useNavigate(); 

  useEffect(() => {
    const apiKey = localStorage.getItem("apiKey");
    if (apiKey) setLogin(true); 

    const handleBeforeUnload = async (event) => {
      if (apiKey) {
        await fetch(`${backendUrl}/user/disconnect?apiKey=${apiKey}`); 
        localStorage.removeItem("apiKey"); 
        setLogin(false); 
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []); 

  const createNotif = (type = "info", msg, placement = "top") => {
    api[type]({ message: msg, description: msg, placement }); 
  };

  const disconnect = async () => {
    const apiKey = localStorage.getItem("apiKey");
    if (apiKey) {
      await fetch(`${backendUrl}/user/disconnect?apiKey=${apiKey}`); 
      localStorage.removeItem("apiKey"); 
      setLogin(false); 
      navigate("/login"); 
    }
  };

  const menuItems = login ? [
    { key: "menuTasks", label: <Link to="/createTask">{t("Create Task")}</Link> },
    { key: "menuMyTasks", label: <Link to="/myTasks">{t("My Tasks")}</Link> },
    { key: "menuProjects", label: <Link to="/createProject">{t("Create Project")}</Link> },
    { key: "menuMyProjects", label: <Link to="/myProjects">{t("My Projects")}</Link> },
    { key: "menuDisconnect", label: <Link to="#" onClick={disconnect}>{t("Log Out")}</Link> }
  ] : [
    { key: "menuRegister", label: <Link to="/register">{t("Register")}</Link> },
    { key: "menuLogin", label: <Link to="/login">{t("Login")}</Link> }
  ];

  // Menú dropdown con opción de idioma
  const menu = (
    <Menu>
      <Menu.Divider />
      {/* Submenú Idioma */}
      <Menu.SubMenu key="sub1" title={t("Language")}>
        <LanguageSelector /> {/* Componente que permite seleccionar el idioma */}
      </Menu.SubMenu>
    </Menu>
  );

  return (
    <>
      {contextHolder}
      <Layout className='layout'>
        <Header className="navigation-header"> {/* Aplica clase CSS a Header */}
          <div className="navigation-menu"> {/* Contenedor de menú */}
            <Dropdown overlay={menu} trigger={['click']} placement="bottomLeft">
              <Button icon={<MenuOutlined />} />
            </Dropdown>
            <Menu mode='horizontal' theme='dark' style={{ flex: 1 }}>
              {menuItems.map(item => (
                <Menu.Item key={item.key}>
                  {item.label}
                </Menu.Item>
              ))}
            </Menu>
          </div>
        </Header>

        <Content className="content-background">
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<LandingPage />} /> 
              <Route path="/register" element={<CreateUserComp createNotification={createNotif} />} />
              <Route path="/login" element={<LoginUserComp setLogin={setLogin} createNotification={createNotif} />} />
              <Route path="/myTasks" element={<ViewTasksComp createNotification={createNotif} />} />
              <Route path="/myProjects" element={<ViewProjectComp createNotification={createNotif} />} />
              <Route path="/createTask" element={<CreateTaskComp createNotification={createNotif} />} />
              <Route path="/createProject" element={<CreateProjectComp createNotification={createNotif} />} />
              <Route path="/task/edit/:taskId" element={<EditTaskComp createNotification={createNotif} />} />
              <Route path="/project/edit/:projectId" element={<EditProjectComp createNotification={createNotif} />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </Suspense>
        </Content>

        <CustomFooter />  
      </Layout>
    </>
  );
}

export default React.memo(App);