src
│
├── routes
│
├── views <-- telas completas da aplicação
│   ├── admin
│   ├── calendario
│   ├── mapa
│   ├── login
│   └── profile
│
├── components <-- componentes reutilizáveis, inclusive SVG
│
├── config <-- configurações
│
├── services <-- acesso a backend / firebase / outros API
│   ├── crud
│   ├── auth
│   ├── history
│   └── data
│
├── hooks
│   ├── useAuth
│   ├── useMapa
│   ├── useToast
│   └── useCalendario
│
├── utils <-- funções puras
│   ├── dateUtils.js
│   ├── formUtils.js
│   ├── svgUtils.js
│   └── geometryUtils.js
│
└── ...