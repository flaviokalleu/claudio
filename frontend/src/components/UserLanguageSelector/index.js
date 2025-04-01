import React, { useContext, useState } from "react";
import { Button, Menu, MenuItem, Typography } from "@material-ui/core";
import { Languages, ChevronDown } from "lucide-react";

import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const UserLanguageSelector = () => {
  const [langueMenuAnchorEl, setLangueMenuAnchorEl] = useState(null);
  const { user } = useContext(AuthContext);

  const languages = [
    { code: "pt-BR", label: "Português (BR)" },
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    
  ];

  const handleOpenLanguageMenu = (e) => {
    setLangueMenuAnchorEl(e.currentTarget);
  };

  const handleCloseLanguageMenu = () => {
    setLangueMenuAnchorEl(null);
  };

  const handleChangeLanguage = async (language) => {
    try {
      await i18n.changeLanguage(language);
      await api.put(`/users/${user.id}`, { language });
    } catch (err) {
      toastError(err);
    }
    handleCloseLanguageMenu();
  };

  const currentLanguageLabel = languages.find(
    (lang) => lang.code === user.language
  )?.label || "Select Language";

  return (
    <div className="relative">
      <Button
        onClick={handleOpenLanguageMenu}
        className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-gray-800 hover:bg-gray-200 transition-all duration-300"
      >
        <Languages className="w-5 h-5 text-gray-600" />
        <Typography
          variant="body2"
          className="font-semibold text-white capitalize"
        >
          {currentLanguageLabel}
        </Typography>
        <ChevronDown className="w-4 h-4 text-white" />
      </Button>

      <Menu
        anchorEl={langueMenuAnchorEl}
        keepMounted
        open={Boolean(langueMenuAnchorEl)}
        onClose={handleCloseLanguageMenu}
        PaperProps={{
          className:
            "mt-2 rounded-lg shadow-lg border border-gray-100 bg-white",
        }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleChangeLanguage(lang.code)}
            selected={user.language === lang.code}
            className={`px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 ${
              user.language === lang.code ? "bg-blue-50 text-white" : ""
            }`}
          >
            {lang.label}
          </MenuItem>
        ))}
        <hr className="my-1 border-gray-200" />
        
      </Menu>
    </div>
  );
};

export default UserLanguageSelector;