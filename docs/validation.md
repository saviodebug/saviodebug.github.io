# Validação do redesign — 16/11/2026

## Verificações realizadas

- HTML, IDs, âncoras e referências a arquivos locais conferidos em português e inglês.
- JavaScript autoral e bundle verificados com `node --check`; `git diff --check` sem problemas.
- Navegador real em 1440, 1024, 820, 768, 390 e 320 pixels: sem rolagem horizontal, fontes locais carregadas e imagens decodificadas.
- Menu móvel: abertura, fechamento ao navegar e fechamento com Escape.
- 3D: pausa e retomada manual; suspensão fora da tela; remoção do canvas com movimento reduzido; reconstrução de uma única cena ao reativar movimento.
- Falha deliberada do shader e WebGL indisponível: poster estático visível e navegação funcional.
- Inglês: estilos, nome e experiência profissional presentes.
- Rotas antigas verificadas: `/project/` para `/#projetos`, `/en/skills/` para `/en/#stack`, `/contact/` para `/#contato`.
- Capturas revisadas em desktop, celular e tablet. A composição de tablet foi empilhada e o enquadramento da câmera ajustado para preservar o símbolo inteiro.
- Prévia social gerada de uma captura real do site.

## Auditoria visual automatizada

O checker comercial do design-taste-frontend foi executado em cinco larguras. Não passou integralmente: exige o DOM e a composição fechada do kit. O portfólio usa composição autoral, seções de altura natural, marca em duas linhas e ilustrações em CSS. Esses desvios são intencionais, não equivalem a regressões funcionais.

Foram corrigidos os problemas concretos encontrados: contraste do separador de idiomas, indicador de experiência e underscore do rodapé; enquadramento do 3D em tablet; fallback também quando um shader não compila. As marcações restantes de inclinação e sobreposição correspondem aos desenhos decorativos de papel e selo. Os avisos de shader lint referem-se aos shaders internos do Three.js; a compilação e a falha real foram testadas no navegador.

## Desempenho e limites

A medição local em Chromium/SwiftShader encontrou um único contexto WebGL, nenhuma requisição quebrada e layout shift de 0,002 em desktop e 0 em celular. O JavaScript compactado permanece acima do orçamento de aviso de 500 KiB do kit, por incluir o renderizador 3D. O bundle usa aproximadamente 148 KB com gzip; a foto principal foi reduzida de 534 KB para 46 KB, com variante menor para celular.

São medições locais de laboratório, sem representar velocidade de rede real nem GPU de um aparelho físico. Não foi realizado teste prolongado de memória em dispositivos físicos.

## Conteúdo

Nome completo e cargos de TI confirmados pelo proprietário na conversa. O endereço do LinkedIn foi encontrado no perfil público do GitHub; a página do LinkedIn bloqueou a leitura automática. Não foram inventadas datas, atividades profissionais ou métricas de clientes.
