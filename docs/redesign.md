# Portfólio pessoal — revisão de temas e interação

## Direção

Página única por idioma, com escuro como padrão: preto azulado, azul e roxo. O modo claro usa tons frios claros, azul e violeta. A preferência é salva localmente e aplicada antes da primeira pintura. Cada projeto mantém suas cores oficiais.

Nome completo: Savio Busana Beckhauser Junior. A marca curta usa Savio Junior. Projetos públicos e experiência de TI compõem o conteúdo; não foram inventadas datas, métricas ou atribuições de trabalho.

## Identidade dos projetos

- ConfereAí: logo real de `extensao/assets/logo-geral.png` do repositório público, convertido para WebP sem redesenho.
- YOSHI Studio: ícone e wordmark originais de marca do proprietário. Nenhum código privado incorporado.
- YoshiBot: imagem pública da comunidade Yoshizinho City; identificada como comunidade, sem alegar que seja o avatar do bot.
- Procedência dos arquivos em `assets/images/projects/sources.json`.

As ilustrações inventadas de robô, selo e letra Y foram substituídas pelos ativos reais.

## Layout espacial

A abertura usa o nome em escala ampla, a escultura no centro e o contexto nas bordas. O símbolo se separa conforme a rolagem avança. Os projetos deixam a sequência de linhas com imagens repetidas: uma cena com cartões em perspectiva acompanha três capítulos de texto. A rolagem é nativa; os controles de anterior e próximo navegam entre capítulos. A stack passa a quatro colunas no desktop, com profundidade ao interagir.

## Interações

- Filtros de projetos: todos, desktop, automação e web.
- Detalhes técnicos expansíveis com arquitetura e recursos comprovados pela documentação dos projetos.
- Terminal local com `help`, `projects`, `stack`, `whoami`, `contact`, `open yoshi`, `open bot`, `open confereai` e `clear`. Entrada tratada como texto; sem eval nem comandos de sistema. Histórico com setas e log limitado.
- Escultura 3D: arraste por mouse ou toque, rotação por teclado, reset com Home, modos sólido e estrutura e adaptação ao tema.
- Entradas suaves ao rolar e indicador de progresso. O layout e as animações são mantidos independentemente da preferência de movimento do sistema, conforme a direção solicitada pelo proprietário.

## Compatibilidade

Português e inglês, URLs antigas redirecionadas para âncoras, fontes e Three.js locais. Projetos e detalhes continuam acessíveis sem JavaScript; filtros, terminal e controles só aparecem quando disponíveis.

## Direção orbital e compatibilidade

A referência de composição arredondada é https://www.seanhalpin.xyz/; a referência de experiência espacial interativa é https://bruno-simon.com/. A identidade, as formas 3D e o conteúdo são próprios do portfólio. A escolha de azul e roxo foi explícita do proprietário.

A abertura passa a um painel arredondado com portal orbital, anéis e satélites com os logos reais dos projetos. A stack recebe um cubo interativo em CSS 3D; a galeria de projetos continua guiada pela rolagem. Nenhum novo renderizador foi adicionado: o portal e os satélites usam o contexto WebGL existente.

Foi removida a alteração de layout disparada por `prefers-reduced-motion`, que escondia a cena e substituía a galeria pela disposição anterior. Também foi removido o botão de pausa. Quando WebGL não está disponível, a composição usa o visual animado por CSS, mantendo navegação e projetos acessíveis.
