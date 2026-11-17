# Portfólio como ambiente contínuo

Tipo: software. Direção autorizada pelo usuário: experiência inspirada no percurso espacial do Igloo, com identidade própria em preto, azul e violeta. Nome primeiro, câmera atravessando um núcleo que se abre, três estações com os logos reais, contato por partículas e retorno à abertura.

Um canvas fixo acompanha a página inteira; HTML mantém textos, projetos, filtros, detalhes, terminal, trajetória e contatos. A rolagem continua nativa. A alternativa de acrescentar efeitos à galeria anterior foi descartada porque preservava a composição em cartões que o usuário rejeitou. Não usar assets, modelos ou código do Igloo.

Cena: relevo escuro, névoa, núcleo segmentado instanciado, três esculturas distintas para os projetos e partículas que se transformam no contato. Um renderizador Three.js existente, sem nova dependência. Materiais standard/basic, sem transmissão ou sombras dinâmicas, DPR limitado e pausa somente em aba oculta. Tema claro usa atmosfera e materiais claros. Sem botão para desativar movimento, conforme pedido expresso.

Falhas a evitar: conteúdo coberto pelo canvas, regressão de links/teclado, câmera errada após filtros ou resize, perda de contexto WebGL, loops/timers duplicados ao restaurar a página, geometria cortada em celular. Fallback conserva projetos reais e movimento CSS.

Referência de processo: https://www.awwwards.com/igloo-inc-case-study.html. Nenhuma promessa de 60 FPS em hardware não testado.
