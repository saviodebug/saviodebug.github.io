# Validação — temas e interações, 16/11/2026

## Navegador real

Os temas escuro e claro foram verificados nas larguras 1440, 1024, 820, 768, 390 e 320 pixels. Os 12 cenários não apresentaram rolagem horizontal nem imagens quebradas. Não houve exceções JavaScript nos fluxos testados.

Verificações funcionais:

- Tema inicial escuro, troca para claro e preferência preservada após recarregar e mudar para inglês.
- Filtro Web exibe somente ConfereAí; Todos restaura os três projetos.
- Detalhes do ConfereAí abrem e exibem a arquitetura real.
- Terminal: identidade profissional, links de três projetos, comando desconhecido tratado como texto, histórico, abertura do projeto e limpeza do log.
- 3D: alternância entre estrutura e sólido, foco e controles por teclado. Arraste implementado com pointer capture e `touch-action: pan-y`, preservando rolagem vertical no toque.
- Menu móvel abre e fecha ao navegar.
- Movimento reduzido remove o canvas, mantém o poster e oculta controles de 3D.
- Inglês mantém tema, terminal, filtros e logo oficial.
- HTML, IDs, arquivos, âncoras, srcset, sintaxe JavaScript e diff conferidos.

Capturas revisadas em desktop escuro e celular claro/escuro. A prévia social é uma captura real do tema padrão.

## Limites

Teste realizado em Chromium com renderização WebGL por software. Não representa avaliação de GPU ou toque em aparelho físico. A identidade dos projetos foi preservada; o ícone do YoshiBot é explicitamente o da comunidade associada.

Os cargos de TI foram confirmados pelo proprietário. O LinkedIn bloqueou leitura automática na revisão anterior; não foram inferidas datas ou responsabilidades.
