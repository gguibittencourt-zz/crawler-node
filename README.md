<h1 align="center">
  Crawler node
</h1>

## Sobre o projeto

Este projeto visa a criação de um web crawler em Node.js que obtém as informações de quartos do hotel https://lecanton.com.br/ para um período específico.

### Feito Com

Abaixo segue as tecnologias utilizadas neste projeto:

- [ESLint](https://eslint.org/) - O ESLint é uma ferramenta de lint plugável para JavaScript;
  - [eslint-config-standard](https://github.com/standard/eslint-config-standard) - Este pacote fornece o .eslintrc do Standard como uma configuração compartilhada extensível;
  - [eslint-plugin-standard](https://github.com/standard/eslint-plugin-standard) - Plugin do ESLint com regras do Standard;
  - [eslint-plugin-import](https://github.com/benmosher/eslint-plugin-import) - Plugin do ESLint com regras para ajudar na validação de imports;
  - [eslint-plugin-node](https://github.com/mysticatea/eslint-plugin-node) - Plugin do ESLint com regras adicionais para Node.js;
  - [eslint-plugin-promise](https://github.com/xjamundx/eslint-plugin-promise) - Plugin do ESLint com regras para aplicar as melhores práticas para promessas;
- [EditorConfig](https://editorconfig.org/) - O EditorConfig é um formatador de arquivos e coleções em forma de Plugin para Editores de código/texto com o objetivo de manter um padrão de código consistente entre diferentes editores, IDE's ou ambientes;
- [Node.js](https://github.com/nodejs/node) - Node.js é um ambiente de tempo de execução JavaScript. Ele executa o código JavaScript fora de um navegador;
    - [Express](https://github.com/expressjs/express) - Framework para Node.js que otimiza a construção de aplicações web e API's;
    - [Puppeteer](https://github.com/puppeteer/puppeteer) - Biblioteca para Node.js que fornece uma API de alto nível para controlar o Chrome ou Chromium através do protocolo DevTools;
- [TypeScript](https://github.com/microsoft/TypeScript) - TypeScript é um superconjunto de JavaScript desenvolvido pela Microsoft que adiciona tipagem e alguns outros recursos a linguagem;
    - [ts-node-dev](https://github.com/whitecolor/ts-node-dev) - Ferramenta que compila seus projetos com Typescript e reinicia o projeto quando o arquivo é modificado;
    - [tsconfig-paths](https://github.com/dividab/tsconfig-paths) - Ferramenta que permite mapear os módulos da aplicação e criar atalhos para essas pastas/arquivos de maneira escalável.

## Começando

### Pré-requisitos

- Node > v8.9.4
- Npm > v5.6.0

### Estrutura de arquivos

A estrutura de arquivos está da seguinte maneira:

```bash
crawler-node
├── src/
│   ├── config/
│   │   └── App.ts
│   │   └── Routes.ts
│   ├── controllers/
│   │   └── SearchController.ts
│   ├── interfaces/
│   │   └── Room.ts
│   └── server.js
├── .editorconfig
├── .eslintrc.json
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json
```

### Instalação

    $ git clone https://github.com/gguibittencourt/crawler-node
    $ cd crawler-node
    $ npm install

### Executar a aplicação
    $ npm run dev

A aplicação estará rodando na URL `http://localhost:3000`

### API

#### Buscar
Retorna os dados em json dos quartos encontrados para um período específico.

**Requisição:**
```json
POST /buscar

{
    "checkin": "30/08/2020",
    "checkout": "31/08/2020"
}
```
**Resposta de sucesso:**
```json
Status: 200
Conteúdo:
[
    {
        "name": "Standard",
        "price": "R$ 777,10",
        "description": "Ideal para relaxar. Os quartos dispõem de diversos serviços para garantir uma estadia confortável e agradável. Todos os apartamentos Standard possuem ar climatizado, TV LCD 32”, SKY, frigobar, telefone, cofre e secador de cabelo.",
        "images": [
            "https://myreservations.omnibees.com/Handlers/ImageLoader.ashx?imageID=189952.jpg",
            "https://myreservations.omnibees.com/Handlers/ImageLoader.ashx?imageID=152609.jpg",
            "https://myreservations.omnibees.com/Handlers/ImageLoader.ashx?imageID=189950.jpg"
        ]
    }
]
```
**Respostas de erros de validação:**
```json
Status: 422
Conteúdo:
{
    "error": "Checkin and checkout parameters are required"
}
```
```json
Status: 422
Conteúdo:
{
    "error": "Checkin and checkout parameters must be in DD/MM/yyyy format"
}
```
```json
Status: 422
Conteúdo:
{
    "error": "The checkin parameter must be less than the checkout"
}
```

**Resposta de erro do servidor:**
```json
Status: 500
Conteúdo:
{
    "error": "TimeoutError"
}
```

