import SVGBussola from "../services/svg/SVGbussola";
import SVGMapa from "../services/svg/SVGmapa";
import { useState, useEffect, useMemo } from "react";
import { db } from "../firebase"; // ajuste o caminho conforme seu projeto

import { AppToastMensagem, AppToastConfirmacao } from "../components/common/toast";

import SVGElemento from "../services/svg/SVGelemento";
import ToolBar from "../components/common/ToolBar";

import { useCrudUI } from "../services/ui/crudUI";
import { canteirosService } from "../services/crud/canteirosService";
import { plantasService } from "../services/crud/plantasService";
import CanteirosModal from "../components/canteiros/CanteirosModal";
import AcaoCanteiroOffcanvas from "../components/canteiros/AcaoCanteiroOffcanvas";
import AcaoPlantaOffcanvas from "../components/plantas/AcaoPlantaOffcanvas";
import PlantasModal from "../components/plantas/plantasModal";


export default function Mapa({ user, hortaId }) {  

  const [horta, setHorta] = useState(null);
  const [canteiros, setCanteiros] = useState([]);
  const [plantas, setPlantas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [northUp, setNorthUp] = useState(true);
  const [mapMode, setMapMode] = useState("edit"); // edit | pan | zoom | drag
  const [mapDrag, setMapDrag] = useState(null);
  const [activeTool, setActiveTool] = useState(null);


  const [selecionado, setSelecionado] = useState(null);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showToastMensagem, setShowToastMensagem] = useState(false);
  const [showToastConfirmacao, setShowToastConfirmacao] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  /* ================== CARREGAR DADOS ================== */
  useEffect(() => {
      if (!hortaId) return;
      const unsubscribe = db
      .doc(`hortas/${hortaId}`)
      .onSnapshot(doc => {
          if (doc.exists) {
          setHorta({ id: doc.id, ...doc.data() });
          setLoading(false);
          }
      });
  
      return unsubscribe;
  }, [hortaId]);

  useEffect(() => {
    if (!hortaId) return;

    const filtroCanteiros = [
      {field: "isDeleted", op: "==", value: false},
    ]
    const unsub = canteirosService.forParent(hortaId).subscribe(setCanteiros,filtroCanteiros);
    return unsub;
  }, [hortaId]);

  useEffect(() => {
    if (!hortaId) return;

    const filtroPlantas = [
      {field: "isDeleted", op: "==", value: false},
      {field: "hortaId", op: "==", value: hortaId},
    ]
    const unsub = plantasService.subscribe(setPlantas,filtroPlantas);
    return unsub;
  }, [hortaId]);


  /* ================= TOAST/MODAL/OFFCANVAS ================= */
  const showToast = (msg, variant = "success", confirmacao = false) => {
    setToastMsg(msg);
    setToastVariant(variant);
    setShowToastMensagem(!confirmacao);
    setShowToastConfirmacao(confirmacao);
  };

  const confirmarExclusao = (data) => {
    setRegistroParaExcluir(data);
    showToast(`Confirma a exclusão de ${selecionado.tipo} ${data.nome}?`, "danger", true, apagar);
  };
  
  const cancelarExclusao = () => {
    setRegistroParaExcluir(null);
    setShowToastConfirmacao(false);
  };

  const fecharOffcanvas = () => {
    setSelecionado(null);
    setActiveTab(null);
  }

  const abrirModal = (data) => {
    setSelecionado(prev => ({ ...prev, data }));
    setShowModal(true);
  }

  /* ================= CRUDS ================= */
  const crudCanteiro = useCrudUI({
    crudService: canteirosService.forParent(hortaId),
    nomeEntidade: "canteiro",
    masculino: true, // "a característica de planta"
    user,
  
    editando: selecionado?.data,
    setEditando: selecionado?.tipo === "canteiro" ? selecionado.data : null,
    setShowModal,
    registroParaExcluir,
    cancelarExclusao,
  
    showToast,
  });
  const crudPlanta = useCrudUI({
    crudService: plantasService,
    nomeEntidade: "planta",
    masculino: false,
    user,
  
    editando: selecionado?.tipo === "planta" ? selecionado.data : null,
    setEditando: setSelecionado,
    setShowModal,
    registroParaExcluir,
    cancelarExclusao,
  
    showToast,
  });

  const crudAtivo =
  selecionado?.tipo === "planta"
    ? crudPlanta
    : crudCanteiro;
  const { criar, editar, atualizar, apagar } = crudAtivo;

  /* ================== CLICK HANDLERS ================== */
  const onClickCanteiro = (data) => {
    setSelecionado({tipo: "canteiro", data});
  };
  const onClickPlanta = (data) => {
    setSelecionado({tipo: "planta", data});
  };

  /* ================== DRAG HANDLERS ================== */
  const novoCanteiroRetangular = (data) => {
    
    const novoCanteiro = {
      nome: "Novo Canteiro",
      descricao: "Criado a partir do mapa",
      posicao: {
        x: Math.round(data.x),
        y: Math.round(data.y),
      },
      dimensao: {
        x: Math.round(data.width),
        y: Math.round(data.height),
      }
    }
    setActiveTool(null);
    setMapMode("edit");
    editar(novoCanteiro);
    //TODO: Esses dados fazem com que o CRUD tente fazer um update, quando não há documento para atualizar.
  }
  const novoCanteiroCircular = (data) => {
    const novoCanteiro = {
      nome: "Novo Canteiro",
      posicao: {
        x: data.x,
        y: data.y,
      },
      dimensao: {
        x: data.width,
        y: data.height,
      },
      aparencia: {
        elipse: true,
      }
    }
    setActiveTool(null);
    setMapMode("edit");
    editar(novoCanteiro);
  }


  /* ================== LOADING ================== */
  if (!hortaId) {
    return <div>Nada por aqui :'{"("}</div>;
  }
  if (loading || !horta) {
    return <div>Carregando horta...</div>;
  }

  const tools = [
    // MOUSE WHEEL
    { id: "zoom",
      label: "🔎",
      toggle: mapMode === "zoom",
      onClick: ()=>{setMapMode(activeTool === "zoom" ? "edit" : "zoom"); setActiveTool(activeTool === "zoom" ? null : "zoom")},
    },
    // MOUSE DRAG
    { id: "pan",
      label: "🖐️",
      toggle: mapMode === "pan",
      onClick: ()=>{setMapMode(activeTool === "pan" ? "edit" : "pan");  setActiveTool(activeTool === "pan" ? null : "pan")},
    },
    { id: "retangulo",
      label: "▭",
      onClick: ()=>{
        setMapMode("drag");
        setMapDrag({
          onDrag: (a)=>novoCanteiroRetangular(a),
          preview: "rect",
          limit: true,
        });
        setActiveTool("retangulo");
      },
    },
    { id: "circulo",
      label: "◯",
      onClick: ()=>{
        setMapMode("drag");
        setMapDrag({
          onDrag: (a)=>novoCanteiroCircular(a),
          preview: "circle",
        })
        setActiveTool("circulo");
      },
    },
  ];

  return (
    <div
      style={{
        position: "relative",   // para a bússola ficar relativa a esta div
        width: "100vw",
        height: "100vh",
        overflow: "auto",       // scroll vertical e horizontal
        background: "#f0f0f0",
      }}
    >
      {/* Barra de Ferramentas */}
      <ToolBar
        tools={tools}
        activeTool={activeTool}
      />

      
      {/* Conteúdo SVG (horta) */}
      <SVGMapa 
        vertices={horta.aparencia.vertices}
        orientacao={northUp ? horta.orientacao : 0}
        grid={[100]}
        mode={mapMode}
        drag={mapMode === "drag" ? mapDrag : null}
      >
        {/* Canteiros */}
        {canteiros.map(c=>(
            <SVGElemento key ={c.id} item={c} onClick={mapMode === "edit" ? onClickCanteiro : ()=>{}} />
        ))}
        {/* Canteiros */}
        {plantas.map(c=>(
            <SVGElemento key ={c.id} item={c} onClick={mapMode === "edit" ? onClickPlanta : ()=>{}} />
        ))}

        </SVGMapa>

      {/* Bússola fixa */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 16,
          width: 80,
          height: 80,
        }}
      >
        <SVGBussola diametro={80} orientacao={northUp ? 0 : 360 - horta.orientacao} onClick={()=>setNorthUp(!northUp)}/>
      </div>

      {/* ================= OFFCANVAS ================= */}
      {selecionado?.tipo === "canteiro" && (
        <AcaoCanteiroOffcanvas
          show
          data={selecionado.data}
          activeTab={activeTab || "design"}
          onTabChange={setActiveTab}
          onClose={fecharOffcanvas}
          onModeChange={setMapMode}
          onEdit={abrirModal}
        />
      )}

      {selecionado?.tipo === "planta" && (
        <AcaoPlantaOffcanvas
          show
          data={selecionado.data}
          activeTab={activeTab || "design"}
          onTabChange={setActiveTab}
          onClose={fecharOffcanvas}
          onModeChange={setMapMode}
          onEdit={abrirModal}
        />
      )}

      {/* ================= MODAL ================= */}
      {selecionado?.tipo === "canteiro" && (
        <CanteirosModal
          restrito={true}
          show={showModal}
          data={selecionado.data}
          onClose={() => setShowModal(false)}
          onSave={(data) => { atualizar(data); setShowModal(false); }}
        />
      )}
      {selecionado?.tipo === "planta" && (
        <PlantasModal
          restrito
          show={showModal}
          data={selecionado.data}
          onClose={() => setShowModal(false)}
          onSave={(data) => {
            atualizar(data);
            setShowModal(false);
          }}
        />
      )}
      {/* ================= TOASTS ================= */}
      <AppToastMensagem
        show={showToastMensagem}
        onClose={() => setShowToastMensagem(false)}
        message={toastMsg}
        variant={toastVariant}
      />

      <AppToastConfirmacao
        show={showToastConfirmacao}
        onCancel={cancelarExclusao}
        onConfirm={apagar}
        message={toastMsg}
        variant={toastVariant}
      />

    </div>
  );
}