import SVGBussola from "../../services/svg/SVGbussola";
import SVGMapa from "../../services/svg/SVGmapa";
import { useState, useEffect,  } from "react";
import { db, timestamp } from "../../firebase"; // ajuste o caminho conforme seu projeto

import { AppToastMensagem, AppToastConfirmacao } from "../../components/common/toast";

import SVGEntidade from "../../services/svg/SVGelemento";

import { canteirosService } from "../../services/crud/canteirosService";
import { plantasService } from "../../services/crud/plantasService";
import { NoUser } from "../../components/common/NoUser";
import { useAuth } from "../../services/auth/authContext";

import CanteiroModal from "../../components/canteiros/CanteiroModal";
import PlantaModal from "../../components/plantas/plantaModal";
import AcaoOffcanvas from "../../components/actions/AcaoOffcanvas";
import PlantarOffcanvas from "../../components/actions/PlantarOffcanvas";
import { SVGPreview } from "../../services/svg/SVGPreview";
import { getBoundingBox, getMapPointFromPoint, } from "../../services/svg/useMapTransform";
import { plantarVariedade } from "../../domain/planta.rules";
import { eventosService, } from "../../services/crud/eventosService";
import CanteiroCustomTab from "../../components/actions/CanteiroCustomTab";
import { Tab } from "react-bootstrap";
import { montarLogEvento } from "../../domain/evento.rules";
import { criarCanteiro } from "../../domain/canteiro.rules";
import { MapaProvider } from "./MapaContexto";


/**
 * - carregar dados (horta, canteiros, plantas)
- regras de domínio (plantar, criar canteiro, eventos)
- modais
- offcanvas
- toast
- auth
 */

