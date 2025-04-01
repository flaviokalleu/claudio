import React, { useContext, useEffect, useRef, useState } from "react";
import { useTheme } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import {
  Paper,
  InputBase,
  Tabs,
  Tab,
  Badge,
  IconButton,
  Typography,
  Box,
  Button,
  Snackbar,
  Tooltip,
  Switch,
  useMediaQuery,
  Collapse,
  Divider,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

// React Lucide Icons
import {
  Search,
  Plus,
  Inbox,
  CheckSquare,
  Users,
  Clock,
  MessageSquare,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Filter,
  FilterX,
  CheckCircle,
  X,
  Sliders,
} from "lucide-react";

// Componentes personalizados
import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsListCustom";
import TabPanel from "../TabPanel";
import { Can } from "../Can";
import TicketsQueueSelect from "../TicketsQueueSelect";
import { TagsFilter } from "../TagsFilter";
import { UsersFilter } from "../UsersFilter";
import { StatusFilter } from "../StatusFilter";
import { WhatsappsFilter } from "../WhatsappsFilter";

// Contexto e serviços
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { QueueSelectedContext } from "../../context/QueuesSelected/QueuesSelectedContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import api from "../../services/api";

// Estilos atualizados
const useStyles = makeStyles((theme) => ({
  ticketsWrapper: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    transition: "all 0.3s ease",
  },
  header: {
    padding: theme.spacing(1.5, 2),
    backgroundColor: theme.palette.type === "dark" 
      ? theme.palette.grey[900] 
      : theme.palette.grey[50],
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tab: {
    minWidth: 120,
    padding: theme.spacing(1.5, 2),
    borderRadius: 8,
    textTransform: "none",
    fontWeight: 500,
    fontSize: "0.9rem",
    color: theme.palette.text.secondary,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      color: theme.palette.text.primary,
    },
    "&.Mui-selected": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      fontWeight: 600,
    },
    [theme.breakpoints.down("sm")]: {
      minWidth: 80,
      fontSize: "0.85rem",
    },
    [theme.breakpoints.down("xs")]: {
      minWidth: 60,
      padding: theme.spacing(1),
      fontSize: "0.8rem",
    },
  },
  tabIndicator: {
    height: 3,
    backgroundColor: theme.palette.primary.main,
    borderRadius: "3px 3px 0 0",
  },
  optionsBox: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
  },
  searchWrapper: {
    display: "flex",
    alignItems: "center",
    backgroundColor: theme.palette.grey[100],
    borderRadius: 8,
    padding: theme.spacing(0.5, 1),
    border: `1px solid ${theme.palette.divider}`,
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.grey[200],
    },
    "&:focus-within": {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
    },
  },
  searchInput: {
    flex: 1,
    padding: theme.spacing(1),
    fontSize: "0.95rem",
    "& input::placeholder": {
      color: theme.palette.text.secondary,
      opacity: 0.6,
    },
  },
  buttonWrapper: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flexWrap: "wrap",
    [theme.breakpoints.down("sm")]: {
      justifyContent: "space-between",
    },
  },
  actionButtonsGroup: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      flex: 1,
      justifyContent: "space-around",
    },
  },
  filterSection: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[50],
    borderRadius: 8,
    margin: theme.spacing(1, 0),
    boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.05)",
  },
  filterContent: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
  },
  filterHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(1),
  },
  button: {
    padding: theme.spacing(1),
    minWidth: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.secondary,
    "&:hover": {
      backgroundColor: theme.palette.grey[100],
      borderColor: theme.palette.primary.main,
      color: theme.palette.primary.main,
    },
  },
  activeButton: {
    backgroundColor: theme.palette.primary.light,
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    "& svg": {
      color: theme.palette.primary.main,
    },
  },
  queueSelect: {
    flex: 1,
    minWidth: 200,
    [theme.breakpoints.down("sm")]: {
      minWidth: 150,
    },
    [theme.breakpoints.down("xs")]: {
      width: "100%",
    },
  },
  snackbar: {
    backgroundColor: theme.palette.grey[800],
    color: theme.palette.common.white,
    borderRadius: 8,
    padding: theme.spacing(1, 2),
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
  snackbarButton: {
    color: theme.palette.primary.main,
    fontWeight: 600,
    "&:hover": {
      backgroundColor: theme.palette.grey[700],
    },
  },
  badge: {
    "& .MuiBadge-badge": {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.secondary.contrastText,
      fontSize: "0.7rem",
      minWidth: 16,
      height: 16,
      padding: "0 4px",
    },
  },
  tabLabel: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  searchToggleWrapper: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
  },
  switchRoot: {
    width: 38,
    height: 20,
    padding: 0,
    margin: theme.spacing(0, 1),
  },
  switchBase: {
    padding: 2,
    '&$checked': {
      transform: 'translateX(18px)',
      color: theme.palette.common.white,
      '& + $track': {
        backgroundColor: theme.palette.primary.main,
        opacity: 1,
      },
    },
  },
  switchTrack: {
    borderRadius: 10,
    backgroundColor: theme.palette.grey[400],
    opacity: 1,
  },
  switchThumb: {
    width: 16,
    height: 16,
  },
  checked: {},
}));

