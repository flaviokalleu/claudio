import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
  useCallback,
} from "react";
import { SiOpenai } from "react-icons/si";
import typebotIcon from "../../assets/typebot-ico.png";
import { HiOutlinePuzzle } from "react-icons/hi";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import audioNode from "./nodes/audioNode";
import typebotNode from "./nodes/typebotNode";
import openaiNode from "./nodes/openaiNode";
import messageNode from "./nodes/messageNode.js";
import startNode from "./nodes/startNode";
import menuNode from "./nodes/menuNode";
import intervalNode from "./nodes/intervalNode";
import imgNode from "./nodes/imgNode";
import randomizerNode from "./nodes/randomizerNode";
import videoNode from "./nodes/videoNode";
import questionNode from "./nodes/questionNode";
import api from "../../services/api";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Stack,
  Typography,
} from "@mui/material";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import { Box, CircularProgress } from "@material-ui/core";
import BallotIcon from "@mui/icons-material/Ballot";
import "reactflow/dist/style.css";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "react-flow-renderer";
import FlowBuilderAddTextModal from "../../components/FlowBuilderAddTextModal";
import FlowBuilderIntervalModal from "../../components/FlowBuilderIntervalModal";
import FlowBuilderConditionModal from "../../components/FlowBuilderConditionModal";
import FlowBuilderMenuModal from "../../components/FlowBuilderMenuModal";
import {
  AccessTime,
  CallSplit,
  DynamicFeed,
  Image,
  ImportExport,
  LibraryBooks,
  Message,
  MicNone,
  RocketLaunch,
  Videocam,
} from "@mui/icons-material";
import RemoveEdge from "./nodes/removeEdge";
import FlowBuilderAddImgModal from "../../components/FlowBuilderAddImgModal";
import FlowBuilderTicketModal from "../../components/FlowBuilderAddTicketModal";
import FlowBuilderAddAudioModal from "../../components/FlowBuilderAddAudioModal";
import { useNodeStorage } from "../../stores/useNodeStorage";
import FlowBuilderRandomizerModal from "../../components/FlowBuilderRandomizerModal";
import FlowBuilderAddVideoModal from "../../components/FlowBuilderAddVideoModal";
import FlowBuilderSingleBlockModal from "../../components/FlowBuilderSingleBlockModal";
import singleBlockNode from "./nodes/singleBlockNode";
import { colorPrimary } from "../../styles/styles";
import ticketNode from "./nodes/ticketNode";
import { ConfirmationNumber } from "@material-ui/icons";
import FlowBuilderTypebotModal from "../../components/FlowBuilderAddTypebotModal";
import FlowBuilderOpenAIModal from "../../components/FlowBuilderAddOpenAIModal";
import FlowBuilderAddQuestionModal from "../../components/FlowBuilderAddQuestionModal";

// Estilos futuristas
const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    position: "relative",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", // Fundo gradiente escuro
    overflowY: "scroll",
    borderRadius: "15px",
    boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)", // Efeito neon
    ...theme.scrollbarStyles,
  },
  speeddial: {
    "& .MuiSpeedDial-fab": {
      backgroundColor: "#00d42f", // Cor neon
      borderRadius: "50%", // Botão completamente arredondado
      boxShadow: "0 0 15px rgba(0, 212, 255, 0.7)",
      "&:hover": {
        backgroundColor: "#00b4d8",
        boxShadow: "0 0 25px rgba(0, 212, 255, 1)",
        transition: "all 0.3s ease",
      },
    },
  },
  button: {
    borderRadius: "25px", // Botões arredondados
    backgroundColor: "#0f3460", // Cor escura com tom futurista
    color: "#e94560", // Texto neon
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
    "&:hover": {
      backgroundColor: "#1f5a92",
      boxShadow: "0 0 20px rgba(26, 26, 26, 0.8)",
      transition: "all 0.3s ease",
    },
  },
}));

function geraStringAleatoria(tamanho) {
  var stringAleatoria = "";
  var caracteres =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < tamanho; i++) {
    stringAleatoria += caracteres.charAt(
      Math.floor(Math.random() * caracteres.length)
    );
  }
  return stringAleatoria;
}

