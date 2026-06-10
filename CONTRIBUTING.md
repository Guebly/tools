# Contribuindo com Guebly Tools

Obrigado pelo interesse em contribuir! Este projeto é open-source e contribuições são bem-vindas.

## Como contribuir

### Reportando bugs

Abra uma [issue](https://github.com/Guebly/tools/issues) com:
- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs. observado
- Navegador e sistema operacional

### Sugerindo melhorias

Abra uma issue com a tag `enhancement` descrevendo:
- O problema que a melhoria resolve
- Como você imagina a solução

### Enviando código

1. Faça um fork do repositório
2. Crie uma branch para sua feature: `git checkout -b feature/minha-feature`
3. Instale as dependências: `npm install`
4. Rode o projeto localmente: `npm run dev`
5. Faça suas alterações com commits descritivos
6. Verifique que o build funciona: `npm run build`
7. Abra um Pull Request descrevendo as mudanças

## Padrões do projeto

- **Linguagem:** TypeScript + React 18
- **Estilo:** Tailwind CSS v3 + inline styles para componentes complexos
- **Ícones:** lucide-react
- **Idioma do código:** inglês; comentários e UI em português (pt-BR)
- **Temas:** suporte obrigatório a dark/light mode via `useTheme()`
- **Responsividade:** todas as telas devem funcionar em mobile (≥ 375px)

## Estrutura do projeto

```
src/
  pages/          # Páginas principais (Home, InstaPreview, ZapTranscriber, etc.)
  insta/          # Componentes exclusivos do InstaPreview
  components/     # Componentes compartilhados (Layout)
  contexts/       # ThemeContext
  lib/            # Utilitários (markdown parser, formatadores de texto)
public/           # Assets estáticos (logos, favicon)
```

## Dúvidas?

Abra uma issue ou entre em contato via [guebly.com.br](https://guebly.com.br).
