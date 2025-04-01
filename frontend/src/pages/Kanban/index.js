import React, { useState, useEffect, useContext } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import Board from 'react-trello';
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { useHistory } from 'react-router-dom';
import { Facebook, Instagram, WhatsApp } from "@material-ui/icons";
import { Badge, Tooltip, Typography, Button, TextField, Box } from "@material-ui/core";
import { format, isSameDay, parseISO } from "date-fns";
import { Can } from "../../components/Can";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(2),
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    minHeight: "100vh",
  },
  kanbanContainer: {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  },
  connectionTag: {
    background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
    color: "#FFF",
    marginRight: 4,
    padding: "2px 8px",
    fontWeight: 'bold',
    borderRadius: "12px",
    fontSize: "0.7em",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  lastMessageTime: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    marginLeft: "auto",
    color: theme.palette.grey[600],
    fontSize: "0.8em",
    fontStyle: "italic",
  },
  lastMessageTimeUnread: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    color: "#00C853",
    fontWeight: "bold",
    marginLeft: "auto",
    fontSize: "0.8em",
  },
  cardButton: {
    marginTop: theme.spacing(1),
    padding: "6px 16px",
    borderRadius: "20px",
    color: "#ffffff",
    background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
    textTransform: "none",
    fontWeight: 600,
    "&:hover": {
      background: "linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)",
      boxShadow: "0 3px 15px rgba(254, 107, 139, 0.3)",
    },
    transition: "all 0.3s ease",
  },
  dateInput: {
    marginRight: theme.spacing(2),
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      backgroundColor: "#fff",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    },
  },
  searchButton: {
    borderRadius: "8px",
    padding: "8px 24px",
    background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
    color: "#fff",
    textTransform: "none",
    fontWeight: 600,
    "&:hover": {
      background: "linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)",
    },
  },
  addColumnButton: {
    borderRadius: "8px",
    padding: "8px 24px",
    background: "linear-gradient(45deg, #4CAF50 30%, #81C784 90%)",
    color: "#fff",
    textTransform: "none",
    fontWeight: 600,
    "&:hover": {
      background: "linear-gradient(45deg, #81C784 30%, #4CAF50 90%)",
    },
  },
}));

