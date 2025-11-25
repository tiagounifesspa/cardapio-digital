import { useNavigate, useParams } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { Header } from '../components/Header'
import { useCartStore } from '../store/cartStore'

export function CartPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const subtotal = useCartStore((state) => state.getSubtotal())

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showBack title="Carrinho" />
        <div className="flex flex-col items-center justify-center p-8 mt-20">
          <ShoppingBag className="w-20 h-20 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Carrinho vazio</h2>
          <p className="text-gray-500 text-center mb-6">
            Adicione itens do cardápio para fazer seu pedido
          </p>
          <button
            onClick={() => navigate(`/${slug}`)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Ver Cardápio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Header showBack title="Carrinho" />

      <div className="px-4 py-6">
        <div className="max-w-lg mx-auto space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex gap-4">
                {item.menuItem.image && (
                  <img
                    src={item.menuItem.image}
                    alt={item.menuItem.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.menuItem.name}</h3>
                  
                  {item.selectedOptions.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {item.selectedOptions.map((opt) => (
                        <p key={opt.optionId} className="text-sm text-gray-500">
                          {opt.optionName}: {opt.values.map(v => v.valueName).join(', ')}
                        </p>
                      ))}
                    </div>
                  )}
                  
                  {item.notes && (
                    <p className="text-sm text-gray-400 mt-1">Obs: {item.notes}</p>
                  )}
                  
                  <p className="text-primary-600 font-bold mt-2">
                    {formatPrice(item.totalPrice)}
                  </p>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors self-start"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
                <span className="font-semibold text-gray-900 w-8 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          ))}

          {/* Add more items */}
          <button
            onClick={() => navigate(`/${slug}`)}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary-500 hover:text-primary-500 transition-colors font-medium"
          >
            + Adicionar mais itens
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
          </div>
          
          <button
            onClick={() => navigate(`/${slug}/entrega`)}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-4 rounded-xl font-semibold transition-colors"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}
