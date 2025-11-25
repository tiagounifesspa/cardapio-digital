import { Plus } from 'lucide-react'
import { MenuItem } from '../types'

interface ProductCardProps {
  product: MenuItem
  onClick: () => void
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow animate-fade-in"
    >
      <div className="flex">
        <div className="flex-1 p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-gray-500 mb-2 line-clamp-2">
              {product.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-auto">
            <span className="text-primary-600 font-bold">
              {formatPrice(product.price)}
            </span>
            <button
              className="bg-primary-500 hover:bg-primary-600 text-white p-2 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                onClick()
              }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {product.image && (
          <div className="w-28 h-28 flex-shrink-0">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
      
      {!product.available && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <span className="text-gray-500 font-medium">Indisponível</span>
        </div>
      )}
    </div>
  )
}
