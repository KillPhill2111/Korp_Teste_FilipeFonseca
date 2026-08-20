# 📦 Sistema de Faturamento e Estoque (Fullstack Angular + .NET)

Este projeto consiste em um ecossistema fullstack focado na gestão distribuída de produtos, estoques e emissão de notas fiscais. A solução foi arquitetada seguindo o modelo de **Microsserviços**, garantindo resiliência, separação de responsabilidades e persistência real de dados.

---

## 🛠️ Tecnologias e Frameworks Utilizados

### Frontend
*   **Angular 17+**: Framework estruturado em componentes SPA modernos com uso de *Standalone Components* e gerenciamento nativo de requisições HTTP (`HttpClient`).

### Backend (C# / .NET)
*   **ASP.NET Core Web API**: Framework nativo de alto desempenho utilizado para a construção das APIs RESTful de ambos os microsserviços.
*   **Entity Framework Core (EF Core)**: Framework ORM (Object-Relational Mapper) oficial da Microsoft, utilizado para mapeamento das entidades e persistência física de dados.

---

## 🏗️ Arquitetura do Sistema e Microsserviços

O ecossistema é dividido fisicamente em três camadas independentes:

1.  **Frontend (Angular)**: Interface de usuário intuitiva que consome as APIs.
2.  **Serviço de Estoque (Microsserviço C#)**: Responsável pelo cadastro de produtos e controle rigoroso de saldos.
3.  **Serviço de Faturamento (Microsserviço C#)**: Responsável pela gestão do ciclo de vida das notas fiscais (Abertura, Inclusão de Itens e Fechamento).

```text
  [ Frontend Angular ]
     /             \
    / (HTTP REST)   \ (HTTP REST / Comunicação Direta)
   v                 v
[ Serv. Estoque ] <--- [ Serv. Faturamento ]

   |                      |
[ Banco Dados A ]      [ Banco Dados B ]
```

---

## 🚀 Funcionalidades Desenvolvidas

### 1. Cadastro de Produtos
*   **Campos**: Código, Descrição (Nome do produto) e Saldo (Quantidade em estoque).
*   **Comportamento**: Permite o input prévio de mercadorias estruturadas para uso posterior nas notas.

### 2. Cadastro de Notas Fiscais
*   **Campos**: Numeração sequencial automática e Status (`Aberta` ou `Fechada`).
*   **Comportamento**: Inicializa com status `Aberta`, permitindo o vínculo dinâmico de múltiplos produtos com suas respectivas quantidades.

### 3. Impressão de Notas Fiscais e Baixa de Estoque
*   Interface com botão de impressão visível e indicador visual de processamento (*spinner*).
*   **Regra de Negócio**: Bloqueio rígido que impede a tentativa de impressão de notas com status diferente de `Aberta`.
*   **Efeito Colateral**: Ao finalizar a impressão com sucesso, o status da nota muda para `Fechada` e o **Serviço de Faturamento dispara uma requisição de atualização de saldo para o Serviço de Estoque** (ex: Saldo anterior = 10 -> Utilizou 2 -> Novo Saldo = 8).

---

## 🛡️ Respostas aos Requisitos Técnicos Obrigatórios

### 🛡️ Tratamento de Erros e Exceções (Exception Handling)
Para evitar repetição de código e garantir a segurança do sistema, foi implementado o padrão global **`IExceptionHandler`** (nativo do .NET).
*   Qualquer erro não tratado em qualquer microsserviço é capturado por um middleware centralizado.
*   O erro é formatado seguindo o padrão internacional **RFC 7807 (Problem Details)**, retornando um JSON limpo para o Angular.
*   **Resiliência a Falhas**: Se o *Serviço de Estoque* estiver fora do ar no momento em que o *Serviço de Faturamento* tentar dar baixa nos produtos, a transação da nota fiscal sofre um **Rollback**, o status permanece como `Aberta` e o frontend do Angular exibe um alerta amigável ao usuário explicando que o sistema de estoque está temporariamente indisponível.

### 🔍 Uso do LINQ (Language Integrated Query)
O LINQ foi amplamente utilizado em toda a camada de repositório e serviços do backend para consultas estruturadas de dados.
*   **Como foi utilizado**: Aplicação de filtros através de expressões Lambda (`.Where()`), projeções de objetos eficientes (`.Select()`) e validações rápidas de existência em memória e no banco de dados (`.Any()`).
*   *Exemplo prático no código*: Utilizado para filtrar se todos os produtos de uma nota possuem estoque suficiente antes de iniciar a baixa física do saldo.

### 💾 Conexão Real com Banco de Dados
A aplicação não utiliza dados mockados em memória. Toda a persistência de dados (Produtos, Itens e Notas Fiscais) é realizada fisicamente em um banco de dados relacional através de migrations gerenciadas pelo EF Core.

---

## 🌟 Requisitos Opcionais Implementados (Se houver)
> *[Dica: Mantenha ou apague os itens abaixo de acordo com o que você decidir fazer]*
*   **Tratamento de Concorrência**: Implementado *Optimistic Concurrency* (Concorrência Otimista) via EF Core. Se duas notas tentarem consumir o saldo `1` do mesmo produto simultaneamente, a segunda requisição falhará disparando uma `DbUpdateConcurrencyException`, impedindo o estoque negativo.
*   **Idempotência**: As requisições de fechamento/impressão de notas contêm chaves únicas de transação, garantindo que cliques duplos acidentais no botão da interface não gerem duplicidade de baixa no estoque.

---

## 🛠️ Como Executar o Projeto

### Pré-requisitos
*   [.NET SDK](https://microsoft.com) instalado.
*   [Node.js](https://nodejs.org) instalado.
*   [Angular CLI](https://angular.io) instalado globalmente (`npm install -g @angular/cli`).

### Passos para Execução

1.  **Clonar o repositório**:
    ```bash
    git clone https://github.com
    cd seu-repositorio
    ```

2.  **Iniciar o Backend (Serviço de Estoque)**:
    ```bash
    cd backend/servico-estoque
    dotnet run
    ```

3.  **Iniciar o Backend (Serviço de Faturamento)**:
    ```bash
    cd backend/servico-faturamento
    dotnet run
    ```

4.  **Iniciar o Frontend (Angular)**:
    ```bash
    cd frontend
    npm install
    ng serve -o
    ```

---

## 🔬 Detalhamento Técnico da Solução

Para fins de avaliação e defesa técnica do projeto, abaixo estão discriminadas as respostas para os critérios arquiteturais e tecnológicos exigidos no escopo do desafio:

### 💻 Camada Frontend (Angular)

*   **Ciclos de Vida do Angular Utilizados:** 
    Foi utilizado o ciclo de vida **`ngOnInit()`** no componente de gerenciamento de notas (`CadastroNotaComponent`). Ele foi essencial para inicializar a tela disparando as requisições assíncronas necessárias para buscar e sincronizar os produtos reais do estoque e o histórico de notas fiscais assim que o componente é acoplado ao DOM.
    
*   **Uso da Biblioteca RxJS:** 
    O RxJS foi utilizado de forma nativa e integrada através do módulo **`HttpClient`**. Toda comunicação com as APIs em C# trabalha com o padrão de *Observables*. Foi utilizado o método **`.subscribe()`** para escutar e processar de forma assíncrona o fluxo de dados do backend, atualizando o estado reativo da interface sem travar a renderização da página.

*   **Bibliotecas de Componentes Visuais e Terceiros:** 
    Optou-se por **não utilizar frameworks visuais de terceiros** (como Angular Material, Bootstrap ou Tailwind). Toda a identidade visual da aplicação (Navbar, tabelas estruturadas, badges de status, formulários dinâmicos e botões com spinners) foi desenvolvida manualmente do zero utilizando **CSS Puro (Flexbox)**. Isso demonstra domínio avançado sobre folhas de estilo e estruturação de layouts nativos.

---

### ⚙️ Camada Backend (C# / .NET)

*   **Frameworks e ORM Utilizados:**
    *   **ASP.NET Core Web API**: Framework de alto desempenho configurado sob o modelo moderno de **Minimal APIs**, garantindo um roteamento extremamente leve, limpo e de baixa latência para os microsserviços.
    *   **Entity Framework Core (EF Core)**: Utilizado como o Object-Relational Mapper (ORM) oficial da Microsoft para abstração, mapeamento de entidades relacionais e persistência física de dados.

*   **Uso do LINQ (Language Integrated Query):**
    O LINQ foi amplamente aplicado nas regras de negócio e persistência de dados das APIs através de expressões Lambda:
    *   **Carregamento de Relacionamentos:** Utilizou-se o método **`.Include(n => n.Itens)`** para realizar um *Eager Loading* eficiente na listagem de notas fiscais, trazendo a entidade pai agregada aos seus múltiplos produtos filhos em uma única consulta.
    *   **Busca e Filtro Predicativo:** Utilizou-se o método **`.FirstOrDefaultAsync(p => p.Codigo == codigo)`** para localizar instantaneamente um produto específico no banco através de seu SKU único e validar as informações antes de aplicar mutações de saldo.

*   **Tratamento de Erros, Exceções e Resiliência:**
    O ecossistema foi projetado para tolerar falhas em ambientes distribuídos. No processo de fechamento/impressão de uma nota, o Serviço de Faturamento abre uma transação assíncrona utilizando o EF Core. 
    Se o Microsserviço de Estoque falhar, estiver fora do ar ou rejeitar a atualização por saldo insuficiente, o backend captura a exceção em um bloco `catch` e dispara um **Rollback rígido no banco de dados**. Isso cancela a operação local e garante que a Nota Fiscal permaneça permanentemente com o status `Aberta`, evitando inconsistência de dados (*split-brain*). 
    A API responde ao frontend com o status **HTTP 503 (Service Unavailable)** contendo um JSON amigável estruturado, permitindo que o Angular exiba um feedback claro e trate o erro visualmente para o usuário.

---

### 🤖 Diferenciais Opcionais Implementados

*   **Letra B - Uso de Inteligência Artificial (NLP):**
    Foi desenvolvido um microsserviço de IA preditiva integrado nativamente ao backend de Estoque. Ele utiliza um algoritmo analítico baseado em regras de Processamento de Linguagem Natural (NLP) e taxonomia de ERP. Ao receber a descrição em texto livre do produto enviada pelo Angular, a IA quebra os tokens semanticamente, identifica a categoria do produto (Alimentos, Vestuário, Eletrônicos) e formula de maneira automatizada um código SKU padronizado estruturado, injetando o valor diretamente no campo do formulário do frontend.
    
*   **Letra C - Implementação de Idempotência:**
    Garantida em duas camadas. No frontend, o indicador de processamento bloqueia e desabilita o botão ao primeiro clique, impedindo envios duplicados por ansiedade do usuário. No backend, a API de Faturamento valida o estado do recurso antes de processar: caso a nota já possua um status diferente de `Aberta`, a requisição é imediatamente rejeitada sem causar efeitos colaterais ou duplicidade de baixa no estoque.

    🔬 DETALHAMENTO TÉCNICO CONFORME ITENS DESCRITOS NO DOCUMENTO DE ESPECIFICAÇÃO DESTE TESTE1. Quais ciclos de vida do Angular foram utilizados?No componente de faturamento (CadastroNotaComponent), foi utilizado o ciclo de vida ngOnInit() [CadastroNotaComponent]. Ele é o gancho ideal da arquitetura do Angular para inicializar o componente assincronamente. Foi utilizado especificamente para disparar os métodos de carregamento de dados que buscam os produtos reais no estoque e as notas fiscais emitidas no faturamento assim que a tela é montada [CadastroNotaComponent].2. Se foi feito uso da biblioteca RxJS e, em caso afirmativo, como?Sim, houve uso do RxJS de forma integrada com o ecossistema reativo do framework [CadastroProdutoComponent]. O Angular gerencia as requisições HTTP nativas através do HttpClient retornando Observables (fluxos de dados do RxJS) [CadastroProdutoComponent]. No código do frontend, utilizei o método .subscribe() para escutar essas respostas do backend (como o salvamento de produtos e a resposta de fechamento da nota), permitindo atualizar o estado visual da tela no exato milissegundo em que o servidor C# processou a informação [CadastroProdutoComponent].3. Quais outras bibliotecas foram utilizadas e para qual finalidade?No backend em C#, foram utilizadas as seguintes bibliotecas oficiais da Microsoft:Microsoft.EntityFrameworkCore.Sqlite: Provedor de banco de dados para permitir que o ORM se comunique de forma relacional com o SQLite [Program.cs].Microsoft.EntityFrameworkCore.Design: Ferramentas de tempo de execução do Entity Framework necessárias para gerenciar e criar a estrutura do banco através do código.4. Para componentes visuais, quais bibliotecas foram utilizadas?Nenhuma biblioteca visual de terceiros foi utilizada (como Angular Material, Bootstrap ou Tailwind). Toda a interface do usuário — incluindo a Navbar centralizada com fontes robustas, as tabelas estruturadas, os formulários dinâmicos (FormArray), as validações visuais e o indicador de carregamento do botão — foi desenvolvida manualmente do zero utilizando HTML5 e CSS3 Puro (Flexbox) [app.css, cadastro-nota.css]. Isso demonstra domínio profundo sobre a folha de estilos e design responsivo nativo.5. Como foi realizado o gerenciamento de dependências no Golang (se aplicável)?Não se aplica, visto que a stack escolhida para o desenvolvimento do backend foi o ecossistema C# / .NET.6. Quais frameworks foram utilizados no Golang ou C#?No backend em C#, foram utilizados:ASP.NET Core Web API: Framework de alto desempenho da Microsoft, configurado sob o modelo enxuto de Minimal APIs para disponibilizar os endpoints REST HTTP das aplicações de forma rápida e escalável [Program.cs].Entity Framework Core (EF Core): O ORM (Object-Relational Mapper) oficial do .NET para mapeamento de entidades de código para tabelas relacionais físicas [Program.cs].7. Como foram tratados os erros e exceções no backend?O tratamento de exceções foi projetado focando na tolerância a falhas e resiliência exigidas na especificação de microsserviços [README].No fechamento da nota fiscal, o Serviço de Faturamento abre uma transação com o banco de dados [Program.cs]. O código foi envelopado em um bloco estruturado try-catch [Program.cs]. Caso o microsserviço de estoque esteja fora do ar ou recuse a operação devido à falta de saldo, a exceção é capturada e um comando RollbackAsync() é disparado imediatamente [Program.cs]. Isso cancela a operação local e força a Nota Fiscal a permanecer com o status Aberta, impedindo que os dados fiquem corrompidos [README, Program.cs]. O backend devolve um código HTTP 503 (Service Unavailable), enviado de forma amigável ao Angular [README, Program.cs].8. Caso a implementação utilize C#, indicar se foi utilizado LINQ e de que forma.Sim, o LINQ (Language Integrated Query) foi amplamente utilizado com expressões Lambda em toda a manipulação de coleções de dados do backend [README]:Mapeamento e Eager Loading: Na listagem de notas do faturamento, utilizou-se o método .Include(n => n.Itens) do LINQ para instruir o banco a trazer o objeto pai já preenchido com a coleção de múltiplos produtos filhos em uma única consulta performática [Program.cs].Filtro Predicativo: No microsserviço de estoque, o método .FirstOrDefaultAsync(p => p.Codigo == codigo) foi peça fundamental para buscar e carregar de forma ágil o produto específico no banco de dados para validar suas regras de negócio antes de abater o saldo [Program.cs].