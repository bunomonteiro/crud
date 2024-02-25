```sh
project/
│
├── public/                   # Arquivo estáticos servidos diretamente ao usuário final
│   ├── img/                  # Diretório de imagens
│   │   └── ...
│   └── ...
│
├── src/
│   ├── shared/               # Camada compartilhada
│   │   ├── utils/            # Exemplo de diretório de utilitários compartilhados
│   │   │   └── ...
│   │   └── ...
│   │
│   ├── domain/               # Camada de domínio contendo as entidades e regras de negócio, {idealmente} livre de dependência de bibliotecas externas
│   │   ├── entities/         # Entidades da aplicação
│   │   │   └── ...
│   │   │
│   │   ├── value_objects/    # Objetos de valor da aplicação
│   │   │   └── ...
│   │   │
│   │   ├── services/         # Serviços de domínio que concentram regras que não pertencem a nenhuma entidade e nem objeto de valor
│   │   │   └── ...
│   │   │
│   │   └── usecases/         # Casos de uso
│   │       ├── home.uc.js    # Exemplos de caso de uso para a página inicial
│   │       └── ...
│   │
│   ├── adapters/             # Camada de interfaces com o mundo externo onde se implementa os adaptadores para frameworks externos
│   │   ├── routes/           # Adaptações específicas para Express.js
│   │   │   └── ...
│   │   │
│   │   ├── middlewares/      # Adaptações específicas para Express.js
│   │   │   └── ...
│   │   └── ...
│   │
│   ├── presentation/         # Camada de apresentação
│   │   ├── assets/           # Assets (estilos, scripts, imagens, videos e etc..) da aplicação
│   │   │   └── app.css       # Exemplo de asset
│   │   │
│   │   ├── components/       # Componentes Vue reutilizáveis
│   │   │   ├── Header.vue    # Exemplo de componente de cabeçalho
│   │   │   └── ...
│   │   │
│   │   ├── views/            # Componentes de visualização das páginas
│   │   │   ├── HomeView.vue  # Exemplo de página inicial
│   │   │   └── ...
│   │   │
│   │   ├── App.vue           # Componente raiz da aplicação Vue
│   │   └── ...
│   │
│   ├── main.js               # Arquivo de entrada da aplicação Vue
│   └── App.vue               # Componente raiz da aplicação Vue
│
├── .gitignore
├── package.json
└── README.md
```