import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useHelps from "../hooks/useHelps";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Divider from "@material-ui/core/Divider";
import Avatar from "@material-ui/core/Avatar";
import Badge from "@material-ui/core/Badge";
import Collapse from "@material-ui/core/Collapse";
import List from "@material-ui/core/List";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

// Ícones do React Lucide
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Contact,
  Tag,
  Clock,
  HelpCircle,
  FileText,
  List as ListIconLucide,
  AlertCircle,
  Settings,
  File,
  DollarSign,
  Building,
  ChevronDown,
  ChevronUp,
  Zap,
  KanbanSquare,
  MessageCircle,
  Code,
  Webhook as WebhookIcon,
  Shapes,
  Calendar,
  Share2,
  Grid,
} from "lucide-react";

import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { useActiveMenu } from "../context/ActiveMenuContext";
import { Can } from "../components/Can";
import { isArray } from "lodash";
import api from "../services/api";
import toastError from "../errors/toastError";
import usePlans from "../hooks/usePlans";
import useVersion from "../hooks/useVersion";
import { i18n } from "../translate/i18n";
import moment from "moment";

const useStyles = makeStyles((theme) => ({
  listItem: {
    height: "48px",
    width: "auto",
    borderRadius: "8px",
    margin: "4px 8px",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: theme.palette.grey[100],
      transform: "translateX(4px)",
    },
    "&.active": {
      background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
      color: "#fff",
      "& $listItemText": {
        color: "#fff",
      },
      "& $iconHoverActive": {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        color: "#fff",
      },
    },
  },
  listItemText: {
    fontSize: "14px",
    fontWeight: 500,
    color: theme.mode === "light" ? theme.palette.grey[800] : "#FFF",
    transition: "color 0.3s ease",
  },
  avatarActive: {
    backgroundColor: "transparent",
  },
  avatarHover: {
    backgroundColor: "transparent",
  },
  iconHoverActive: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "50%",
    height: 36,
    width: 36,
    backgroundColor: theme.mode === "light" ? "rgba(120, 120, 120, 0.1)" : "rgba(120, 120, 120, 0.5)",
    color: theme.mode === "light" ? theme.palette.grey[700] : "#FFF",
    transition: "background-color 0.3s ease, color 0.3s ease",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
      color: "#fff",
    },
  },
  subheader: {
    fontSize: "12px",
    fontWeight: 600,
    color: theme.palette.grey[600],
    padding: "8px 16px",
    textTransform: "uppercase",
  },
  collapse: {
    backgroundColor: theme.mode === "light" ? "rgba(0, 0, 0, 0.02)" : "rgba(255, 255, 255, 0.05)",
    borderRadius: "4px",
    margin: "0 8px",
  },
}));

function ListItemLink(props) {
  const { icon, primary, to, tooltip, showBadge } = props;
  const classes = useStyles();
  const { activeMenu } = useActiveMenu();
  const location = useLocation();
  const isActive = activeMenu === to || location.pathname === to;

  const renderLink = React.useMemo(
    () => React.forwardRef((itemProps, ref) => <RouterLink to={to} ref={ref} {...itemProps} />),
    [to]
  );

  const ConditionalTooltip = ({ children, tooltipEnabled }) =>
    tooltipEnabled ? (
      <Tooltip title={primary} placement="right">
        {children}
      </Tooltip>
    ) : (
      children
    );

  return (
    <ConditionalTooltip tooltipEnabled={!!tooltip}>
      <li>
        <ListItem
          button
          component={renderLink}
          className={`${classes.listItem} ${isActive ? "active" : ""}`}
        >
          {icon ? (
            <ListItemIcon>
              {showBadge ? (
                <Badge badgeContent="!" color="error" overlap="circular">
                  <Avatar className={classes.iconHoverActive}>{icon}</Avatar>
                </Badge>
              ) : (
                <Avatar className={classes.iconHoverActive}>{icon}</Avatar>
              )}
            </ListItemIcon>
          ) : null}
          <ListItemText primary={<Typography className={classes.listItemText}>{primary}</Typography>} />
        </ListItem>
      </li>
    </ConditionalTooltip>
  );
}

