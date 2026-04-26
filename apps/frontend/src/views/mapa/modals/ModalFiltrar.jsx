import { Button, Modal, Tab, Tabs } from "react-bootstrap"
import ListaToolbar from "../../../components/listas/ListaToolbar"
import Loading from "../../../components/Loading"
import { useCache } from "../../../hooks/useCache"
import { useMapaEngine } from "../MapaEngine"
import { useState } from "react"
import { VARIANTE } from "micro-agricultor"

export default function ModalFiltrar({show, onClose}) {
  const { filters, setFilter, resetFilter } = useMapaEngine()
  const { cacheEstadosPlanta, cacheEspecies, cacheEstadosCanteiro, cacheEstagiosEspecie, reading } = useCache([
    "estadosPlanta",
    "especies",
    "estadosCanteiro",
    "estagiosEspecie"
  ])

  const [tab, setTab] = useState("plantas");
  
  if (reading) return <Loading variant="overlay" />
  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Filtrar</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs
          activeKey={tab}
          onSelect={(k) => k && setTab(k)}
          className="mb-3"
        >
          <Tab eventKey="plantas" title="Plantas">
            <ListaToolbar
              filtros={filters.planta}
              setFiltros={(planta)=>setFilter({planta})}
              configFiltros={[
                {
                  key: "estadoId",
                  type: "select",
                  label: "Estado",
                  list: cacheEstadosPlanta?.list ?? [],
                  labelKey: "nome",
                  valueKey: "id",
                  placeholder: "Todos estados"
                },
                {
                  key: "estagioId",
                  type: "select",
                  label: "Estágio",
                  list: cacheEstagiosEspecie?.list ?? [],
                  labelKey: "nome",
                  valueKey: "id",
                  placeholder: "Todos os estágios"
                },
                {
                  key: "especieId",
                  type: "select",
                  label: "Espécie",
                  list: cacheEspecies?.list ?? [],
                  labelKey: "nome",
                  valueKey: "id",
                  placeholder: "Todas espécies"
                }
              ]}
            />
          </Tab>
          <Tab eventKey="canteiros" title="Canteiros">
            <ListaToolbar
              filtros={filters.canteiro}
              setFiltros={(canteiro)=>setFilter({canteiro})}
              configFiltros={[
                {
                  key: "estadoId",
                  type: "select",
                  label: "Estado",
                  list: cacheEstadosCanteiro?.list ?? [],
                  labelKey: "nome",
                  valueKey: "id",
                  placeholder: "Todos estados"
                }
              ]}
            />
          </Tab>
        </Tabs>
        <Button
          variant={VARIANTE.GREEN.variant}
          onClick={onClose}
        >
          Ok
        </Button>
        <Button
          variant={VARIANTE.LIGHTBLUE.variant}
          onClick={resetFilter}
        >
          Limpar filtros
        </Button>

      </Modal.Body>
    </Modal>
  )
}
