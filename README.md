# Savio Busana Beckhauser Junior

Portfólio pessoal em página única, com versões em português e inglês, projetos públicos, tecnologias e trajetória profissional.

## Site

https://saviodebug.github.io/

## Desenvolvimento

HTML, CSS e JavaScript nativos, sem etapa de build. Para abrir localmente:

```sh
python -m http.server 8000
```

Acesse `http://localhost:8000/` ou `http://localhost:8000/en/`.

## Estrutura

- `index.html` e `en/index.html`: páginas completas por idioma.
- `assets/css/style.css`: sistema visual e responsividade.
- `assets/js/main.js`: navegação, idioma, contato e carregamento progressivo.
- `assets/js/hero-scene.js`: fonte da escultura de código em Three.js, com pausa e descarte de recursos.
- `assets/js/hero-scene.bundle.js`: versão compactada usada pelo navegador.
- `assets/vendor/three/`: Three.js 0.187.0 e licença MIT, hospedados localmente.
- `assets/fonts/`: Instrument Sans e DM Mono, com licenças OFL.
- `project/`, `skills/`, `contact/` e equivalentes em inglês: redirecionamentos das URLs antigas.
- `docs/redesign.md`: direção e decisões do redesign.

## Atualizar o bundle 3D

Ao alterar `hero-scene.js`, a partir da raiz do repositório:

```sh
npm exec --yes --package=esbuild@0.27.0 -- esbuild assets/js/hero-scene.js --bundle --minify --format=esm --alias:three=./assets/vendor/three/three.module.js --legal-comments=inline --outfile=assets/js/hero-scene.bundle.js
```

A versão fixa do esbuild é uma ferramenta de manutenção; o site publicado não depende de npm ou de CDN.

## Acessibilidade e movimento

Conteúdo e links funcionam sem JavaScript. O 3D tem alternativa estática, respeita movimento reduzido, permite pausa e suspende a animação fora da tela ou em aba oculta. Fontes e biblioteca são servidas pelo próprio site, sem CDN em tempo de execução.

## Conteúdo profissional

Os cargos de estagiário de TI na Elastri Engenharia (atual) e no Colégio Jardim Anchieta (anterior) foram informados pelo proprietário. Não foram inferidas datas ou responsabilidades.

## Licença

Código próprio sob MIT. Dependências e fontes preservam suas licenças nos respectivos diretórios.
