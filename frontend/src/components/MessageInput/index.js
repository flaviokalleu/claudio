import React, { useState, useEffect, useContext, useRef } from "react";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import { useMediaQuery, useTheme } from '@material-ui/core';
import { isNil } from "lodash";
import {
  CircularProgress,
  ClickAwayListener,
  IconButton,
  InputBase,
  makeStyles,
  Paper,
  Hidden,
  MenuItem,
  Tooltip,
  Fab,
  Drawer,
} from "@material-ui/core";
import {
  blue,
  green,
  grey,
} from "@material-ui/core/colors";
import {
  AttachFile,
  CheckCircleOutline,
  Clear,
  Comment,
  Create,
  Description,
  HighlightOff,
  Mic,
  Mood,
  MoreVert,
  Send,
  PermMedia,
  Person,
  Reply,
  Duo,
  Timer,
} from "@material-ui/icons";
import AddIcon from "@material-ui/icons/Add";
import BoltIcon from '@mui/icons-material/FlashOn';
import { CameraAlt } from "@material-ui/icons";
import MicRecorder from "mic-recorder-to-mp3";
import clsx from "clsx";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import RecordingTimer from "./RecordingTimer";
import useQuickMessages from "../../hooks/useQuickMessages";
import { isString, isEmpty } from "lodash";
import ContactSendModal from "../ContactSendModal";
import CameraModal from "../CameraModal";
import axios from "axios";
import ButtonModal from "../ButtonModal";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import { ForwardMessageContext } from "../../context/ForwarMessage/ForwardMessageContext";
import MessageUploadMedias from "../MessageUploadMedias";
import { EditMessageContext } from "../../context/EditingMessage/EditingMessageContext";
import ScheduleModal from "../ScheduleModal";

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    background: theme.palette.background.paper,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderTop: `1px solid ${grey[200]}`,
    padding: theme.spacing(2),
    position: "relative",
    zIndex: 1000,
    boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.05)",
    [theme.breakpoints.down("sm")]: {
      position: "sticky",
      bottom: 0,
      width: "100%",
      padding: theme.spacing(1),
    },
  },
  newMessageBox: {
    background: theme.palette.background.paper,
    width: "100%",
    display: "flex",
    padding: "12px",
    alignItems: "center",
    gap: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      padding: "8px",
      flexWrap: "wrap",
      gap: theme.spacing(0.5),
    },
  },
  messageInputWrapper: {
    padding: "10px 14px",
    background: grey[100],
    display: "flex",
    borderRadius: "20px",
    flex: 1,
    border: `1px solid ${grey[300]}`,
    transition: "border-color 0.2s",
    "&:focus-within": {
      borderColor: theme.palette.primary.main,
    },
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      marginBottom: theme.spacing(1),
    },
  },
  messageInputWrapperPrivate: {
    padding: "10px 14px",
    background: "#FFF8E1",
    display: "flex",
    borderRadius: "20px",
    flex: 1,
    border: `1px solid ${grey[300]}`,
    transition: "border-color 0.2s",
    "&:focus-within": {
      borderColor: theme.palette.warning.main,
    },
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      marginBottom: theme.spacing(1),
    },
  },
  messageInput: {
    paddingLeft: 10,
    flex: 1,
    border: "none",
    fontSize: "14px",
    color: grey[900],
    "&::placeholder": {
      color: grey[500],
    },
  },
  messageInputPrivate: {
    paddingLeft: 10,
    flex: 1,
    border: "none",
    fontSize: "14px",
    color: grey[800],
    "&::placeholder": {
      color: grey[600],
    },
  },
  sendMessageIcons: {
    color: grey[600],
    fontSize: "20px",
    "&:hover": {
      color: theme.palette.primary.main,
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: "18px",
    },
  },
  ForwardMessageIcons: {
    color: grey[600],
    fontSize: "20px",
    transform: 'scaleX(-1)',
    "&:hover": {
      color: theme.palette.primary.main,
    },
  },
  uploadInput: {
    display: "none",
  },
  viewMediaInputWrapper: {
    display: "flex",
    padding: "10px 13px",
    position: "relative",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.palette.background.paper,
    borderTop: `1px solid ${grey[200]}`,
    [theme.breakpoints.down("sm")]: {
      position: "sticky",
      bottom: 0,
      width: "100%",
    },
  },
  emojiBox: {
    position: "absolute",
    bottom: 60,
    width: 320,
    border: `1px solid ${grey[200]}`,
    borderRadius: "4px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    background: theme.palette.background.paper,
    opacity: 0,
    transform: "translateY(10px)",
    transition: "opacity 0.2s ease-in-out, transform 0.2s ease-in-out",
    "&.open": {
      opacity: 1,
      transform: "translateY(0)",
    },
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      bottom: 50,
    },
  },
  circleLoading: {
    color: green[500],
    opacity: "70%",
    position: "absolute",
    top: "20%",
    left: "50%",
    marginLeft: -12,
  },
  audioLoading: {
    color: green[500],
    opacity: "70%",
  },
  recorderWrapper: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  cancelAudioIcon: {
    color: theme.palette.error.main,
    fontSize: "20px",
  },
  sendAudioIcon: {
    color: theme.palette.success.main,
    fontSize: "20px",
  },
  replyginMsgWrapper: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    padding: "8px 12px",
    backgroundColor: grey[100],
    borderBottom: `1px solid ${grey[200]}`,
    [theme.breakpoints.down("sm")]: {
      padding: "6px 8px",
    },
  },
  replyginMsgContainer: {
    flex: 1,
    marginRight: 5,
    backgroundColor: theme.palette.background.paper,
    borderRadius: "4px",
    display: "flex",
    position: "relative",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  replyginMsgBody: {
    padding: 10,
    height: "auto",
    display: "block",
    whiteSpace: "pre-wrap",
    overflow: "hidden",
  },
  replyginContactMsgSideColor: {
    flex: "none",
    width: "4px",
    backgroundColor: theme.palette.success.main,
  },
  replyginSelfMsgSideColor: {
    flex: "none",
    width: "4px",
    backgroundColor: theme.palette.primary.main,
  },
  messageContactName: {
    display: "flex",
    color: theme.palette.primary.main,
    fontWeight: 500,
  },
  messageQuickAnswersWrapper: {
    position: "absolute",
    bottom: "50px",
    background: theme.palette.background.paper,
    border: `1px solid ${grey[200]}`,
    borderRadius: "4px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxHeight: "200px",
    overflowY: "auto",
    "& li": {
      listStyle: "none",
      "& a": {
        display: "block",
        padding: "8px",
        textOverflow: "ellipsis",
        overflow: "hidden",
        maxHeight: "30px",
        "&:hover": {
          background: theme.palette.background.paper,
          cursor: "pointer",
        },
      },
    },
    [theme.breakpoints.down("sm")]: {
      bottom: "40px",
    },
  },
}));

