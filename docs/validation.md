# Validação da revisão orbital — 16/11/2026

## Investigação no Brave

A versão anterior foi executada no Brave local sem exceções JavaScript. A emulação da preferência de movimento reduzido reproduziu uma diferença concreta: removia o canvas e desativava a composição espacial dos projetos. Essa condição podia explicar o relato, mas a configuração física do outro computador não foi inspecionada.

A preferência não muda mais a composição nem desliga as animações. O botão de pausa foi removido por solicitação do proprietário. O processamento ainda é suspenso quando o canvas sai da tela ou a aba fica oculta.

## Verificações realizadas

- Brave e Chromium: modos escuro e claro em 1440, 1024, 820, 768, 390 e 320 pixels, sem rolagem horizontal, imagens quebradas ou exceções JavaScript.
- Galeria espacial: projeto ativo acompanha a rolagem, cartões mantêm opacidade frontal e controles anterior/próximo navegam pelos capítulos.
- Filtros, detalhes técnicos, terminal, histórico, abertura dos projetos, limpeza do log, menu móvel e preferência de tema continuam funcionais.
- Emulação da preferência de movimento reduzido: layout espacial ativo, um canvas em execução, ausência de botão de pausa e diferença entre capturas sucessivas do 3D, comprovando movimento.
- WebGL indisponível no Brave: portal e satélites animados por CSS, galeria preservada, cubo em movimento e nenhuma exceção JavaScript.
- Cubo da stack: seis faces e rotação por teclado.
- Capturas revisadas em Brave desktop/celular e no modo claro em inglês. Ajustado o posicionamento dos controles para evitar sobreposição com o texto no celular.
- HTML, IDs, arquivos, âncoras e sintaxe JavaScript conferidos. Bundle gerado com esbuild 0.27.0 e diff sem problemas.

## Recursos e limites

Anéis e satélites reutilizam o renderizador existente. O cubo utiliza CSS 3D. Texturas, geometrias, materiais e ambiente são descartados junto com a cena.

Os testes usam navegadores locais com renderização por software. Não representam teste de GPU, configuração do Brave ou extensões do outro computador. Não foram feitas alegações de FPS em hardware físico.

## Referências e conteúdo

Referências visuais consultadas: https://bruno-simon.com/ e https://www.seanhalpin.xyz/. Composição, código e objetos são próprios do portfólio. Identidades dos projetos foram preservadas. Nome e experiências profissionais seguem as informações fornecidas pelo proprietário.


## Abertura e navegação circular — 16/11/2026

O nome aparece antes do cenário. A entrada dura cerca de 2,35 segundos e termina imediatamente se o visitante começa a navegar. Âncoras diretas preservam o destino. Títulos, retrato e terminal aparecem durante a rolagem. A galeria interpola a posição por tempo, sem modificar a rolagem nativa.

No final, uma rolagem adicional abre um portal e retorna à apresentação. Há uma margem de 650 ms e 160 pixels adicionais para evitar que o mesmo impulso que alcançou o contato reinicie a página. No celular, um novo gesto para cima de mais de 80 pixels aciona o retorno. Os links do rodapé também abrem o portal; o foco retorna ao título.

Medição no Brave local, 1440 × 900, DPR 1, cena visível após aquecimento de 2,5 s, janela de 5 s: antes 21,5 FPS (mediana 49,2 ms; p95 53,8 ms); depois 34,6 FPS (mediana 28,7 ms; p95 32 ms). Removido o limitador de 30 FPS, que descartava quadros adicionais; rotação usa amortecimento independente da taxa. Renderização por software: estes números não garantem 60 FPS nos computadores dos visitantes. Nenhuma textura ou material foi degradado para elevar a medição.

Brave: 12 cenários de largura/tema entre 320 e 1440 pixels, sem overflow ou imagens quebradas. Controles, filtros, terminal, galeria, teclado, idioma e movimento contínuo passaram novamente. Sintaxe de fonte e bundle e whitespace verificados.

