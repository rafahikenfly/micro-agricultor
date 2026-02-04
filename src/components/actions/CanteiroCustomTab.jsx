import { Button, Alert, Tab } from "react-bootstrap";
import { useState } from "react";
import { degradarCaracteristicasCanteiro } from "../../domain/canteiro.rules";

export default function CanteiroCustomTab({ entidade, showToast }) {
  const [writing, setWriting] = useState(false);

  const degradarCaracteristicas = async () => {
    if (!entidade) return;

    try {
      setWriting(true);

      //TODO
      //monta evento
      const canteiroDegradado = await degradarCaracteristicasCanteiro(entidade)
      //calcula efeitos
      //registra efeitosEventos
      canteirosService.forParent(hortaId).update(canteiroDegradado.id, canteiroDegradado, user)
      showToast(`Características de ${entidade.nome} atualizadas com sucesso.`)
    } catch (err) {
      console.error("Erro ao degradar características:", err);
      showToast("Erro ao atualizar características do canteiro:",err);
    } finally {
      setWriting(false);
    }
  };

  return (
    <>
      <Alert variant="secondary">
        Esta ação aplica a degradação temporal das características do canteiro
        com base no tempo e na longevidade definida no catálogo.
      </Alert>

      <Button
        variant="warning"
        onClick={degradarCaracteristicas}
        disabled={writing || !entidade}
        className="w-100"
      >
        {writing ? "Degradando características..." : "Degradar características"}
      </Button>
    </>
  );
}