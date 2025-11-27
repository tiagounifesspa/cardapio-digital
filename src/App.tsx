import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MenuPage } from './pages/MenuPage'
import { ProductPage } from './pages/ProductPage'
import { CartPage } from './pages/CartPage'
import { DeliveryPage } from './pages/DeliveryPage'
import { PaymentPage } from './pages/PaymentPage'
import { SummaryPage } from './pages/SummaryPage'
import { SuccessPage } from './pages/SuccessPage'

function App() {
  return (
    <BrowserRouter basename="/cardapio-digital">
      <Routes>
        {/* Redirect root to default menu */}
        <Route path="/" element={<Navigate to="/confeitaria-doce-mel" replace />} />
        
        {/* Menu routes with slug */}
        <Route path="/:slug" element={<MenuPage />} />
        <Route path="/:slug/produto/:productId" element={<ProductPage />} />
        <Route path="/:slug/carrinho" element={<CartPage />} />
        <Route path="/:slug/entrega" element={<DeliveryPage />} />
        <Route path="/:slug/pagamento" element={<PaymentPage />} />
        <Route path="/:slug/resumo" element={<SummaryPage />} />
        <Route path="/:slug/sucesso" element={<SuccessPage />} />
        
        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Página não encontrada</h1>
            <p className="text-gray-500">Verifique o endereço e tente novamente</p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
