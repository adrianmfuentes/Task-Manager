import React from 'react';
import { useTranslation } from 'react-i18next';
import { Menu } from 'antd';
import '../Css/LanguageSelector.css'; 

const LanguageSelector = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng).catch((error) => console.error("Error changing language:", error));
    };

    return (
        <Menu className="language-selector">
            <Menu.Item onClick={() => changeLanguage('en')}> English </Menu.Item>
            <Menu.Item onClick={() => changeLanguage('es')}> Español </Menu.Item>
            <Menu.Item onClick={() => changeLanguage('fr')}> Français </Menu.Item>
            <Menu.Item onClick={() => changeLanguage('de')}> Deutsch </Menu.Item>
            <Menu.Item onClick={() => changeLanguage('it')}> Italiano </Menu.Item>
            <Menu.Item onClick={() => changeLanguage('pl')}> Polski </Menu.Item>
            <Menu.Item onClick={() => changeLanguage('ru')}> Русский (Russian) </Menu.Item>
            <Menu.Item onClick={() => changeLanguage('zh')}> 中文 (Chinese) </Menu.Item>
            <Menu.Item onClick={() => changeLanguage('hi')}> हिन्दी (Indian) </Menu.Item>
            <Menu.Item onClick={() => changeLanguage('ar')} >العربية  (Arabic) </Menu.Item>
            <Menu.Item onClick={() => changeLanguage('kg')}> Kikongo </Menu.Item>
        </Menu>
    );
};

export default LanguageSelector;
