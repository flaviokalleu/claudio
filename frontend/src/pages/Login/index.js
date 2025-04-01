import React, { useState, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Button, TextField, Box, Typography, Container } from "@material-ui/core";
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
    background: "linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)",
    overflow: "hidden",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    },
  },
  imageSide: {
    flex: 1,
    background: `url('https://wallpapercave.com/wp/wp12255781.jpg') no-repeat center center`,
    backgroundSize: "cover",
    height: "100%",
    position: "relative",
    "&:after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0, 0, 0, 0.3)",
    },
    [theme.breakpoints.down("sm")]: {
      height: "30vh",
    },
  },
  formSide: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(4),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2),
    },
  },
  formContainer: {
    width: "100%",
    maxWidth: "420px",
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    padding: theme.spacing(4),
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
    },
  },
  logoImg: {
    display: "block",
    margin: "0 auto 24px",
    maxWidth: "160px",
    height: "auto",
    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      background: "rgba(255, 255, 255, 0.8)",
      "&:hover fieldset": {
        borderColor: "#2196f3",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#2196f3",
      },
    },
    "& .MuiInputLabel-outlined": {
      color: "#666",
      fontWeight: 500,
    },
  },
  submitBtn: {
    marginTop: theme.spacing(3),
    background: "linear-gradient(45deg, #2196f3 30%, #42a5f5 90%)",
    color: "#fff",
    borderRadius: "10px",
    padding: "12px",
    fontWeight: 600,
    fontSize: "1rem",
    textTransform: "none",
    width: "100%",
    boxShadow: "0 4px 15px rgba(33, 150, 243, 0.4)",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
      boxShadow: "0 6px 20px rgba(33, 150, 243, 0.6)",
      transform: "translateY(-2px)",
    },
  },
  registerBtn: {
    background: "linear-gradient(45deg, #66bb6a 30%, #81c784 90%)",
    color: "#fff",
    borderRadius: "10px",
    padding: "12px",
    fontWeight: 600,
    fontSize: "1rem",
    textTransform: "none",
    width: "100%",
    marginTop: theme.spacing(1),
    boxShadow: "0 4px 15px rgba(102, 187, 106, 0.4)",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)",
      boxShadow: "0 6px 20px rgba(102, 187, 106, 0.6)",
      transform: "translateY(-2px)",
    },
  },
  forgotPassword: {
    marginTop: theme.spacing(2),
    textAlign: "center",
  },
  forgotPasswordLink: {
    color: "#2196f3",
    textDecoration: "none",
    fontWeight: 500,
    transition: "all 0.3s ease",
    "&:hover": {
      textDecoration: "underline",
      color: "#1976d2",
    },
  },
  rememberMeContainer: {
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(2),
    color: "#666",
  },
  whatsappButton: {
    position: "fixed",
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    background: "linear-gradient(45deg, #25d366 30%, #2ecc71 90%)",
    borderRadius: "50%",
    width: "64px",
    height: "64px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 6px 20px rgba(37, 211, 102, 0.4)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    zIndex: 999,
    animation: "$pulse 1.5s infinite",
    "&:hover": {
      background: "linear-gradient(45deg, #20b85a 30%, #27ae60 90%)",
      transform: "scale(1.1)",
      boxShadow: "0 8px 24px rgba(37, 211, 102, 0.6)",
    },
  },
  whatsappIcon: {
    width: "36px",
    height: "36px",
    objectFit: "contain",
    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
  },
  "@keyframes pulse": {
    "0%": {
      transform: "scale(1)",
      boxShadow: "0 6px 20px rgba(37, 211, 102, 0.4)",
    },
    "50%": {
      transform: "scale(1.05)",
      boxShadow: "0 8px 24px rgba(37, 211, 102, 0.6)",
    },
    "100%": {
      transform: "scale(1)",
      boxShadow: "0 6px 20px rgba(37, 211, 102, 0.4)",
    },
  },
}));

const Login = () => {
  const classes = useStyles();
  const { handleLogin } = useContext(AuthContext);
  const [user, setUser] = useState({ email: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

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
            {error && (
              <Typography color="error" align="center" style={{ marginBottom: "16px" }}>
                {error}
              </Typography>
            )}
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className={classes.textField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon style={{ color: "#666" }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Senha"
              variant="outlined"
              fullWidth
              margin="normal"
              type={showPassword ? "text" : "password"}
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className={classes.textField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon style={{ color: "#666" }} />
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
                    backgroundColor: user.remember ? "#2196f3" : "#ccc",
                  },
                  "& .Mui-checked": {
                    color: "#2196f3",
                  },
                  "& .Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#2196f3",
                  },
                  "& .MuiSwitch-track": {
                    backgroundColor: "#ccc",
                  },
                }}
              />
              <Typography>Lembrar de mim</Typography>
            </div>
            <div>
              <Button type="submit" variant="contained" className={classes.submitBtn}>
                Entrar
              </Button>
              <Button
                component={RouterLink}
                to="/signup"
                variant="contained"
                className={classes.registerBtn}
              >
                Cadastre-se
              </Button>
            </div>
            <div className={classes.forgotPassword}>
              <RouterLink to="/forgot-password" className={classes.forgotPasswordLink}>
                Esqueceu a senha?
              </RouterLink>
            </div>
          </form>
        </div>
        <div
          className={classes.whatsappButton}
          onClick={() => window.open("https://wa.me/556196080740")}
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