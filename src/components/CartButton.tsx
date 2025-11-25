import { ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'

export function CartButton() {
  const navigate = useNavigate()
  const items = useCartStore((state) => state.items)
  const businessSlug = useCartStore((state) => state.businessSlug)
  const subtotal = useCartStore((state) => state.getSubtotal())
  const itemCount = useCartStore((state) => state.getItemCount())

  if (items.length === 0) return null

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => navigate(`/${businessSlug}/carrinho`)}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white py-4 px-6 rounded-xl flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 rounded-lg p-2">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="font-medium">
              {itemCount} {itemCount === 1 ? 'item' : 'itens'}
            </span>
          </div>
          <span className="font-bold text-lg">
            {formatPrice(subtotal)}
          </span>
        </button>
      </div>
    </div>
  )
}
