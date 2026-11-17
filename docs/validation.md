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
