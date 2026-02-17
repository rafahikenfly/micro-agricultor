# 📁 Estrutura da View `Mapa`

A view `Mapa` é organizada em camadas arquiteturais que separam claramente **estado**, **controle**, **interação**, **renderização** e **domínio**.  
Essa organização transforma o mapa em um **sistema interativo** (engine), e não apenas um conjunto de componentes React.

---

## 📂 Estrutura de Pastas

```txt
/mapa
  Mapa.jsx
  MapaContexto.jsx
  MapaController.jsx

  /handlers
    MapaCanteiro.handler.js
    MapaHorta.handler.js
    MapaPlanta.handler.js

  /ui
    MapaCanteiro.jsx
    MapaHorta.jsx
    MapaPlanta.jsx
    MapaToolbar.jsx
    MapaPreview.jsx