const MessageInput = ({ ticketId, ticketStatus, droppedFiles, contactId, ticketChannel }) => {
  const classes = useStyles();
  const theme = useTheme();
  const [mediasUpload, setMediasUpload] = useState([]);
  const isMounted = useRef(true);
  const [buttonModalOpen, setButtonModalOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [quickAnswers, setQuickAnswer] = useState([]);
  const [typeBar, setTypeBar] = useState(false);
  const inputRef = useRef();
  const [onDragEnter, setOnDragEnter] = useState(false);
  const { setReplyingMessage, replyingMessage } = useContext(ReplyMessageContext);
  const { setEditingMessage, editingMessage } = useContext(EditMessageContext);
  const { user } = useContext(AuthContext);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [signMessagePar, setSignMessagePar] = useState(false);
  const { get: getSetting } = useCompanySettings();
  const [signMessage, setSignMessage] = useState(true);
  const [privateMessage, setPrivateMessage] = useState(false);
  const [privateMessageInputVisible, setPrivateMessageInputVisible] = useState(false);
  const [senVcardModalOpen, setSenVcardModalOpen] = useState(false);
  const [showModalMedias, setShowModalMedias] = useState(false);
  const { list: listQuickMessages } = useQuickMessages();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [placeholderText, setPlaceHolderText] = useState("");
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);

  const { selectedMessages, setForwardMessageModalOpen, showSelectMessageCheckbox } = useContext(ForwardMessageContext);

  useEffect(() => {
    if (ticketStatus === "open" || ticketStatus === "group") {
      setPlaceHolderText(i18n.t("messagesInput.placeholderOpen"));
    } else {
      setPlaceHolderText(i18n.t("messagesInput.placeholderClosed"));
    }
    const maxLength = isMobile ? 20 : Infinity;
    if (isMobile && placeholderText.length > maxLength) {
      setPlaceHolderText(placeholderText.substring(0, maxLength) + "...");
    }
  }, [ticketStatus, isMobile, placeholderText]);

  useEffect(() => {
    if (droppedFiles && droppedFiles.length > 0) {
      const selectedMedias = Array.from(droppedFiles);
      setMediasUpload(selectedMedias);
      setShowModalMedias(true);
    }
  }, [droppedFiles]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    inputRef.current.focus();
    if (editingMessage) {
      setInputMessage(editingMessage.body);
    }
  }, [replyingMessage, editingMessage]);

  useEffect(() => {
    inputRef.current.focus();
    return () => {
      setInputMessage("");
      setShowEmoji(false);
      setMediasUpload([]);
      setReplyingMessage(null);
      setPrivateMessage(false);
      setPrivateMessageInputVisible(false);
      setEditingMessage(null);
    };
  }, [ticketId, setReplyingMessage, setEditingMessage]);

  useEffect(() => {
    setTimeout(() => {
      if (isMounted.current) setOnDragEnter(false);
    }, 1000);
  }, [onDragEnter]);

  useEffect(() => {
    const fetchSettings = async () => {
      const setting = await getSetting({ "column": "sendSignMessage" });
      if (isMounted.current) {
        if (setting.sendSignMessage === "enabled") {
          setSignMessagePar(true);
          const signMessageStorage = JSON.parse(localStorage.getItem("persistentSignMessage"));
          if (isNil(signMessageStorage)) {
            setSignMessage(true);
          } else {
            setSignMessage(signMessageStorage);
          }
        } else {
          setSignMessagePar(false);
        }
      }
    };
    fetchSettings();
  }, []);

  const handleSendLinkVideo = async () => {
    const link = `https://meet.jit.si/${ticketId}`;
    setInputMessage(link);
  };

  const handleChangeInput = (e) => {
    setInputMessage(e.target.value);
  };

  const handlePrivateMessage = () => {
    setPrivateMessage(!privateMessage);
    setPrivateMessageInputVisible(!privateMessageInputVisible);
  };

  const handleButtonModalOpen = () => {
    setButtonModalOpen(true);
  };

  const handleQuickAnswersClick = async (value) => {
    if (value.mediaPath) {
      try {
        const { data } = await axios.get(value.mediaPath, { responseType: "blob" });
        handleUploadQuickMessageMedia(data, value.value);
        setInputMessage("");
        return;
      } catch (err) {
        toastError(err);
      }
    }
    setInputMessage(value.value);
    setTypeBar(false);
  };

  const handleAddEmoji = (e) => {
    setInputMessage((prevState) => prevState + e.native);
  };

  const [modalCameraOpen, setModalCameraOpen] = useState(false);

  const handleCapture = (imageData) => {
    if (imageData) {
      handleUploadCamera(imageData);
    }
  };

  const handleChangeMedias = (e) => {
    if (!e.target.files) return;
    const selectedMedias = Array.from(e.target.files);
    setMediasUpload(selectedMedias);
    setShowModalMedias(true);
  };

  const handleChangeSign = () => {
    const signMessageStorage = JSON.parse(localStorage.getItem("persistentSignMessage"));
    if (signMessageStorage !== null) {
      if (signMessageStorage) {
        localStorage.setItem("persistentSignMessage", false);
        setSignMessage(false);
      } else {
        localStorage.setItem("persistentSignMessage", true);
        setSignMessage(true);
      }
    } else {
      localStorage.setItem("persistentSignMessage", false);
      setSignMessage(false);
    }
  };

  const handleOpenModalForward = () => {
    if (selectedMessages.length === 0) {
      setForwardMessageModalOpen(false);
      toastError(i18n.t("messagesList.header.notMessage"));
      return;
    }
    setForwardMessageModalOpen(true);
  };

  const handleInputPaste = (e) => {
    if (e.clipboardData.files[0]) {
      const selectedMedias = Array.from(e.clipboardData.files);
      setMediasUpload(selectedMedias);
      setShowModalMedias(true);
    }
  };

  const handleInputDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) {
      const selectedMedias = Array.from(e.dataTransfer.files);
      setMediasUpload(selectedMedias);
      setShowModalMedias(true);
    }
  };

  const handleUploadMedia = async (mediasUpload) => {
    setLoading(true);
    if (!mediasUpload.length) {
      setLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append("fromMe", true);
    formData.append("isPrivate", privateMessage ? "true" : "false");
    mediasUpload.forEach((media) => {
      formData.append("body", media.caption);
      formData.append("medias", media.file);
    });
    try {
      await api.post(`/messages/${ticketId}`, formData);
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
    setMediasUpload([]);
    setShowModalMedias(false);
    setPrivateMessage(false);
    setPrivateMessageInputVisible(false);
  };

  const handleSendContatcMessage = async (vcard) => {
    setSenVcardModalOpen(false);
    setLoading(true);
    if (isNil(vcard)) {
      setLoading(false);
      return;
    }
    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: "",
      body: null,
      quotedMsg: replyingMessage,
      isPrivate: privateMessage ? "true" : "false",
      vCard: vcard,
    };
    try {
      await api.post(`/messages/${ticketId}`, message);
    } catch (err) {
      toastError(err);
    }
    setInputMessage("");
    setShowEmoji(false);
    setLoading(false);
    setReplyingMessage(null);
    setEditingMessage(null);
    setPrivateMessage(false);
    setPrivateMessageInputVisible(false);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;
    setLoading(true);
    const userName = privateMessage ? `${user.name} - Mensagem Privada` : user.name;
    const sendMessage = inputMessage.trim();
    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: "",
      body: (signMessage || privateMessage) && !editingMessage
        ? `*${userName}:*\n${sendMessage}`
        : sendMessage,
      quotedMsg: replyingMessage,
      isPrivate: privateMessage ? "true" : "false",
    };
    try {
      if (editingMessage !== null) {
        await api.post(`/messages/edit/${editingMessage.id}`, message);
      } else {
        await api.post(`/messages/${ticketId}`, message);
      }
    } catch (err) {
      toastError(err);
    }
    setInputMessage("");
    setShowEmoji(false);
    setLoading(false);
    setReplyingMessage(null);
    setPrivateMessage(false);
    setEditingMessage(null);
    setPrivateMessageInputVisible(false);
  };

  const handleStartRecording = async () => {
    setLoading(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await Mp3Recorder.start();
      setRecording(true);
      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const messages = await listQuickMessages({ companyId, userId: user.id });
      const options = messages.map((m) => {
        let truncatedMessage = m.message;
        if (isString(truncatedMessage) && truncatedMessage.length > 90) {
          truncatedMessage = m.message.substring(0, 90) + "...";
        }
        return {
          value: m.message,
          label: `/${m.shortcode} - ${truncatedMessage}`,
          mediaPath: m.mediaPath,
        };
      });
      if (isMounted.current) {
        setQuickAnswer(options);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (isString(inputMessage) && !isEmpty(inputMessage) && inputMessage.length >= 1) {
      const firstWord = inputMessage.charAt(0);
      if (firstWord === "/") {
        setTypeBar(firstWord.indexOf("/") > -1);
        const filteredOptions = quickAnswers.filter(
          (m) => m.label.toLowerCase().indexOf(inputMessage.toLowerCase()) > -1
        );
        setTypeBar(filteredOptions);
      } else {
        setTypeBar(false);
      }
    } else {
      setTypeBar(false);
    }
  }, [inputMessage, quickAnswers]);

  const disableOption = () => {
    return (
      loading ||
      recording ||
      (ticketStatus !== "open" && ticketStatus !== "group")
    );
  };

  const handleUploadCamera = async (blob) => {
    setLoading(true);
    try {
      const formData = new FormData();
      const filename = `${new Date().getTime()}.png`;
      formData.append("medias", blob, filename);
      formData.append("body", privateMessage ? `\u200d` : "");
      formData.append("fromMe", true);
      await api.post(`/messages/${ticketId}`, formData);
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
  };

  const handleUploadQuickMessageMedia = async (blob, message) => {
    setLoading(true);
    try {
      const extension = blob.type.split("/")[1];
      const formData = new FormData();
      const filename = `${new Date().getTime()}.${extension}`;
      formData.append("medias", blob, filename);
      formData.append("body", privateMessage ? `\u200d${message}` : message);
      formData.append("fromMe", true);
      if (isMounted.current) {
        await api.post(`/messages/${ticketId}`, formData);
      }
    } catch (err) {
      toastError(err);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const handleUploadAudio = async () => {
    setLoading(true);
    try {
      const [, blob] = await Mp3Recorder.stop().getMp3();
      if (blob.size < 10000) {
        setLoading(false);
        setRecording(false);
        return;
      }
      const formData = new FormData();
      const filename = ticketChannel === "whatsapp" ? `${new Date().getTime()}.mp3` : `${new Date().getTime()}.m4a`;
      formData.append("medias", blob, filename);
      formData.append("body", filename);
      formData.append("fromMe", true);
      if (isMounted.current) {
        await api.post(`/messages/${ticketId}`, formData);
      }
    } catch (err) {
      toastError(err);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRecording(false);
      }
    }
  };

  const handleCloseModalMedias = () => {
    setShowModalMedias(false);
  };

  const handleCancelAudio = async () => {
    try {
      await Mp3Recorder.stop().getMp3();
      setRecording(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleSendContactModalOpen = () => {
    setSenVcardModalOpen(true);
  };

  const handleCameraModalOpen = () => {
    setModalCameraOpen(true);
  };

  const handleCancelSelection = () => {
    setMediasUpload([]);
    setShowModalMedias(false);
  };

  const renderReplyingMessage = (message) => {
    return (
      <div className={classes.replyginMsgWrapper}>
        <div className={classes.replyginMsgContainer}>
          <span
            className={clsx(classes.replyginContactMsgSideColor, {
              [classes.replyginSelfMsgSideColor]: !message.fromMe,
            })}
          ></span>
          {replyingMessage && (
            <div className={classes.replyginMsgBody}>
              {!message.fromMe && (
                <span className={classes.messageContactName}>
                  {message.contact?.name}
                </span>
              )}
              {message.body}
            </div>
          )}
        </div>
        <IconButton
          aria-label="showRecorder"
          component="span"
          disabled={disableOption()}
          onClick={() => {
            setReplyingMessage(null);
            setEditingMessage(null);
            setInputMessage("");
          }}
        >
          <Clear className={classes.sendMessageIcons} />
        </IconButton>
      </div>
    );
  };

  if (mediasUpload.length > 0) {
    return (
      <Paper
        elevation={0}
        square
        className={classes.viewMediaInputWrapper}
        onDragEnter={() => setOnDragEnter(true)}
        onDrop={(e) => handleInputDrop(e)}
      >
        {showModalMedias && (
          <MessageUploadMedias
            isOpen={showModalMedias}
            files={mediasUpload}
            onClose={handleCloseModalMedias}
            onSend={handleUploadMedia}
            onCancelSelection={handleCancelSelection}
          />
        )}
      </Paper>
    );
  } else {
    return (
      <>
        {modalCameraOpen && (
          <CameraModal
            isOpen={modalCameraOpen}
            onRequestClose={() => setModalCameraOpen(false)}
            onCapture={handleCapture}
          />
        )}
        {senVcardModalOpen && (
          <ContactSendModal
            modalOpen={senVcardModalOpen}
            onClose={(c) => handleSendContatcMessage(c)}
          />
        )}
        <Paper
          square
          elevation={0}
          className={classes.mainWrapper}
          onDragEnter={() => setOnDragEnter(true)}
          onDrop={(e) => handleInputDrop(e)}
        >
          {(replyingMessage && renderReplyingMessage(replyingMessage)) || (editingMessage && renderReplyingMessage(editingMessage))}
          <div className={classes.newMessageBox}>
            <Hidden only={["sm", "xs"]}>
              <IconButton
                aria-label="emojiPicker"
                component="span"
                disabled={disableOption()}
                onClick={(e) => setShowEmoji((prevState) => !prevState)}
              >
                <Mood className={classes.sendMessageIcons} />
              </IconButton>
              {showEmoji && (
                <div className={`${classes.emojiBox} ${showEmoji ? 'open' : ''}`}>
                  <ClickAwayListener onClickAway={() => setShowEmoji(false)}>
                    <Picker
                      perLine={16}
                      theme={"light"}
                      i18n={i18n}
                      showPreview={true}
                      showSkinTones={false}
                      onSelect={handleAddEmoji}
                    />
                  </ClickAwayListener>
                </div>
              )}
              <IconButton
                aria-label="moreOptions"
                component="span"
                onClick={() => setBottomSheetOpen(true)}
              >
                <MoreVert className={classes.sendMessageIcons} />
              </IconButton>
              <Drawer
                anchor="bottom"
                open={bottomSheetOpen}
                onClose={() => setBottomSheetOpen(false)}
                PaperProps={{
                  style: {
                    borderRadius: "16px 16px 0 0",
                    padding: theme.spacing(2),
                    backgroundColor: theme.palette.background.paper,
                  },
                }}
              >
                <div>
                  <MenuItem onClick={handleCameraModalOpen}>
                    <Fab>
                      <CameraAlt style={{ fontSize: 16 }} />
                    </Fab>
                    {i18n.t("messageInput.type.cam")}
                  </MenuItem>
                  <MenuItem onClick={handleSendContactModalOpen}>
                    <Fab>
                      <Person style={{ fontSize: 16 }} />
                    </Fab>
                    {i18n.t("messageInput.type.contact")}
                  </MenuItem>
                  <MenuItem onClick={handleSendLinkVideo}>
                    <Fab>
                      <Duo style={{ fontSize: 16 }} />
                    </Fab>
                    {i18n.t("messageInput.type.meet")}
                  </MenuItem>
                  <MenuItem>
                    <input
                      multiple
                      type="file"
                      id="upload-img-button"
                      accept="image/*, video/*, audio/* "
                      className={classes.uploadInput}
                      onChange={handleChangeMedias}
                    />
                    <label htmlFor="upload-img-button">
                      <Fab component="span">
                        <PermMedia style={{ fontSize: 16 }} />
                      </Fab>
                      {i18n.t("messageInput.type.imageVideo")}
                    </label>
                  </MenuItem>
                  <MenuItem>
                    <input
                      multiple
                      type="file"
                      id="upload-doc-button"
                      accept="application/*, text/*"
                      className={classes.uploadInput}
                      onChange={handleChangeMedias}
                    />
                    <label htmlFor="upload-doc-button">
                      <Fab component="span">
                        <Description style={{ fontSize: 16 }} />
                      </Fab>
                      Documento
                    </label>
                  </MenuItem>
                </div>
              </Drawer>
              {signMessagePar && (
                <Tooltip title={i18n.t("messageInput.tooltip.signature")}>
                  <IconButton
                    aria-label="send-upload"
                    component="span"
                    onClick={handleChangeSign}
                  >
                    {signMessage ? (
                      <Create style={{ color: theme.palette.primary.main }} />
                    ) : (
                      <Create style={{ color: grey[400] }} />
                    )}
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={i18n.t("messageInput.tooltip.privateMessage")}>
                <IconButton
                  aria-label="send-upload"
                  component="span"
                  onClick={handlePrivateMessage}
                >
                  {privateMessage ? (
                    <Comment style={{ color: theme.palette.warning.main }} />
                  ) : (
                    <Comment style={{ color: grey[400] }} />
                  )}
                </IconButton>
              </Tooltip>
            </Hidden>
            <Hidden only={["md", "lg", "xl"]}>
              <IconButton
                aria-label="moreOptions"
                component="span"
                onClick={() => setBottomSheetOpen(true)}
              >
                <MoreVert className={classes.sendMessageIcons} />
              </IconButton>
              <Drawer
                anchor="bottom"
                open={bottomSheetOpen}
                onClose={() => setBottomSheetOpen(false)}
                PaperProps={{
                  style: {
                    borderRadius: "16px 16px 0 0",
                    padding: theme.spacing(2),
                    backgroundColor: theme.palette.background.paper,
                  },
                }}
              >
                <div>
                  <MenuItem onClick={() => setShowEmoji((prevState) => !prevState)}>
                    <IconButton aria-label="emojiPicker" component="span" disabled={disableOption()}>
                      <Mood className={classes.sendMessageIcons} />
                    </IconButton>
                  </MenuItem>
                  <MenuItem>
                    <input
                      multiple
                      type="file"
                      id="upload-button"
                      disabled={disableOption()}
                      className={classes.uploadInput}
                      onChange={handleChangeMedias}
                    />
                    <label htmlFor="upload-button">
                      <IconButton aria-label="upload" component="span" disabled={disableOption()}>
                        <AttachFile className={classes.sendMessageIcons} />
                      </IconButton>
                    </label>
                  </MenuItem>
                  {signMessagePar && (
                    <Tooltip title="Habilitar/Desabilitar Assinatura">
                      <IconButton aria-label="send-upload" component="span" onClick={handleChangeSign}>
                        {signMessage ? (
                          <Create style={{ color: theme.palette.primary.main }} />
                        ) : (
                          <Create style={{ color: grey[400] }} />
                        )}
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Habilitar/Desabilitar Comentários">
                    <IconButton aria-label="send-upload" component="span" onClick={handlePrivateMessage}>
                      {privateMessage ? (
                        <Comment style={{ color: theme.palette.warning.main }} />
                      ) : (
                        <Comment style={{ color: grey[400] }} />
                      )}
                    </IconButton>
                  </Tooltip>
                </div>
              </Drawer>
            </Hidden>
            <div className={classes.messageInputWrapper}>
              <InputBase
                inputRef={inputRef}
                className={privateMessage ? classes.messageInputPrivate : classes.messageInput}
                placeholder={privateMessage ? i18n.t("messagesInput.placeholderPrivateMessage") : placeholderText}
                multiline
                maxRows={5}
                value={inputMessage}
                onChange={handleChangeInput}
                disabled={disableOption()}
                onPaste={(e) => {
                  (ticketStatus === "open" || ticketStatus === "group") && handleInputPaste(e);
                }}
                onKeyPress={(e) => {
                  if (loading || e.shiftKey) return;
                  else if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
              />
              {typeBar && (
                <ul className={classes.messageQuickAnswersWrapper}>
                  {typeBar.map((value, index) => (
                    <li className={classes.messageQuickAnswersWrapperItem} key={index}>
                      <a onClick={() => handleQuickAnswersClick(value)}>
                        {`${value.label} - ${value.value}`}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {!privateMessage && (
              <>
                <Tooltip title={i18n.t("tickets.buttons.quickmessageflash")}>
                  <IconButton
                    aria-label="flash"
                    component="span"
                    onClick={() => setInputMessage('/')}
                  >
                    <BoltIcon className={classes.sendMessageIcons} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={i18n.t("tickets.buttons.scredule")}>
                  <IconButton
                    aria-label="scheduleMessage"
                    component="span"
                    onClick={() => setAppointmentModalOpen(true)}
                    disabled={loading}
                  >
                    <Timer className={classes.sendMessageIcons} />
                  </IconButton>
                </Tooltip>
                {inputMessage || showSelectMessageCheckbox ? (
                  <IconButton
                    aria-label="sendMessage"
                    component="span"
                    onClick={showSelectMessageCheckbox ? handleOpenModalForward : handleSendMessage}
                    disabled={loading}
                  >
                    {showSelectMessageCheckbox ?
                      <Reply className={classes.ForwardMessageIcons} /> : <Send className={classes.sendMessageIcons} />}
                  </IconButton>
                ) : recording ? (
                  <div className={classes.recorderWrapper}>
                    <IconButton
                      aria-label="cancelRecording"
                      component="span"
                      disabled={loading}
                      onClick={handleCancelAudio}
                    >
                      <HighlightOff className={classes.cancelAudioIcon} />
                    </IconButton>
                    {loading ? (
                      <CircularProgress className={classes.audioLoading} />
                    ) : (
                      <RecordingTimer />
                    )}
                    <IconButton
                      aria-label="sendRecordedAudio"
                      component="span"
                      onClick={handleUploadAudio}
                      disabled={loading}
                    >
                      <CheckCircleOutline className={classes.sendAudioIcon} />
                    </IconButton>
                  </div>
                ) : (
                  <IconButton
                    aria-label="showRecorder"
                    component="span"
                    disabled={disableOption()}
                    onClick={handleStartRecording}
                  >
                    <Mic className={classes.sendMessageIcons} />
                  </IconButton>
                )}
              </>
            )}
            {privateMessage && (
              <IconButton
                aria-label="sendMessage"
                component="span"
                onClick={showSelectMessageCheckbox ? handleOpenModalForward : handleSendMessage}
                disabled={loading}
              >
                {showSelectMessageCheckbox ?
                  <Reply className={classes.ForwardMessageIcons} /> : <Send className={classes.sendMessageIcons} />}
              </IconButton>
            )}
            {appointmentModalOpen && (
              <ScheduleModal
                open={appointmentModalOpen}
                onClose={() => setAppointmentModalOpen(false)}
                message={inputMessage}
                contactId={contactId}
              />
            )}
          </div>
        </Paper>
      </>
    );
  }
};

export default MessageInput;