export default function Mapa({ hortaId }) {
  const { user } = useAuth();
  if (!user) return <NoUser />;

  const [horta, setHorta] = useState(null);
  const [canteiros, setCanteiros] = useState([]);
  const [plantas, setPlantas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modo, setModo] = useState("edit");                 // edit | plant | draw
  const [configPlantio, setConfigPlantio] = useState(null); // config plantar
  const [showPlantar, setShowPlantar] = useState(null);     // show offcanvas plantar
  const [showEditModal, setShowEditModal] = useState(false);// show modal edit


  const [mapPreview, setMapPreview] = useState(false);      // o que fazer no preview
  const [mapDrag, setMapDrag] = useState(null);             // o que fazer no drag
  const [hasZooming, setHasZooming] = useState(true);
  const [gridArray, setGridArray] = useState([]);           // array com os tamanhos dos grids
  /**/const [view, setView] = useState({
    x: 0,
    y: 0,
    offset: {
      x: 0,
      y: 0,
    },
    rotate: 0,
    scale: 1,
  });
  const [mapWorld, setMapWorld] = useState(null);

  const [selecao, setSelecao] = useState([]);
  const [activeTab, setActiveTab] = useState(null);

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

  /* ================== CALCULA MAPA ================== */
  useEffect(() => {
    if (!horta?.aparencia?.vertices?.length) return;

    const bbox = getBoundingBox(horta.aparencia.vertices);
    const diagonal = Math.sqrt(bbox.width ** 2 + bbox.height ** 2);

    const offsetX = (diagonal - bbox.width) / 2 - bbox.minX;
    const offsetY = (diagonal - bbox.height) / 2 - bbox.minY;

    const cX = (diagonal / 2) - offsetX;
    const cY = (diagonal / 2) - offsetY;

    setMapWorld({
      diagonal,
      offsetX,
      offsetY,
      bounds: {
        minX: 0,
        minY: 0,
        maxX: diagonal,
        maxY: diagonal,
      }
    });

    setView(v => ({
      ...v,
      bbox: {
        ...bbox,
        cX,
        cY,
      }
    }));
  }, [horta]);

  /* ================= TOAST/MODAL/OFFCANVAS ================= */
  const showToast = (msg, variant = "success", confirmacao = false) => {
    setToastMsg(msg);
    setToastVariant(variant);
    setShowToastMensagem(!confirmacao);
    setShowToastConfirmacao(confirmacao);
  };

  const confirmarExclusao = () => {
    setShowToastConfirmacao(false);
    try {
      selecao.forEach(async (item) => {
        if (item.tipoEntidadeId === "canteiro") {
          await canteirosService.forParent(horta.id).remove(item.data.id,user);
        }
        if (item.tipoEntidadeId === "planta") {
          await plantasService.remove(item.data.id,user);
        }
      });
      showToast(`Registros apagados com sucesso!`, "success");
    }
    catch (err) {
      console.error(err);
      showToast(`Erro ao apagar: ${err}`, "danger");
    }
    finally {
      setSelecao([]);
      setModo("edit");
    }
  };
  
  const fecharOffcanvas = () => {
    setSelecao([]);
    setActiveTab(null);
  }

  const abrirModal = () => {
    setShowEditModal(true);
  }

  const fecharModal = () => {
    setShowEditModal(false);
  }

  const salvarModal = async (data, tipoEntidadeId) => {
    try {
      if (tipoEntidadeId === "canteiro") {
        if (data.id) {
          await canteirosService.forParent(horta.id).update(data.id, data, user);
          showToast(`Canteiro atualizado com sucesso`);
        } else {
          await canteirosService.forParent(horta.id).create(data, user);
          showToast(`Canteiro criado com sucesso`);
        }
      }
      if (tipoEntidadeId === "planta") {
        if (data.id) {
          await plantasService.update(data.id, data, user);
          showToast(`Planta atualizada com sucesso`);
        } else {
          await plantasService.create(data, user);
          showToast(`Planta criada com sucesso`);
        }
      }
      setSelecao([]);
    } catch (err) {
      console.error("Erro ao salvar alterações:", err);
      showToast(`Erro ao salvar alterações.`, "danger");
    } finally {
      setShowEditModal(false);
    }

      await atualizar(data);
    setModo("edit");
  }

  /* ================= CRUDS ================= */
  const setEditando = (data, tipoEntidadeId) => {
    if (data === null) {
      setSelecao([]);
      return;
    }
    setSelecao(prev => {
      const existe = prev.some(item => item?.data?.id && item.data.id === data.id) ?? false;

      let novoArray;
      if (!existe) {
        // adiciona no final
        novoArray = [{data, tipoEntidadeId}, ...prev,];
      } else {
        // remove
        novoArray = prev.filter(item => item.data.id !== data.id);
      }
      return novoArray;
    });
  }

  /* ================== CLICK HANDLERS ================== */
  const onClickCanteiro = async (data) => {
    // (MODO EDICAO)
    if (modo === "edit") {
      setEditando(data, "canteiro");
      return;
    };
    // MODO PLANTIO
    if (modo === "plant" && configPlantio) {
      // TODO ***
      // Esta função abaixo pode ser generalizada para uma função de criação de entidade.
      // Para isso, eu tenho uma regra para cada tipo de entidade (ex: plantarVariedade),
      // que é passada para a função que cria a entidade e depois cria o evento e registra
      // nas chaves respectivas
      // Ela será repetida na criação de canteiros e, em tese, na criação de outros tipos
      // de entidade dentro da horta.
      let novaPlantaCount = 0;
      const ts = timestamp();
      let batch = db.batch();
      try {
        const alvos = [];
        // Cria as plantas conforme o mapPreview
        for (const ponto of mapPreview.pontos) {
          novaPlantaCount++;
          const novaPlanta = plantarVariedade({
            especie: configPlantio.especie,
            variedade: configPlantio.variedade,
            tecnica: configPlantio.tecnica,
            canteiro: data,
            posicao: ponto,
          })
          novaPlanta.nome = `Nova planta ${novaPlantaCount}`;
          const novaPlantaRef = plantasService.batchCreate(novaPlanta, user, batch);

          // Adiciona a planta aos alvos do evento
          alvos.push(novaPlantaRef.id);
        };
        if (alvos.length === 0) {
          showToast(`Nenhuma planta plantada.`);
          return;
        }

        // Cria o evento
        const evento = montarLogEvento({
          tipoEventoId: "plantio",
          alvos,
          origemId: user.id,
          origemTipo: "usuario",
          data: {
            tipoEntidadeId: "planta",
            tecnicaId: configPlantio.tecnica?.estagioId,
          }
        })

        // Atualiza o evento pelo batch se houver alvos
        if (evento.alvos.length > 0) {
          eventosService.batchCreate(evento, user, batch);
        }
        await batch.commit();
        showToast(`Plantio de ${novaPlantaCount} planta${novaPlantaCount > 1 ? "s" : ""} registrado com sucesso.`);
      }
      catch (err) {
        console.error (err)
        showToast(`Erro ao plantar: ${err}`, "danger")
      }
      finally {
        setModo("edit");
        setConfigPlantio(null);
        return;
      }
    }
    // MODO NÃO CONFIGURADO
    console.log("canteiro", modo, data);
  };
  const onClickPlanta = async (data) => {
    // (MODO EDICAO)
    if (modo === "edit") {
      setEditando(data, "planta");
      return;
    };
    // MODO NÃO CONFIGURADO
    console.log("planta", modo, data);
  };
  const onClickBussola = (prev) => {
    const STEP = 22.5;
    const normalizado = (((prev % 360) + 360) % 360);
    return Math.round(normalizado / STEP) * STEP;
  }
  /* ================== DRAG HANDLERS ================== */
  const novoCanteiro = (data, geometria) => {
    try {
      const novoCanteiro = criarCanteiro({
        horta,
        nome: "Novo Canteiro",
        descricao: "Criado a partir do mapa",
        posicao: {
          x: Math.round(data.x + (data.width/2)),
          y: Math.round(data.y + (data.height/2)),
        },
        dimensao: {
          x: Math.round(data.width),
          y: Math.round(data.height),
        },
        aparencia: {
          geometria: geometria,
        },
      })
      setEditando(novoCanteiro, "canteiro");
      setShowEditModal(true);
    } catch (err) {
      console.error(err);
      showToast(`Erro ao criar canteiro.`, "danger");
    }
  }


  /* ================== HOVER HANDLERS ================= */
const onHoverCanteiro = (canteiro, evt) => {
  if (modo !== 'plant' || !configPlantio) return;

  function calcularGridPlantio(config, mousePos) {
    const { linhas, colunas, espacamentoLinha, espacamentoColuna } = config.layout;
    const pontos = [];
    const espacamentoColunaScaled = espacamentoColuna * view.scale;
    const espacamentoLinhaScaled = espacamentoLinha * view.scale;

    // centro do mouse relativo ao canteiro
    const baseX = mousePos.x;
    const baseY = mousePos.y;

    // deslocamento para centralizar o grid no mouse
    const offsetX = (colunas * espacamentoColunaScaled) / 2;
    const offsetY = (linhas * espacamentoLinhaScaled) / 2;
    // ponto inicial do grid
    const startX = baseX - offsetX + espacamentoColunaScaled / 2;
    const startY = baseY - offsetY + espacamentoLinhaScaled / 2;
    // monta o grid
    for (let l = 0; l < linhas; l++) {
      for (let c = 0; c < colunas; c++) {
        pontos.push(getMapPointFromPoint({
          x: startX + c * espacamentoColunaScaled,
          y: startY + l * espacamentoLinhaScaled,
        },view,mapWorld));
      }
    }
    return pontos;
}
  // posição do mouse no SVG
  const svg = evt.target.ownerSVGElement;
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  const cursor = pt.matrixTransform(svg.getScreenCTM().inverse());
  const pontos = calcularGridPlantio(configPlantio, cursor);

  setMapPreview({
    radius: 5,
    fill: "red",
    canteiroId: canteiro.id,
    pontos
  });
};

const onLeaveCanteiro = () => {
  setMapPreview(null);
};

  /* ================== LOADING ================== */
  if (!hortaId) {
    return <div>Nada por aqui :'{"("}</div>;
  }
  if (loading || !horta) {
    return <div>Carregando horta...</div>;
  }

  const customTabsObs = {
    canteiro: <Tab eventKey="custom" title="Canteiro">
      <CanteiroCustomTab
        entidade={selecao?.data}
        showToast={showToast}
      />
      </Tab>,
    planta: <></>,
  }
  const renderArrCanteiros = canteiros // aplicar filtros
  const renderArrPlantas = plantas     // aplicar filtros

  if (!mapWorld) return null;
  return (
    <MapaProvider>

    <div
      style={{
        position: "relative",   // para a bússola ficar relativa a esta div
        width: "100vw",
        height: "100vh",
        overflow: "auto",       // scroll vertical e horizontal
        background: "#f0f0f0",
      }}
    >


      
      {/* Conteúdo SVG (horta) */}
      <SVGMapa 
        vertices={horta.aparencia.vertices}
        mapWorld={mapWorld}
        view={view}
        setView={setView}
        hasPanning={modo !== "draw"}
        hasZooming={hasZooming}
        grid={gridArray}
        drag={modo === "draw" ? mapDrag : null}
      >
        {/* Canteiros */}
        {renderArrCanteiros.map(c=>(
            <SVGEntidade
              key={c.id}
              item={c}
              onClick={onClickCanteiro}
              onMouseMove ={onHoverCanteiro}
              onMouseLeave={onLeaveCanteiro}
              destaque={selecao.some(s=>s.data.id === c.id)}
            />
        ))}
        {/* Plantas */}
        {renderArrPlantas.map(c=>(
            <SVGEntidade
              key={c.id}
              item={c}
              onClick={onClickPlanta}
              destaque={selecao.some(s=>s.data.id === c.id)}
            />
        ))}
        {/* Preview */}
        {modo === "plant" &&
        <SVGPreview
          preview={mapPreview}
          view={view}
        />}

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
        <SVGBussola
          diametro={80}
          orientacao={view.rotate}
          onLeftClick={()=>setView(prev => ({...prev, rotate: onClickBussola(prev.rotate + 22.5)}))}
          onRightClick={()=>setView(prev => ({...prev, rotate: onClickBussola(prev.rotate - 22.5)}))}
          onDoubleClick={()=>setView(prev => ({...prev, rotate: 0}))}
        />
      </div>

      {/* ================= OFFCANVAS ================= */}
        <AcaoOffcanvas
          show = {selecao.length > 0 && modo === 'edit'}
          entidade={selecao[0]?.data}
          tipoEntidadeId={selecao[0]?.tipoEntidadeId}
          activeTab={activeTab || "design"}
          onTabChange={setActiveTab}
          onClose={fecharOffcanvas}
          onEdit={abrirModal}
          user={user}
          showToast={showToast}
          customTabs={customTabsObs[selecao.length > 0 ? selecao[0].tipoEntidadeId : <></>]}
        />
        <PlantarOffcanvas
          show={showPlantar}
          onClose={() => setShowPlantar(false)}
          onConfirm={(config) => {
            setConfigPlantio(config);
            setModo("plant");
          }}
        />

      {/* ================= MODAL ================= */}
      {selecao.length > 0 && selecao[0].tipoEntidadeId === "canteiro" && (
        <CanteiroModal
          restrito={true}
          show={showEditModal}
          data={selecao[0].data}
          onClose={fecharModal}
          onSave={salvarModal}
        />
      )}
      {selecao.length > 0 && selecao[0].tipoEntidadeId === "planta" && (
        <PlantaModal
          restrito={true}
          show={showEditModal}
          data={selecao[0].data}
          onClose={() => setShowEditModal(false)}
          onSave={salvarModal}
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
        onCancel={() => setShowToastConfirmacao(false)}
        onConfirm={confirmarExclusao}
        message={toastMsg}
        variant={toastVariant}
      />

    </div>
    </MapaProvider>
  );
}