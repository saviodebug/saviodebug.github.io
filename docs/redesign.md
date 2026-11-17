# Portfólio pessoal: revisão de temas e interação

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


## Revisão: ambiente contínuo: 17/11/2026

O canvas deixa a composição do hero e permanece fixo atrás de todo o documento. Um relevo procedural e névoa conectam o núcleo segmentado, três estações de projetos e a constelação do contato. A abertura mostra primeiro o nome e depois o ambiente central, com informações nos cantos. A rolagem move a câmera entre paradas medidas no HTML, atualizadas por resize, mudança de fontes, filtros e abertura dos detalhes.

YOSHI aparece entre pilares, YoshiBot em um volume com armação e ConfereAí em uma estrutura de verificação. Todos usam identidades reais. O contato transforma partículas ao focar ou passar pelos links. Ao continuar após o fim, a câmera percorre o caminho de volta enquanto o conteúdo cede espaço à apresentação.

A antiga galeria de cartões CSS foi removida do HTML e do controlador. Filtros, conteúdo técnico, terminal, foto, trajetória, links e idiomas permanecem em HTML sem depender do canvas. Sem WebGL, as artes reais dos projetos, portal CSS e cubo continuam disponíveis.

A iluminação do terreno é pré-calculada; os 96 segmentos do núcleo usam uma instância de geometria. A resolução do canvas adapta-se entre 0,6 e 1,35 vezes o tamanho CSS, conforme custo sustentado dos quadros; textos e controles permanecem na resolução nativa. Não há pós-processamento, sombras dinâmicas ou transmissão. Recursos são descartados ao sair, e a renderização pausa somente em aba oculta.