const Kanban = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const { user, socket } = useContext(AuthContext);
  const [tags, setTags] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [ticketNot, setTicketNot] = useState(0);
  const [file, setFile] = useState({ lanes: [] });
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const jsonString = user.queues.map(queue => queue.UserQueue.queueId);

  useEffect(() => {
    fetchTags();
  }, [user]);

  const fetchTags = async () => {
    try {
      const response = await api.get("/tag/kanban/");
      const fetchedTags = response.data.lista || [];
      setTags(fetchedTags);
      fetchTickets();
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTickets = async () => {
    try {
      const { data } = await api.get("/ticket/kanban", {
        params: {
          queueIds: JSON.stringify(jsonString),
          startDate: startDate,
          endDate: endDate,
        }
      });
      setTickets(data.tickets);
    } catch (err) {
      console.log(err);
      setTickets([]);
    }
  };

  useEffect(() => {
    const companyId = user.companyId;
    const onAppMessage = (data) => {
      if (data.action === "create" || data.action === "update" || data.action === "delete") {
        fetchTickets();
      }
    };
    socket.on(`company-${companyId}-ticket`, onAppMessage);
    socket.on(`company-${companyId}-appMessage`, onAppMessage);

    return () => {
      socket.off(`company-${companyId}-ticket`, onAppMessage);
      socket.off(`company-${companyId}-appMessage`, onAppMessage);
    };
  }, [socket, startDate, endDate]);

  const handleSearchClick = () => {
    fetchTickets();
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const IconChannel = (channel) => {
    switch (channel) {
      case "facebook":
        return <Facebook style={{ color: "#3b5998", verticalAlign: "middle", fontSize: "18px" }} />;
      case "instagram":
        return <Instagram style={{ color: "#e1306c", verticalAlign: "middle", fontSize: "18px" }} />;
      case "whatsapp":
        return <WhatsApp style={{ color: "#25d366", verticalAlign: "middle", fontSize: "18px" }} />;
      default:
        return "error";
    }
  };

  const popularCards = (jsonString) => {
    const filteredTickets = tickets.filter(ticket => ticket.tags.length === 0);

    const lanes = [
      {
        id: "lane0",
        title: i18n.t("tagsKanban.laneDefault"),
        label: filteredTickets.length.toString(),
        cards: filteredTickets.map(ticket => ({
          id: ticket.id.toString(),
          label: "Ticket nº " + ticket.id.toString(),
          description: (
            <div style={{ padding: "8px" }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 500, color: "#333" }}>{ticket.contact.number}</span>
                <Typography
                  className={Number(ticket.unreadMessages) > 0 ? classes.lastMessageTimeUnread : classes.lastMessageTime}
                  component="span"
                  variant="body2"
                >
                  {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                    <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                  ) : (
                    <>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
                  )}
                </Typography>
              </div>
              <div style={{ textAlign: 'left', color: "#666", margin: "8px 0" }}>{ticket.lastMessage || " "}</div>
              <Button
                className={classes.cardButton}
                onClick={() => handleCardClick(ticket.uuid)}
              >
                Ver Ticket
              </Button>
              {ticket?.user && (
                <Badge style={{ marginTop: "8px" }} className={classes.connectionTag}>
                  {ticket.user?.name.toUpperCase()}
                </Badge>
              )}
            </div>
          ),
          title: (
            <div style={{ display: "flex", alignItems: "center", fontWeight: 600, color: "#222" }}>
              <Tooltip title={ticket.whatsapp?.name}>
                {IconChannel(ticket.channel)}
              </Tooltip>
              <span style={{ marginLeft: "8px" }}>{ticket.contact.name}</span>
            </div>
          ),
          draggable: true,
          href: "/tickets/" + ticket.uuid,
        })),
      },
      ...tags.map(tag => {
        const filteredTickets = tickets.filter(ticket => {
          const tagIds = ticket.tags.map(tag => tag.id);
          return tagIds.includes(tag.id);
        });

        return {
          id: tag.id.toString(),
          title: tag.name,
          label: filteredTickets?.length.toString(),
          cards: filteredTickets.map(ticket => ({
            id: ticket.id.toString(),
            label: "Ticket nº " + ticket.id.toString(),
            description: (
              <div style={{ padding: "8px" }}>
                <div style={{ fontWeight: 500, color: "#333" }}>{ticket.contact.number}</div>
                <div style={{ textAlign: 'left', color: "#666", margin: "8px 0" }}>{ticket.lastMessage || " "}</div>
                <Button
                  className={classes.cardButton}
                  onClick={() => handleCardClick(ticket.uuid)}
                >
                  Ver Ticket
                </Button>
                {ticket?.user && (
                  <Badge style={{ marginTop: "8px" }} className={classes.connectionTag}>
                    {ticket.user?.name.toUpperCase()}
                  </Badge>
                )}
              </div>
            ),
            title: (
              <div style={{ display: "flex", alignItems: "center", fontWeight: 600, color: "#222" }}>
                <Tooltip title={ticket.whatsapp?.name}>
                  {IconChannel(ticket.channel)}
                </Tooltip>
                <span style={{ marginLeft: "8px" }}>{ticket.contact.name}</span>
              </div>
            ),
            draggable: true,
            href: "/tickets/" + ticket.uuid,
          })),
          style: { 
            background: `linear-gradient(135deg, ${tag.color} 0%, ${theme.palette.grey[100]} 100%)`,
            color: "#fff",
            borderRadius: "8px",
            padding: "10px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          },
        };
      }),
    ];

    setFile({ lanes });
  };

  const handleCardClick = (uuid) => {
    history.push('/tickets/' + uuid);
  };

  useEffect(() => {
    popularCards(jsonString);
  }, [tags, tickets]);

  const handleCardMove = async (cardId, sourceLaneId, targetLaneId) => {
    try {
      await api.delete(`/ticket-tags/${targetLaneId}`);
      toast.success('Ticket Tag Removido!');
      await api.put(`/ticket-tags/${targetLaneId}/${sourceLaneId}`);
      toast.success('Ticket Tag Adicionado com Sucesso!');
      await fetchTickets(jsonString);
      popularCards(jsonString);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddConnectionClick = () => {
    history.push('/tagsKanban');
  };

  return (
    <div className={classes.root}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '30px', 
        width: '100%', 
        maxWidth: '1400px',
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            label="Data de início"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            className={classes.dateInput}
          />
          <Box mx={1} />
          <TextField
            label="Data de fim"
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            className={classes.dateInput}
          />
          <Box mx={1} />
          <Button
            variant="contained"
            className={classes.searchButton}
            onClick={handleSearchClick}
          >
            Buscar
          </Button>
        </div>
        <Can role={user.profile} perform="dashboard:view" yes={() => (
          <Button
            variant="contained"
            className={classes.addColumnButton}
            onClick={handleAddConnectionClick}
          >
            + Adicionar Colunas
          </Button>
        )} />
      </div>
      <div className={classes.kanbanContainer}>
        <Board
          data={file}
          onCardMoveAcrossLanes={handleCardMove}
          style={{ 
            backgroundColor: 'transparent',
            padding: "20px",
          }}
        />
      </div>
    </div>
  );
};

export default Kanban;