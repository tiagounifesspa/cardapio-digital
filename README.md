# 🍰 Cardápio Digital - Confeitaria PRO

Aplicação web para pedidos online via cardápio digital.

## 🚀 Funcionalidades

- ✅ Visualização de produtos por categoria
- ✅ Personalização de produtos (tamanho, sabor, etc.)
- ✅ Carrinho de compras
- ✅ Escolha de entrega ou retirada
- ✅ Múltiplas formas de pagamento
- ✅ Resumo e confirmação do pedido
- ✅ Integração com Supabase

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🔧 Configuração

1. Configure as variáveis do Supabase em `src/lib/supabase.ts`
2. Execute as migrations no banco de dados
3. Configure o slug da empresa na tabela `business_settings`

## 📱 Rotas

- `/:slug` - Cardápio principal
- `/:slug/produto/:id` - Detalhes do produto
- `/:slug/carrinho` - Carrinho de compras
- `/:slug/entrega` - Dados de entrega
- `/:slug/pagamento` - Forma de pagamento
- `/:slug/resumo` - Resumo do pedido
- `/:slug/sucesso` - Confirmação

## 🗄️ Banco de Dados

Execute a migration em `supabase/migrations/20241124_create_delivery_tables.sql`

## 🎨 Tecnologias

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand (estado)
- Supabase (backend)
- Lucide React (ícones)