const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];
    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          state[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });
    }
    return [...state, ...newChats];
  }
  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);
    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    } else {
      return [chat, ...state];
    }
  }
  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) {
      state.splice(chatIndex, 1);
    }
    return [...state];
  }
  if (action.type === "RESET") {
    return [];
  }
  if (action.type === "CHANGE_CHAT") {
    const changedChats = state.map((chat) => {
      if (chat.id === action.payload.chat.id) {
        return action.payload.chat;
      }
      return chat;
    });
    return changedChats;
  }
};

const MainListItems = ({ collapsed, drawerClose }) => {
  const theme = useTheme();
  const classes = useStyles();
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user, socket } = useContext(AuthContext);
  const { setActiveMenu } = useActiveMenu();
  const location = useLocation();

  const [connectionWarning, setConnectionWarning] = useState(false);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [openFlowSubmenu, setOpenFlowSubmenu] = useState(false);
  const [openDashboardSubmenu, setOpenDashboardSubmenu] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [planExpired, setPlanExpired] = useState(false);
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showSchedules, setShowSchedules] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);

  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const [version, setVersion] = useState(false);
  const [managementHover, setManagementHover] = useState(false);
  const [campaignHover, setCampaignHover] = useState(false);
  const [flowHover, setFlowHover] = useState(false);
  const { list } = useHelps();
  const [hasHelps, setHasHelps] = useState(false);

  useEffect(() => {
    async function checkHelps() {
      const helps = await list();
      setHasHelps(helps.length > 0);
    }
    checkHelps();
  }, []);

  const isManagementActive =
    location.pathname === "/" ||
    location.pathname.startsWith("/reports") ||
    location.pathname.startsWith("/moments");

  const isCampaignRouteActive =
    location.pathname === "/campaigns" ||
    location.pathname.startsWith("/contact-lists") ||
    location.pathname.startsWith("/campaigns-config");

  const isFlowbuilderRouteActive =
    location.pathname.startsWith("/phrase-lists") ||
    location.pathname.startsWith("/flowbuilders");

  useEffect(() => {
    if (location.pathname.startsWith("/tickets")) {
      setActiveMenu("/tickets");
    } else {
      setActiveMenu("");
    }
  }, [location, setActiveMenu]);

  const { getPlanCompany } = usePlans();
  const { getVersion } = useVersion();

  useEffect(() => {
    async function fetchVersion() {
      const _version = await getVersion();
      setVersion(_version.version);
    }
    fetchVersion();
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);

      setShowCampaigns(planConfigs.plan.useCampaigns);
      setShowKanban(planConfigs.plan.useKanban);
      setShowOpenAi(planConfigs.plan.useOpenAi);
      setShowIntegrations(planConfigs.plan.useIntegrations);
      setShowSchedules(planConfigs.plan.useSchedules);
      setShowInternalChat(planConfigs.plan.useInternalChat);
      setShowExternalApi(planConfigs.plan.useExternalApi);
      setPlanExpired(moment(moment().format()).isBefore(user.company.dueDate));
    }
    fetchData();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    if (user.id) {
      const companyId = user.companyId;
      const onCompanyChatMainListItems = (data) => {
        if (data.action === "new-message" || data.action === "update") {
          dispatch({ type: "CHANGE_CHAT", payload: data });
        }
      };
      socket.on(`company-${companyId}-chat`, onCompanyChatMainListItems);
      return () => {
        socket.off(`company-${companyId}-chat`, onCompanyChatMainListItems);
      };
    }
  }, [socket, user.id]);

  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    setInvisible(unreadsCount === 0);
  }, [chats, user.id]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) =>
          ["qrcode", "PAIRING", "DISCONNECTED", "TIMEOUT", "OPENING"].includes(whats.status)
        );
        setConnectionWarning(offlineWhats.length > 0);
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", { params: { searchParam, pageNumber } });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div onClick={drawerClose}>
      {planExpired && (
        <Can
          role={
            (user.profile === "user" && user.showDashboard === "enabled") ||
            user.allowRealTime === "enabled"
              ? "admin"
              : user.profile
          }
          perform={"drawer-admin-items:view"}
          yes={() => (
            <>
              <Tooltip
                title={collapsed ? i18n.t("mainDrawer.listItems.management") : ""}
                placement="right"
              >
                <ListItem
                  dense
                  button
                  onClick={() => setOpenDashboardSubmenu((prev) => !prev)}
                  onMouseEnter={() => setManagementHover(true)}
                  onMouseLeave={() => setManagementHover(false)}
                  className={`${classes.listItem} ${isManagementActive ? "active" : ""}`}
                >
                  <ListItemIcon>
                    <Avatar
                      className={`${classes.iconHoverActive} ${isManagementActive || managementHover ? "active" : ""}`}
                    >
                      <LayoutDashboard size={20} />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography className={classes.listItemText}>{i18n.t("mainDrawer.listItems.management")}</Typography>}
                  />
                  {openDashboardSubmenu ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </ListItem>
              </Tooltip>
              <Collapse in={openDashboardSubmenu} timeout="auto" unmountOnExit className={classes.collapse}>
                <Can
                  role={user.profile === "user" && user.showDashboard === "enabled" ? "admin" : user.profile}
                  perform={"drawer-admin-items:view"}
                  yes={() => (
                    <>
                      <ListItemLink
                        to="/"
                        primary="Dashboard"
                        icon={<LayoutDashboard size={20} />}
                        tooltip={collapsed}
                      />
                      <ListItemLink
                        to="/reports"
                        primary={i18n.t("mainDrawer.listItems.reports")}
                        icon={<FileText size={20} />}
                        tooltip={collapsed}
                      />
                    </>
                  )}
                />
                <Can
                  role={user.profile === "user" && user.allowRealTime === "enabled" ? "admin" : user.profile}
                  perform={"drawer-admin-items:view"}
                  yes={() => (
                    <ListItemLink
                      to="/moments"
                      primary={i18n.t("mainDrawer.listItems.chatsTempoReal")}
                      icon={<Grid size={20} />}
                      tooltip={collapsed}
                    />
                  )}
                />
              </Collapse>
            </>
          )}
        />
      )}
      {planExpired && (
        <ListItemLink
          to="/tickets"
          primary={i18n.t("mainDrawer.listItems.tickets")}
          icon={<MessageSquare size={20} />}
          tooltip={collapsed}
        />
      )}
      {planExpired && (
        <ListItemLink
          to="/quick-messages"
          primary={i18n.t("mainDrawer.listItems.quickMessages")}
          icon={<Zap size={20} />}
          tooltip={collapsed}
        />
      )}
      {showKanban && planExpired && (
        <ListItemLink
          to="/kanban"
          primary={i18n.t("mainDrawer.listItems.kanban")}
          icon={<KanbanSquare size={20} />}
          tooltip={collapsed}
        />
      )}
      {planExpired && (
        <ListItemLink
          to="/contacts"
          primary={i18n.t("mainDrawer.listItems.contacts")}
          icon={<Contact size={20} />}
          tooltip={collapsed}
        />
      )}
      {showSchedules && planExpired && (
        <ListItemLink
          to="/schedules"
          primary={i18n.t("mainDrawer.listItems.schedules")}
          icon={<Clock size={20} />}
          tooltip={collapsed}
        />
      )}
      {planExpired && (
        <ListItemLink
          to="/tags"
          primary={i18n.t("mainDrawer.listItems.tags")}
          icon={<Tag size={20} />}
          tooltip={collapsed}
        />
      )}
      {showInternalChat && planExpired && (
        <ListItemLink
          to="/chats"
          primary={i18n.t("mainDrawer.listItems.chats")}
          icon={
            <Badge color="secondary" variant="dot" invisible={invisible}>
              <MessageCircle size={20} />
            </Badge>
          }
          tooltip={collapsed}
        />
      )}
      {hasHelps && planExpired && (
        <ListItemLink
          to="/helps"
          primary={i18n.t("mainDrawer.listItems.helps")}
          icon={<HelpCircle size={20} />}
          tooltip={collapsed}
        />
      )}
      <Can
        role={user.profile === "user" && user.allowConnections === "enabled" ? "admin" : user.profile}
        perform="dashboard:view"
        yes={() => (
          <>
            <Divider />
            <ListSubheader inset className={classes.subheader}>
              {i18n.t("mainDrawer.listItems.administration")}
            </ListSubheader>
            {showCampaigns && planExpired && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <>
                    <Tooltip
                      title={collapsed ? i18n.t("mainDrawer.listItems.campaigns") : ""}
                      placement="right"
                    >
                      <ListItem
                        dense
                        button
                        onClick={() => setOpenCampaignSubmenu((prev) => !prev)}
                        onMouseEnter={() => setCampaignHover(true)}
                        onMouseLeave={() => setCampaignHover(false)}
                        className={`${classes.listItem} ${isCampaignRouteActive ? "active" : ""}`}
                      >
                        <ListItemIcon>
                          <Avatar
                            className={`${classes.iconHoverActive} ${isCampaignRouteActive || campaignHover ? "active" : ""}`}
                          >
                            <Calendar size={20} />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={<Typography className={classes.listItemText}>{i18n.t("mainDrawer.listItems.campaigns")}</Typography>}
                        />
                        {openCampaignSubmenu ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </ListItem>
                    </Tooltip>
                    <Collapse in={openCampaignSubmenu} timeout="auto" unmountOnExit className={classes.collapse}>
                      <List dense component="div" disablePadding>
                        <ListItemLink
                          to="/campaigns"
                          primary={i18n.t("campaigns.subMenus.list")}
                          icon={<ListIconLucide size={20} />}
                          tooltip={collapsed}
                        />
                        <ListItemLink
                          to="/contact-lists"
                          primary={i18n.t("campaigns.subMenus.listContacts")}
                          icon={<Users size={20} />}
                          tooltip={collapsed}
                        />
                        <ListItemLink
                          to="/campaigns-config"
                          primary={i18n.t("campaigns.subMenus.settings")}
                          icon={<Settings size={20} />}
                          tooltip={collapsed}
                        />
                      </List>
                    </Collapse>
                  </>
                )}
              />
            )}
            {planExpired && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <>
                    <Tooltip title={collapsed ? i18n.t("Flowbuilder") : ""} placement="right">
                      <ListItem
                        dense
                        button
                        onClick={() => setOpenFlowSubmenu((prev) => !prev)}
                        onMouseEnter={() => setFlowHover(true)}
                        onMouseLeave={() => setFlowHover(false)}
                        className={`${classes.listItem} ${isFlowbuilderRouteActive ? "active" : ""}`}
                      >
                        <ListItemIcon>
                          <Avatar
                            className={`${classes.iconHoverActive} ${isFlowbuilderRouteActive || flowHover ? "active" : ""}`}
                          >
                            <WebhookIcon size={20} />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={<Typography className={classes.listItemText}>{i18n.t("Flowbuilder")}</Typography>}
                        />
                        {openFlowSubmenu ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </ListItem>
                    </Tooltip>
                    <Collapse in={openFlowSubmenu} timeout="auto" unmountOnExit className={classes.collapse}>
                      <List dense component="div" disablePadding>
                        <ListItemLink
                          to="/phrase-lists"
                          primary={"Fluxo de Campanha"}
                          icon={<Calendar size={20} />}
                          tooltip={collapsed}
                        />
                        <ListItemLink
                          to="/flowbuilders"
                          primary={"Fluxo de conversa"}
                          icon={<Shapes size={20} />}
                          tooltip={collapsed}
                        />
                      </List>
                    </Collapse>
                  </>
                )}
              />
            )}
            {user.super && (
              <ListItemLink
                to="/announcements"
                primary={i18n.t("mainDrawer.listItems.annoucements")}
                icon={<AlertCircle size={20} />}
                tooltip={collapsed}
              />
            )}
            {showExternalApi && planExpired && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <ListItemLink
                    to="/messages-api"
                    primary={i18n.t("mainDrawer.listItems.messagesAPI")}
                    icon={<Code size={20} />}
                    tooltip={collapsed}
                  />
                )}
              />
            )}
            {planExpired && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <ListItemLink
                    to="/users"
                    primary={i18n.t("mainDrawer.listItems.users")}
                    icon={<Users size={20} />}
                    tooltip={collapsed}
                  />
                )}
              />
            )}
            {planExpired && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <ListItemLink
                    to="/queues"
                    primary={i18n.t("mainDrawer.listItems.queues")}
                    icon={<Share2 size={20} />}
                    tooltip={collapsed}
                  />
                )}
              />
            )}
            {showOpenAi && planExpired && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <ListItemLink
                    to="/prompts"
                    primary={i18n.t("mainDrawer.listItems.prompts")}
                    icon={<Zap size={20} />}
                    tooltip={collapsed}
                  />
                )}
              />
            )}
            {showIntegrations && planExpired && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <ListItemLink
                    to="/queue-integration"
                    primary={i18n.t("mainDrawer.listItems.queueIntegration")}
                    icon={<WebhookIcon size={20} />}
                    tooltip={collapsed}
                  />
                )}
              />
            )}
            {planExpired && (
              <Can
                role={user.profile === "user" && user.allowConnections === "enabled" ? "admin" : user.profile}
                perform={"drawer-admin-items:view"}
                yes={() => (
                  <ListItemLink
                    to="/connections"
                    primary={i18n.t("mainDrawer.listItems.connections")}
                    icon={<Share2 size={20} />}
                    showBadge={connectionWarning}
                    tooltip={collapsed}
                  />
                )}
              />
            )}
            {user.super && (
              <ListItemLink
                to="/allConnections"
                primary={i18n.t("mainDrawer.listItems.allConnections")}
                icon={<Settings size={20} />}
                tooltip={collapsed}
              />
            )}
            {planExpired && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <ListItemLink
                    to="/files"
                    primary={i18n.t("mainDrawer.listItems.files")}
                    icon={<File size={20} />}
                    tooltip={collapsed}
                  />
                )}
              />
            )}
            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <ListItemLink
                  to="/financeiro"
                  primary={i18n.t("mainDrawer.listItems.financeiro")}
                  icon={<DollarSign size={20} />}
                  tooltip={collapsed}
                />
              )}
            />
            {planExpired && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <ListItemLink
                    to="/settings"
                    primary={i18n.t("mainDrawer.listItems.settings")}
                    icon={<Settings size={20} />}
                    tooltip={collapsed}
                  />
                )}
              />
            )}
            {user.super && (
              <ListItemLink
                to="/companies"
                primary={i18n.t("mainDrawer.listItems.companies")}
                icon={<Building size={20} />}
                tooltip={collapsed}
              />
            )}
          </>
        )}
      />
      {!collapsed && (
        <React.Fragment>
          <Divider />
          <Typography
            style={{
              fontSize: "12px",
              padding: "10px",
              textAlign: "center",
              fontWeight: "bold",
              color: theme.palette.grey[600],
            }}
          >
            {`v.3.6.0`}
          </Typography>
        </React.Fragment>
      )}
    </div>
  );
};

export default MainListItems;