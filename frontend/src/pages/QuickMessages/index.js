import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  InputAdornment,
  Grid,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import AddIcon from "@material-ui/icons/Add";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import QuickMessageDialog from "../../components/QuickMessageDialog";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { isArray } from "lodash";
import { AuthContext } from "../../context/Auth/AuthContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_QUICKMESSAGES") {
    const quickmessages = action.payload;
    const newQuickmessages = [];

    if (isArray(quickmessages)) {
      quickmessages.forEach((quickemessage) => {
        const quickemessageIndex = state.findIndex(
          (u) => u.id === quickemessage.id
        );
        if (quickemessageIndex !== -1) {
          state[quickemessageIndex] = quickemessage;
        } else {
          newQuickmessages.push(quickemessage);
        }
      });
    }
    return [...state, ...newQuickmessages];
  }

  if (action.type === "UPDATE_QUICKMESSAGES") {
    const quickemessage = action.payload;
    const quickemessageIndex = state.findIndex((u) => u.id === quickemessage.id);
    if (quickemessageIndex !== -1) {
      state[quickemessageIndex] = quickemessage;
      return [...state];
    } else {
      return [quickemessage, ...state];
    }
  }

  if (action.type === "DELETE_QUICKMESSAGE") {
    const quickemessageId = action.payload;
    const quickemessageIndex = state.findIndex((u) => u.id === quickemessageId);
    if (quickemessageIndex !== -1) {
      state.splice(quickemessageIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    background: "#f0f2f5",
    minHeight: "100vh",
  },
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    margin: theme.spacing(2),
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    background: "white",
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      width: "8px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#bdbdbd",
      borderRadius: "4px",
    },
  },
  headerGrid: {
    padding: theme.spacing(2),
  },
  searchField: {
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
    "& .MuiOutlinedInput-root": {
      "&:hover fieldset": {
        borderColor: theme.palette.primary.main,
      },
    },
  },
  addButton: {
    borderRadius: "8px",
    padding: theme.spacing(1, 2),
    textTransform: "none",
    fontWeight: 500,
    background: theme.palette.primary.main,
    color: "white",
    "&:hover": {
      background: theme.palette.primary.dark,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
    },
  },
  table: {
    borderCollapse: "separate",
    borderSpacing: "0 4px",
  },
  tableRow: {
    background: "#fff",
    borderRadius: "8px",
    "&:hover": {
      background: "#f8f9fa",
    },
  },
  tableCell: {
    border: "none",
    padding: theme.spacing(1.5),
    color: "#444",
  },
  actionButton: {
    margin: theme.spacing(0, 0.5),
    "&:hover": {
      background: "#e9ecef",
      borderRadius: "50%",
    },
  },
}));

const QuickMessages = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedQuickMessage, setSelectedQuickMessage] = useState(null);
  const [deletingQuickMessage, setDeletingQuickMessage] = useState(null);
  const [quickMessageModalOpen, setQuickMessageDialogOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [quickMessages, dispatch] = useReducer(reducer, []);
  const { user, socket } = useContext(AuthContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchQuickMessages();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = user.companyId;
    const onQuickMessageEvent = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_QUICKMESSAGES", payload: data.record });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_QUICKMESSAGE", payload: +data.id });
      }
    };
    socket.on(`company-${companyId}-quickemessage`, onQuickMessageEvent);
    return () => {
      socket.off(`company-${companyId}-quickemessage`, onQuickMessageEvent);
    };
  }, [socket]);

  const fetchQuickMessages = async () => {
    try {
      const companyId = user.companyId;
      const { data } = await api.get("/quick-messages", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_QUICKMESSAGES", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenQuickMessageDialog = () => {
    setSelectedQuickMessage(null);
    setQuickMessageDialogOpen(true);
  };

  const handleCloseQuickMessageDialog = () => {
    setSelectedQuickMessage(null);
    setQuickMessageDialogOpen(false);
    fetchQuickMessages();
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditQuickMessage = (quickMessage) => {
    setSelectedQuickMessage(quickMessage);
    setQuickMessageDialogOpen(true);
  };

  const handleDeleteQuickMessage = async (quickMessageId) => {
    try {
      await api.delete(`/quick-messages/${quickMessageId}`);
      toast.success(i18n.t("quickMessages.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingQuickMessage(null);
    setSearchParam("");
    setPageNumber(1);
    fetchQuickMessages();
    dispatch({ type: "RESET" });
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  return (
    <MainContainer className={classes.mainContainer}>
      <ConfirmationModal
        title={
          deletingQuickMessage &&
          `${i18n.t("quickMessages.confirmationModal.deleteTitle")} ${
            deletingQuickMessage.shortcode
          }?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteQuickMessage(deletingQuickMessage.id)}
      >
        {i18n.t("quickMessages.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <QuickMessageDialog
        resetPagination={() => {
          setPageNumber(1);
          fetchQuickMessages();
        }}
        open={quickMessageModalOpen}
        onClose={handleCloseQuickMessageDialog}
        aria-labelledby="form-dialog-title"
        quickMessageId={selectedQuickMessage && selectedQuickMessage.id}
      />
      <MainHeader>
        <Grid container className={classes.headerGrid}>
          <Grid item xs={12} sm={8}>
            <Title>{i18n.t("quickMessages.title")}</Title>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={6}>
                <TextField
                  className={classes.searchField}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder={i18n.t("quickMessages.searchPlaceholder")}
                  value={searchParam}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <Button
                  className={classes.addButton}
                  fullWidth
                  variant="contained"
                  onClick={handleOpenQuickMessageDialog}
                  startIcon={<AddIcon />}
                >
                  {i18n.t("quickMessages.buttons.add")}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small" className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell align="center" className={classes.tableCell}>
                {i18n.t("quickMessages.table.shortcode")}
              </TableCell>
              <TableCell align="center" className={classes.tableCell}>
                {i18n.t("quickMessages.table.mediaName")}
              </TableCell>
              <TableCell align="center" className={classes.tableCell}>
                {i18n.t("quickMessages.table.status")}
              </TableCell>
              <TableCell align="center" className={classes.tableCell}>
                {i18n.t("quickMessages.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quickMessages.map((quickMessage) => (
              <TableRow key={quickMessage.id} className={classes.tableRow}>
                <TableCell align="center" className={classes.tableCell}>
                  {quickMessage.shortcode}
                </TableCell>
                <TableCell align="center" className={classes.tableCell}>
                  {quickMessage.mediaName ?? i18n.t("quickMessages.noAttachment")}
                </TableCell>
                <TableCell align="center" className={classes.tableCell}>
                  {quickMessage.geral === true ? (
                    <CheckCircleIcon style={{ color: "#28a745" }} />
                  ) : (
                    ""
                  )}
                </TableCell>
                <TableCell align="center" className={classes.tableCell}>
                  <IconButton
                    className={classes.actionButton}
                    size="small"
                    onClick={() => handleEditQuickMessage(quickMessage)}
                  >
                    <EditIcon color="primary" />
                  </IconButton>
                  <IconButton
                    className={classes.actionButton}
                    size="small"
                    onClick={() => {
                      setConfirmModalOpen(true);
                      setDeletingQuickMessage(quickMessage);
                    }}
                  >
                    <DeleteOutlineIcon color="secondary" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {loading && <TableRowSkeleton columns={4} />}
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default QuickMessages;