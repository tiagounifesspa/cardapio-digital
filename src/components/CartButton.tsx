import { ShoppingBag, ArrowRight } from 'lucide-react'
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
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => navigate(`/${businessSlug}/carrinho`)}
          className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 hover:from-pink-600 hover:via-rose-600 hover:to-pink-600 text-white py-4 px-6 rounded-2xl flex items-center justify-between transition-all duration-300 shadow-2xl shadow-pink-300/50 hover:shadow-pink-400/60 hover:scale-[1.02] animate-scale-in"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="block text-sm opacity-90">Ver carrinho</span>
              <span className="block font-bold">
                {itemCount} {itemCount === 1 ? 'item' : 'itens'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-xl">
              {formatPrice(subtotal)}
            </span>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
