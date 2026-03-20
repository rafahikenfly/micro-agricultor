Este projeto é um monorepositório, em que as pastas estão organizadas da seguinte forma:

docs        → todos os documentos para compreender o sistema
    - notes (anotações não estruturadas)
    - rules.md (descrição das regras, entidades e modelagem do sistema)
    - infra.md (descrição da infraestrutura utilizada, como tecnologias e componentes)
    ...
apps        → aplicações executáveis
    - frontend (react)
    - functions (cloud functions)
    - edgeserver (raspberrypi)
    ...
packages    → bibliotecas reutilizáveis
    - microagricultor (domain, types, application e infra)
    ...
devices     → hardware/firmware
    - flowerbox
    ...