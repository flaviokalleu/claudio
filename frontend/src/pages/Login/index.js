import React, { useState, useEffect, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Button, TextField, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { IconButton, InputAdornment, Switch } from "@mui/material";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import EmailIcon from "@material-ui/icons/Email";
import LockIcon from "@material-ui/icons/Lock";
import { Helmet } from "react-helmet";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    width: "100vw",
    height: "100vh",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    },
  },
  imageSide: {
    flex: 1,
    background: `url('https://siteconnect.com.br/wp-content/uploads/2025/02/capazapflow.webp') no-repeat center center`,
    backgroundSize: "cover",
    height: "100%",
  },
  formSide: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
    [theme.breakpoints.down("sm")]: {
      padding: "20px",
    },
  },
  formContainer: {
    width: "100%",
    maxWidth: "400px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
    padding: "30px",
  },
  logoImg: {
    display: "block",
    margin: "0 auto 20px",
    maxWidth: "150px",
    height: "auto",
  },
  submitBtn: {
    marginTop: "20px",
    backgroundColor: "#10aa62",
    color: "#fff",
    borderRadius: "8px",
    padding: "12px",
    fontWeight: "bold",
    width: "100%",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#10aa62",
      boxShadow: "0px 4px 12px #10aa62",
    },
  },
  registerBtn: {
    backgroundColor: "#10aa62",
    color: "#fff",
    borderRadius: "8px",
    padding: "12px",
    fontWeight: "bold",
    width: "100%",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "10px",
    "&:hover": {
      backgroundColor: "#10aa62",
      boxShadow: "0px 4px 12px #044012",
    },
  },
  forgotPassword: {
    marginTop: "15px",
    textAlign: "center",
  },
  forgotPasswordLink: {
    color: theme.palette.primary.main,
    textDecoration: "none",
    fontWeight: "500",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  rememberMeContainer: {
    display: "flex",
    alignItems: "center",
    marginTop: "10px",
  },
  whatsappButton: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    backgroundColor: "#10aa62",
    borderRadius: "50%",
    width: "60px",
    height: "60px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 4px 12px #044012",
    transition: "all 0.3s ease",
    animation: "$bounce 1s infinite",
    cursor: "pointer",
    zIndex: 999,
    "&:hover": {
      backgroundColor: "#10aa62",
      transform: "scale(1.1)",
      boxShadow: "0 8px 16px #05491c",
    },
  },
  whatsappIcon: {
    width: "64px",
    height: "64px",
    objectFit: "contain",
  },
  "@keyframes bounce": {
    "0%": {
      transform: "translateY(0)",
    },
    "50%": {
      transform: "translateY(-10px)",
    },
    "100%": {
      transform: "translateY(0)",
    },
  },
}));

const Login = () => {
  const classes = useStyles();
  const { handleLogin } = useContext(AuthContext);
  const [user, setUser] = useState({ email: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [userCreationEnabled, setUserCreationEnabled] = useState(true);

  // Determinar a URL do backend
  const backendUrl =
    process.env.REACT_APP_BACKEND_URL === "https://localhost:8090"
      ? "https://localhost:8090"
      : process.env.REACT_APP_BACKEND_URL;

  // Verificar status de userCreation ao carregar o componente
  useEffect(() => {
    const fetchUserCreationStatus = async () => {
      try {
        const response = await fetch(`${backendUrl}/settings/userCreation`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user creation status");
        }

        const data = await response.json();
        setUserCreationEnabled(data.userCreation === "enabled");
      } catch (err) {
        console.error("Erro ao verificar userCreation:", err);
        setUserCreationEnabled(false); // Esconder botão em caso de erro
      }
    };

    fetchUserCreationStatus();
  }, [backendUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(user);
  };

  return (
    <>
      <Helmet>
        <title>Login</title>
      </Helmet>

      <div className={classes.root}>
        <div className={classes.imageSide}></div>
        <div className={classes.formSide}>
          <form className={classes.formContainer} onSubmit={handleSubmit}>
            <img src="/logo.png" alt="Logo" className={classes.logoImg} />
            {error && <Typography color="error">{error}</Typography>}
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              margin="normal"
              type={showPassword ? "text" : "password"}
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <div className={classes.rememberMeContainer}>
              <Switch
                checked={user.remember}
                onChange={(e) => setUser({ ...user, remember: e.target.checked })}
                name="remember"
                sx={{
                  "& .MuiSwitch-thumb": {
                    backgroundColor: user.remember ? "#4F0F96" : "#C3C3C3",
                  },
                  "& .Mui-checked": {
                    color: "#4F0F96",
                  },
                  "& .Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#4F0F96",
                  },
                  "& .MuiSwitch-track": {
                    backgroundColor: user.remember ? "#4F0F96" : "#C3C3C3",
                  },
                }}
              />
              <Typography>Lembrar de mim</Typography>
            </div>
            <div>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.submitBtn}
              >
                Entrar
              </Button>
              {userCreationEnabled && (
                <Button
                  component={RouterLink}
                  to="/signup"
                  variant="contained"
                  className={classes.registerBtn}
                >
                  Cadastre-se
                </Button>
              )}
            </div>
            <div className={classes.forgotPassword}>
              <RouterLink
                to="/forgot-password"
                className={classes.forgotPasswordLink}
              >
                Esqueceu a senha?
              </RouterLink>
            </div>
          </form>
        </div>
        <div
          className={classes.whatsappButton}
          onClick={() => window.open("https://wa.me/5541992098329")}
        >
          <img
            src="https://i.ibb.co/1p43y88/iconzapzap.png"
            alt="WhatsApp"
            className={classes.whatsappIcon}
          />
        </div>
      </div>
    </>
  );
};

export default Login;