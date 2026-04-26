import { VARIANTE } from "micro-agricultor";
import { Badge, OverlayTrigger, Tooltip } from "react-bootstrap";

export function pluralizar(count, singular, plural) {
  return count === 1 ? singular : (plural || singular + "s");
}

export function renderBadge(data, field, tagField = "variant", map, tagLabel = false, fieldLabel = true, tooltipField) {
  let v = data[tagField];
  let l = data[tagField];
  let t = data[tooltipField];
  if (map?.get) {
    const item = map.get(v);
    l = item?.nome;
    t = item?.[tooltipField];
    v = item?.variant;
  }
  if (tooltipField) return (
    <>
      {fieldLabel ? data[field] : " "}
      <OverlayTrigger
        key = {"tooltip"}
        placement="top"
        delay={{ show: 2000, hide: 0 }}
        overlay={<Tooltip>{t}</Tooltip>}
      >
        <Badge bg={VARIANTE[v]?.variant}>{tagLabel ? l : " "}</Badge>
      </OverlayTrigger>
    </>
  )
  return (
    <>
      {fieldLabel ? data[field] : ""}
      <Badge bg={VARIANTE[v]?.variant}>{tagLabel ? l : " "}</Badge>
    </>
  )
}

export function renderBadgeGroup(data, field, map, filter ) {
  const badges = Object.keys(data[field]).filter(filter ? filter : key => data[field][key] === true);
  return (
    <>
      {badges.map((b,idx)=> 
        <Badge key={`${field}-${idx}`} bg={VARIANTE[map[b]?.variant]?.variant}> {map[b]?.nome || b}</Badge>
      )}
    </>
  )
}

export function calcularCorHeatmap(valor, min, max) {
  if (valor == null) return "#808080"; // desconhecido

  // clamp
  if (valor < min) valor = min;
  if (valor > max) valor = max;

  const t = (valor - min) / (max - min || 1); // 0..1

  const r = Math.round(255 * t);
  const g = 0;
  const b = Math.round(255 * (1 - t));

  return `rgb(${r},${g},${b})`;
}