const TicketsManagerTabs = () => {
  const theme = useTheme();
  const classes = useStyles();
  const history = useHistory();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isXsScreen = useMediaQuery(theme.breakpoints.down("xs"));

  // Estados principais
  const [searchParam, setSearchParam] = useState("");
  const [tab, setTab] = useState("open");
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const [sortTickets, setSortTickets] = useState(false);
  const [searchOnMessages, setSearchOnMessages] = useState(false);
  const [filterActive, setFilterActive] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  // Referências e contexto
  const searchInputRef = useRef();
  const { user } = useContext(AuthContext);
  const { profile } = user;
  const { setSelectedQueuesMessage } = useContext(QueueSelectedContext);
  const { tabOpen, setTabOpen } = useContext(TicketsContext);

  // Contadores de tickets
  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [groupingCount, setGroupingCount] = useState(0);

  // Filtros e seleções
  const userQueueIds = user.queues.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedWhatsapp, setSelectedWhatsapp] = useState([]);
  const [forceSearch, setForceSearch] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Handlers (mantidos iguais, apenas exemplo de um para brevidade)
  let searchTimeout;

  const handleSearch = (e) => {
    const searchedTerm = e.target.value.toLowerCase();
    clearTimeout(searchTimeout);

    if (searchedTerm === "") {
      setSearchParam(searchedTerm);
      setForceSearch((prev) => !prev);
      setTab("open");
      return;
    } else if (tab !== "search") {
      setTab("search");
      setFilterActive(true);
    }

    searchTimeout = setTimeout(() => {
      setSearchParam(searchedTerm);
      setForceSearch((prev) => !prev);
    }, 500);
  };

  const handleChangeTab = (e, newValue) => setTab(newValue);

  const applyPanelStyle = (status) => {
    return tabOpen !== status ? { width: 0, height: 0, overflow: "hidden" } : { flex: 1, overflow: "auto" };
  };

  const renderTabLabel = (icon, label, count) => (
    <Box className={classes.tabLabel}>
      <Badge badgeContent={count} className={classes.badge}>
        {icon}
      </Badge>
      {!isXsScreen && (
        <Typography variant="body2" style={{ fontWeight: 500 }}>
          {label}
        </Typography>
      )}
    </Box>
  );

  return (
    <Paper elevation={0} className={classes.ticketsWrapper}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        onClose={(ticket) => {
          setNewTicketModalOpen(false);
          if (ticket?.uuid) history.push(`/tickets/${ticket.uuid}`);
        }}
      />

      {/* Barra de opções */}
      <Box className={classes.optionsBox}>
        <Box className={classes.searchWrapper}>
          <Search size={18} style={{ marginLeft: 8, color: theme.palette.text.secondary }} />
          <InputBase
            className={classes.searchInput}
            inputRef={searchInputRef}
            placeholder={i18n.t("tickets.search.placeholder")}
            onChange={handleSearch}
          />
          <Box className={classes.searchToggleWrapper}>
            <Typography variant="caption" color="textSecondary">
              {isXsScreen ? "Msgs" : "Mensagens"}
            </Typography>
            <Switch
              classes={{
                root: classes.switchRoot,
                switchBase: classes.switchBase,
                track: classes.switchTrack,
                thumb: classes.switchThumb,
                checked: classes.checked,
              }}
              size="small"
              checked={searchOnMessages}
              onChange={(e) => setSearchOnMessages(e.target.checked)}
            />
          </Box>
          <Tooltip title={filterActive ? "Limpar filtros" : "Filtros"}>
            <IconButton
              onClick={() => setShowFilterOptions(!showFilterOptions)}
              className={filterActive ? classes.activeButton : classes.button}
            >
              {filterActive ? <FilterX size={18} /> : <Filter size={18} />}
            </IconButton>
          </Tooltip>
        </Box>

        <Box className={classes.buttonWrapper}>
          <Box className={classes.actionButtonsGroup}>
            <Can
              role={user.allUserChat === "enabled" && profile === "user" ? "admin" : profile}
              perform="tickets-manager:showall"
              yes={() => (
                <Tooltip title={showAllTickets ? "Meus tickets" : "Todos os tickets"}>
                  <IconButton
                    className={`${classes.button} ${showAllTickets ? classes.activeButton : ""}`}
                    onClick={() => setShowAllTickets(!showAllTickets)}
                  >
                    {showAllTickets ? <Eye size={18} /> : <EyeOff size={18} />}
                  </IconButton>
                </Tooltip>
              )}
            />
            <Tooltip title={i18n.t("tickets.inbox.newTicket")}>
              <IconButton
                className={classes.button}
                onClick={() => setNewTicketModalOpen(true)}
              >
                <Plus size={18} />
              </IconButton>
            </Tooltip>
            {profile === "admin" && (
              <Tooltip title={i18n.t("tickets.inbox.closedAll")}>
                <IconButton className={classes.button} onClick={() => setSnackbarOpen(true)}>
                  <CheckCircle size={18} style={{ color: theme.palette.success.main }} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Ordenar">
              <IconButton
                className={`${classes.button} ${sortTickets ? classes.activeButton : ""}`}
                onClick={() => setSortTickets(!sortTickets)}
              >
                {sortTickets ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
              </IconButton>
            </Tooltip>
          </Box>
          <TicketsQueueSelect
            selectedQueueIds={selectedQueueIds}
            userQueues={user?.queues}
            onChange={setSelectedQueueIds}
            className={classes.queueSelect}
          />
        </Box>
      </Box>

      {/* Filtros */}
      <Collapse in={showFilterOptions}>
        <Box className={classes.filterSection}>
          <Box className={classes.filterHeader}>
            <Typography variant="subtitle2" color="textPrimary">
              <Box display="flex" alignItems="center" gap={1}>
                <Sliders size={16} />
                Filtros
              </Box>
            </Typography>
            <IconButton size="small" onClick={() => setShowFilterOptions(false)}>
              <X size={18} />
            </IconButton>
          </Box>
          <Divider />
          <Box className={classes.filterContent}>
            <TagsFilter onFiltered={(tags) => setSelectedTags(tags.map(t => t.id))} />
            <WhatsappsFilter onFiltered={(whatsapps) => setSelectedWhatsapp(whatsapps.map(w => w.id))} />
            <StatusFilter onFiltered={(status) => setSelectedStatus(status.map(s => s.status))} />
            {profile === "admin" && <UsersFilter onFiltered={(users) => setSelectedUsers(users.map(u => u.id))} />}
          </Box>
        </Box>
      </Collapse>

      {/* Abas */}
      <TabPanel value={tab} name="open" className={classes.ticketsWrapper}>
        <Tabs
          value={tabOpen}
          onChange={(e, value) => setTabOpen(value)}
          variant={isMobile ? "scrollable" : "standard"}
          className={classes.header}
          TabIndicatorProps={{ className: classes.tabIndicator }}
        >
          <Tab
            label={renderTabLabel(<MessageSquare size={18} />, "Atribuídos", openCount)}
            value="open"
            className={classes.tab}
          />
          <Tab
            label={renderTabLabel(<Clock size={18} />, "Pendentes", pendingCount)}
            value="pending"
            className={classes.tab}
          />
          {user.allowGroup && (
            <Tab
              label={renderTabLabel(<Users size={18} />, "Grupos", groupingCount)}
              value="group"
              className={classes.tab}
            />
          )}
        </Tabs>
        <Box flex={1} overflow="hidden">
          <TicketsList
            status="open"
            showAll={showAllTickets}
            sortTickets={sortTickets ? "ASC" : "DESC"}
            selectedQueueIds={selectedQueueIds}
            updateCount={setOpenCount}
            style={applyPanelStyle("open")}
          />
          <TicketsList
            status="pending"
            showAll={profile === "admin" || user.allUserChat === "enabled" ? showAllTickets : false}
            sortTickets={sortTickets ? "ASC" : "DESC"}
            selectedQueueIds={selectedQueueIds}
            updateCount={setPendingCount}
            style={applyPanelStyle("pending")}
          />
          {user.allowGroup && (
            <TicketsList
              status="group"
              showAll={showAllTickets}
              sortTickets={sortTickets ? "ASC" : "DESC"}
              selectedQueueIds={selectedQueueIds}
              updateCount={setGroupingCount}
              style={applyPanelStyle("group")}
            />
          )}
        </Box>
      </TabPanel>

      <TabPanel value={tab} name="closed" className={classes.ticketsWrapper}>
        <Box className={classes.header}>
          <Typography variant="h6">Resolvidos</Typography>
        </Box>
        <TicketsList
          status="closed"
          showAll={showAllTickets}
          selectedQueueIds={selectedQueueIds}
        />
      </TabPanel>

      <TabPanel value={tab} name="search" className={classes.ticketsWrapper}>
        <Box className={classes.header}>
          <Typography variant="h6">
            Resultados da busca {searchParam && `"${searchParam}"`}
          </Typography>
        </Box>
        <TicketsList
          status="search"
          searchParam={searchParam}
          showAll={profile === "admin" ? showAllTickets : false}
          tags={selectedTags}
          users={selectedUsers}
          selectedQueueIds={selectedQueueIds}
          whatsappIds={selectedWhatsapp}
          forceSearch={forceSearch}
          searchOnMessages={searchOnMessages}
          statusFilter={selectedStatus}
        />
      </TabPanel>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        message="Fechar todos os tickets?"
        className={classes.snackbar}
        action={
          <>
            <Button
              className={classes.snackbarButton}
              onClick={async () => {
                await api.post("/tickets/closeAll", { status: tabOpen, selectedQueueIds });
                setSnackbarOpen(false);
              }}
            >
              Sim
            </Button>
            <Button className={classes.snackbarButton} onClick={() => setSnackbarOpen(false)}>
              Não
            </Button>
          </>
        }
      />
    </Paper>
  );
};

export default TicketsManagerTabs;