Referências adicionais consultadas: [Igloo](https://www.igloo.inc/) para continuidade entre fim e começo, [Lusion](https://lusion.co/) e [Active Theory](https://activetheory.net/) para experiências espaciais. A cena e a transição do portfólio são próprias; não foram copiados os modelos, texturas ou código dessas referências.

Retorno circular verificado no Brave por link, rolagem adicional e gesto móvel: posição final no topo, foco no H1 e reabertura concluída com cenário visível. Acesso direto a `/en/#stack` preservou idioma e destino após carregamento. Nenhuma exceção JavaScript nesses cenários.


## Ambiente contínuo — 17/11/2026

A revisão substitui a galeria anterior por um canvas fixo com câmera conduzida pela rolagem nativa. Mantém o conteúdo em HTML, identidades reais dos três projetos, filtros, detalhes, terminal, trajetória e contatos. A abertura centraliza o cenário e distribui os textos pelos cantos. Partículas reagem aos links de contato; o retorno refaz o percurso antes de abrir a apresentação.

Brave local: os modos claro/escuro passaram em 1440, 1024, 820, 768, 390 e 320 pixels, sem overflow horizontal, imagens quebradas ou exceções JavaScript. Revisadas capturas do núcleo, três estações, stack e contato em desktop e celular. Corrigidos o cruzamento da câmera com objetos anteriores e o enquadramento em telas estreitas. Filtros, detalhes, terminal e alternância de materiais passaram.

Teste de integração: capturas sucessivas confirmaram movimento; interação com links do contato modificou a cena; retorno por scroll adicional e gesto móvel chegou ao topo. `/en/#stack` abriu em inglês no destino com um canvas. Com criação de WebGL bloqueada: nenhum canvas, estado fallback, artes dos projetos visíveis e cubo CSS animado, sem exceções.

O checker de layout foi executado em 1440×900, 1024×768, 820×1180, 768×1024 e 390×844, sem overflow. Registrou 24 observações de regras de composição: quatro sobre a contagem alinhada à direita da barra de filtros; onze sobre altura diferente de uma/duas telas; cinco sobre o terminal mais curto que uma tela; quatro sobre seções vizinhas aparecendo na rolagem. Essas regras pressupõem seções isoladas. Foram mantidas as alturas de conteúdo e o percurso contínuo solicitados pelo proprietário, em vez de forçar telas isoladas ou preencher espaços. Não são falhas de links, conteúdo, renderização ou largura. O stress de títulos também foi executado pelo checker.

A cena usa iluminação pré-calculada no terreno, núcleo instanciado e um só contexto WebGL. Ajusta apenas a resolução do canvas diante de custo sustentado dos quadros; HTML continua nítido e todas as animações continuam ativas. Testes locais usam renderização por software e não comprovam 60 FPS em hardware físico. As medições anteriores do hero isolado não representam esta cena de tela inteira.

Sintaxe das três entradas JavaScript e bundle, IDs únicos, âncoras, assets dos dois idiomas e whitespace verificados. Nenhuma dependência de runtime ou fonte externa foi adicionada.


Auditoria de carregamento final em 1440 e 390 pixels: 0 falhas, 3 avisos. Cerca de 843–859 KiB transferidos no servidor local sem gzip, 18 requisições, um contexto WebGL vivo no início e no fim, nenhum pedido quebrado. Avisos: tamanho de JavaScript analisado (o motor Three.js local) e dimensões declaradas do SVG de fallback no celular; o SVG é vetorial e não exige bitmap nessa resolução. FCP/LCP locais de aproximadamente 0,2 s foram medidos com WebGL bloqueado pelo próprio auditor e não representam desempenho de produção nem compilação de shaders em GPU. A execução WebGL por SwiftShader foi registrada separadamente pelo auditor e não é usada para prometer 60 FPS.

Último teste de interação utilizou eventos de mouse do navegador: o botão Estrutura estava acima do conteúdo e recebeu o clique real, alterando o material. Retorno por scroll/toque, inglês e fallback passaram novamente, sem exceções. A prévia social foi atualizada com uma captura real da nova abertura.


## Estrutura como apresentação única — 17/11/2026

O proprietário escolheu a apresentação em estrutura. Os materiais usam wireframe desde a primeira renderização, com os mesmos elementos que o seletor anterior alterava. Logos, partículas e anéis preservam sua identidade. O seletor Sólido/Estrutura e seus eventos foram removidos dos dois idiomas; alternar o tema mantém a estrutura. Assets receberam nova versão para invalidar o cache.

Brave: chamadas reais de desenho em linhas confirmadas em português e inglês, nenhum botão de modo no DOM, estrutura mantida ao mudar para o tema claro e nenhuma exceção JavaScript. Prévia social atualizada com captura real. Sintaxe e diff verificados.