const nodeTypes = {
  message: messageNode,
  start: startNode,
  menu: menuNode,
  interval: intervalNode,
  img: imgNode,
  audio: audioNode,
  randomizer: randomizerNode,
  video: videoNode,
  singleBlock: singleBlockNode,
  ticket: ticketNode,
  typebot: typebotNode,
  openai: openaiNode,
  question: questionNode,
};

const edgeTypes = {
  buttonedge: RemoveEdge,
};

const initialNodes = [
  {
    id: "1",
    position: { x: 250, y: 100 },
    data: { label: "Inicio do fluxo" },
    type: "start",
    style: {
      backgroundColor: "#0f3460",
      borderRadius: "12px",
      boxShadow: "0 0 15px rgba(0, 255, 255, 0.5)",
      padding: 10,
    },
  },
];

const initialEdges = [];

export const FlowBuilderConfig = () => {
  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams();

  const storageItems = useNodeStorage();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [dataNode, setDataNode] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [modalAddText, setModalAddText] = useState(null);
  const [modalAddInterval, setModalAddInterval] = useState(false);
  const [modalAddMenu, setModalAddMenu] = useState(null);
  const [modalAddImg, setModalAddImg] = useState(null);
  const [modalAddAudio, setModalAddAudio] = useState(null);
  const [modalAddRandomizer, setModalAddRandomizer] = useState(null);
  const [modalAddVideo, setModalAddVideo] = useState(null);
  const [modalAddSingleBlock, setModalAddSingleBlock] = useState(null);
  const [modalAddTicket, setModalAddTicket] = useState(null);
  const [modalAddTypebot, setModalAddTypebot] = useState(null);
  const [modalAddOpenAI, setModalAddOpenAI] = useState(null);
  const [modalAddQuestion, setModalAddQuestion] = useState(null);

  const connectionLineStyle = {
    stroke: "url(#electric-gradient)", // Gradiente simulando eletricidade
    strokeWidth: "4px",
    animation: "electricFlow 2s infinite linear",
  };

  const addNode = (type, data) => {
    const posY = nodes[nodes.length - 1].position.y;
    const posX =
      nodes[nodes.length - 1].position.x + nodes[nodes.length - 1].width + 40;
    const nodeStyle = {
      backgroundColor: "#0f3460",
      borderRadius: "12px",
      boxShadow: "0 0 15px rgba(0, 255, 255, 0.5)",
      padding: 10,
    };

    if (type === "start") {
      return setNodes((old) => {
        return [
          {
            id: "1",
            position: { x: posX, y: posY },
            data: { label: "Inicio do fluxo" },
            type: "start",
            style: nodeStyle,
          },
        ];
      });
    }
    if (type === "text") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { label: data.text },
            type: "message",
            style: nodeStyle,
          },
        ];
      });
    }
    if (type === "interval") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { label: `Intervalo ${data.sec} seg.`, sec: data.sec },
            type: "interval",
            style: nodeStyle,
          },
        ];
      });
    }
    if (type === "condition") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: {
              key: data.key,
              condition: data.condition,
              value: data.value,
            },
            type: "condition",
            style: nodeStyle,
          },
        ];
      });
    }
    if (type === "menu") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: {
              message: data.message,
              arrayOption: data.arrayOption,
            },
            type: "menu",
            style: nodeStyle,
          },
        ];
      });
    }
    if (type === "img") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { url: data.url },
            type: "img",
            style: nodeStyle,
          },
        ];
      });
    }
    if (type === "audio") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { url: data.url, record: data.record },
            type: "audio",
            style: nodeStyle,
          },
        ];
      });
    }
    if (type === "randomizer") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { percent: data.percent },
            type: "randomizer",
            style: nodeStyle,
          },
        ];
      });
    }
    if (type === "video") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { url: data.url },
            type: "video",
            style: nodeStyle,
          },
        ];
      });
    }
    if (type === "singleBlock") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { ...data },
            type: "singleBlock",
            style: nodeStyle,
          },
        ];
      });
    }
    if (type === "ticket") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { ...data },
            type: "ticket",
            style: nodeStyle,
          },
        ];
      });
    }
    if (type === "typebot") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { ...data },
            type: "typebot",
            style: nodeStyle,
          },
        ];
      });
    }
    if (type === "openai") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { ...data },
            type: "openai",
            style: nodeStyle,
          },
        ];
      });
    }
    if (type === "question") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { ...data },
            type: "question",
            style: nodeStyle,
          },
        ];
      });
    }
  };

  const textAdd = (data) => {
    addNode("text", data);
  };

  const intervalAdd = (data) => {
    addNode("interval", data);
  };

  const conditionAdd = (data) => {
    addNode("condition", data);
  };

  const menuAdd = (data) => {
    addNode("menu", data);
  };

  const imgAdd = (data) => {
    addNode("img", data);
  };

  const audioAdd = (data) => {
    addNode("audio", data);
  };

  const randomizerAdd = (data) => {
    addNode("randomizer", data);
  };

  const videoAdd = (data) => {
    addNode("video", data);
  };

  const singleBlockAdd = (data) => {
    addNode("singleBlock", data);
  };

  const ticketAdd = (data) => {
    addNode("ticket", data);
  };

  const typebotAdd = (data) => {
    addNode("typebot", data);
  };

  const openaiAdd = (data) => {
    addNode("openai", data);
  };

  const questionAdd = (data) => {
    addNode("question", data);
  };

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get(`/flowbuilder/flow/${id}`);
          if (data.flow.flow !== null) {
            const flowNodes = data.flow.flow.nodes;
            setNodes(flowNodes);
            setEdges(data.flow.flow.connections);
            const filterVariables = flowNodes.filter(
              (nd) => nd.type === "question"
            );
            const variables = filterVariables.map(
              (variable) => variable.data.typebotIntegration.answerKey
            );
            localStorage.setItem("variables", JSON.stringify(variables));
          }
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [id]);

  useEffect(() => {
    if (storageItems.action === "delete") {
      setNodes((old) => old.filter((item) => item.id !== storageItems.node));
      setEdges((old) => {
        const newData = old.filter((item) => item.source !== storageItems.node);
        const newClearTarget = newData.filter(
          (item) => item.target !== storageItems.node
        );
        return newClearTarget;
      });
      storageItems.setNodesStorage("");
      storageItems.setAct("idle");
    }
    if (storageItems.action === "duplicate") {
      const nodeDuplicate = nodes.filter(
        (item) => item.id === storageItems.node
      )[0];
      const maioresX = nodes.map((node) => node.position.x);
      const maiorX = Math.max(...maioresX);
      const finalY = nodes[nodes.length - 1].position.y;
      const nodeNew = {
        ...nodeDuplicate,
        id: geraStringAleatoria(30),
        position: {
          x: maiorX + 240,
          y: finalY,
        },
        selected: false,
        style: {
          backgroundColor: "#0f3460",
          padding: 10,
          borderRadius: "12px",
          boxShadow: "0 0 15px rgba(0, 255, 255, 0.5)",
        },
      };
      setNodes((old) => [...old, nodeNew]);
      storageItems.setNodesStorage("");
      storageItems.setAct("idle");
    }
  }, [storageItems.action]);

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

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, type: "buttonedge", style: connectionLineStyle }, eds)
      ),
    [setEdges]
  );

  const saveFlow = async () => {
    await api
      .post("/flowbuilder/flow", {
        idFlow: id,
        nodes: nodes,
        connections: edges,
      })
      .then((res) => {
        toast.success("Fluxo salvo com sucesso");
      });
  };

  const doubleClick = (event, node) => {
    setDataNode(node);
    if (node.type === "message") {
      setModalAddText("edit");
    }
    if (node.type === "interval") {
      setModalAddInterval("edit");
    }
    if (node.type === "menu") {
      setModalAddMenu("edit");
    }
    if (node.type === "img") {
      setModalAddImg("edit");
    }
    if (node.type === "audio") {
      setModalAddAudio("edit");
    }
    if (node.type === "randomizer") {
      setModalAddRandomizer("edit");
    }
    if (node.type === "singleBlock") {
      setModalAddSingleBlock("edit");
    }
    if (node.type === "ticket") {
      setModalAddTicket("edit");
    }
    if (node.type === "typebot") {
      setModalAddTypebot("edit");
    }
    if (node.type === "openai") {
      setModalAddOpenAI("edit");
    }
    if (node.type === "question") {
      setModalAddQuestion("edit");
    }
  };

  const clickNode = (event, node) => {
    setNodes((old) =>
      old.map((item) => {
        if (item.id === node.id) {
          return {
            ...item,
            style: {
              backgroundColor: "#1f5a92",
              padding: 10,
              borderRadius: "12px",
              boxShadow: "0 0 20px rgba(0, 212, 255, 0.8)",
            },
          };
        }
        return {
          ...item,
          style: {
            backgroundColor: "#0f3460",
            padding: 10,
            borderRadius: "12px",
            boxShadow: "0 0 15px rgba(0, 255, 255, 0.5)",
          },
        };
      })
    );
  };

  const clickEdge = (event, node) => {
    setNodes((old) =>
      old.map((item) => {
        return {
          ...item,
          style: {
            backgroundColor: "#0f3460",
            padding: 10,
            borderRadius: "12px",
            boxShadow: "0 0 15px rgba(0, 255, 255, 0.5)",
          },
        };
      })
    );
  };

  const updateNode = (dataAlter) => {
    setNodes((old) =>
      old.map((itemNode) => {
        if (itemNode.id === dataAlter.id) {
          return dataAlter;
        }
        return itemNode;
      })
    );
    setModalAddText(null);
    setModalAddInterval(null);
    setModalAddMenu(null);
    setModalAddOpenAI(null);
    setModalAddTypebot(null);
  };

  const actions = [
    {
      icon: <RocketLaunch sx={{ color: "#3ABA38" }} />,
      name: "Inicio",
      type: "start",
    },
    {
      icon: <LibraryBooks sx={{ color: "#EC5858" }} />,
      name: "Conteúdo",
      type: "content",
    },
    {
      icon: <DynamicFeed sx={{ color: "#683AC8" }} />,
      name: "Menu",
      type: "menu",
    },
    {
      icon: <CallSplit sx={{ color: "#1FBADC" }} />,
      name: "Randomizador",
      type: "random",
    },
    {
      icon: <AccessTime sx={{ color: "#F7953B" }} />,
      name: "Intervalo",
      type: "interval",
    },
    {
      icon: <ConfirmationNumber sx={{ color: "#F7953B" }} />,
      name: "Ticket",
      type: "ticket",
    },
    {
      icon: (
        <Box
          component="img"
          sx={{ width: 24, height: 24, color: "#3aba38" }}
          src={typebotIcon}
          alt="icon"
        />
      ),
      name: "TypeBot",
      type: "typebot",
    },
    {
      icon: <SiOpenai sx={{ color: "#F7953B" }} />,
      name: "OpenAI",
      type: "openai",
    },
    {
      icon: <BallotIcon sx={{ color: "#F7953B" }} />,
      name: "Pergunta",
      type: "question",
    },
  ];

  const clickActions = (type) => {
    switch (type) {
      case "start":
        addNode("start");
        break;
      case "menu":
        setModalAddMenu("create");
        break;
      case "content":
        setModalAddSingleBlock("create");
        break;
      case "random":
        setModalAddRandomizer("create");
        break;
      case "interval":
        setModalAddInterval("create");
        break;
      case "ticket":
        setModalAddTicket("create");
        break;
      case "typebot":
        setModalAddTypebot("create");
        break;
      case "openai":
        setModalAddOpenAI("create");
        break;
      case "question":
        setModalAddQuestion("create");
        break;
      default:
        break;
    }
  };

  return (
    <Stack sx={{ height: "100vh" }}>
      <FlowBuilderAddTextModal
        open={modalAddText}
        onSave={textAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddText}
      />
      <FlowBuilderIntervalModal
        open={modalAddInterval}
        onSave={intervalAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddInterval}
      />
      <FlowBuilderMenuModal
        open={modalAddMenu}
        onSave={menuAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddMenu}
      />
      <FlowBuilderAddImgModal
        open={modalAddImg}
        onSave={imgAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddImg}
      />
      <FlowBuilderAddAudioModal
        open={modalAddAudio}
        onSave={audioAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddAudio}
      />
      <FlowBuilderRandomizerModal
        open={modalAddRandomizer}
        onSave={randomizerAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddRandomizer}
      />
      <FlowBuilderAddVideoModal
        open={modalAddVideo}
        onSave={videoAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddVideo}
      />
      <FlowBuilderSingleBlockModal
        open={modalAddSingleBlock}
        onSave={singleBlockAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddSingleBlock}
      />
      <FlowBuilderTicketModal
        open={modalAddTicket}
        onSave={ticketAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddTicket}
      />
      <FlowBuilderOpenAIModal
        open={modalAddOpenAI}
        onSave={openaiAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddOpenAI}
      />
      <FlowBuilderTypebotModal
        open={modalAddTypebot}
        onSave={typebotAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddTypebot}
      />
      <FlowBuilderAddQuestionModal
        open={modalAddQuestion}
        onSave={questionAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddQuestion}
      />

      <MainHeader>
        <Title
          style={{
            color: "#00d4ff",
            textShadow: "0 0 10px rgba(0, 212, 255, 0.7)",
          }}
        >
          Desenhe seu fluxo
        </Title>
      </MainHeader>
      {!loading && (
        <Paper
          className={classes.mainPaper}
          variant="outlined"
          onScroll={handleScroll}
        >
          <svg style={{ position: "absolute", width: 0, height: 0 }}>
            <defs>
              <linearGradient id="electric-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: "#00d4ff", stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: "#e94560", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "#00d4ff", stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg>
          <Stack>
            <SpeedDial
              ariaLabel="SpeedDial futuristic"
              sx={{ position: "absolute", top: 16, left: 16 }}
              className={classes.speeddial}
              icon={<SpeedDialIcon />}
              direction={"down"}
            >
              {actions.map((action) => (
                <SpeedDialAction
                  key={action.name}
                  icon={action.icon}
                  tooltipTitle={action.name}
                  tooltipOpen
                  tooltipPlacement={"right"}
                  onClick={() => clickActions(action.type)}
                />
              ))}
            </SpeedDial>
          </Stack>
          <Stack
            sx={{
              position: "absolute",
              justifyContent: "center",
              flexDirection: "row",
              width: "100%",
            }}
          >
            <Typography
              style={{
                color: "#00d4ff",
                textShadow: "0 0 10px rgba(0, 212, 255, 0.7)",
              }}
            >
              Não se esqueça de salvar seu fluxo!
            </Typography>
          </Stack>
          <Stack direction={"row"} justifyContent={"end"}>
            <Button
              className={classes.button}
              variant="contained"
              onClick={() => saveFlow()}
            >
              Salvar
            </Button>
          </Stack>

          <Stack
            direction={"row"}
            style={{
              width: "100%",
              height: "90%",
              position: "relative",
              display: "flex",
            }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              deleteKeyCode={["Backspace", "Delete"]}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeDoubleClick={doubleClick}
              onNodeClick={clickNode}
              onEdgeClick={clickEdge}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              connectionLineStyle={connectionLineStyle}
              edgeTypes={edgeTypes}
              defaultEdgeOptions={{
                style: connectionLineStyle,
                animated: true,
              }}
            >
              <Controls />
              <MiniMap />
              <Background variant="dots" gap={12} size={1} color="#00d4ff" />
            </ReactFlow>

            <Stack
              style={{
                backgroundColor: "#1a1a2e",
                height: "20px",
                width: "58px",
                position: "absolute",
                bottom: 0,
                right: 0,
                zIndex: 1111,
              }}
            />
          </Stack>
        </Paper>
      )}
      {loading && (
        <Stack justifyContent={"center"} alignItems={"center"} height={"70vh"}>
          <CircularProgress />
        </Stack>
      )}
      <style>
        {`
          @keyframes electricFlow {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: 100; }
          }
        `}
      </style>
    </Stack>
  );
};