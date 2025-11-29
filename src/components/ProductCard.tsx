import { Plus, ImageIcon, Sparkles } from 'lucide-react'
import { MenuItem } from '../types'
import { useState } from 'react'

interface ProductCardProps {
  product: MenuItem
  onClick: () => void
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const hasImage = product.image && !imageError

  return (
    <div
      onClick={onClick}
      className="group glass rounded-2xl overflow-hidden cursor-pointer card-hover border border-white/50 shadow-lg shadow-pink-100/50 animate-scale-in"
    >
      <div className="flex">
        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between min-h-[120px]">
          <div>
            <div className="flex items-start gap-2">
              <h3 className="font-bold text-gray-800 line-clamp-2 group-hover:text-pink-600 transition-colors">
                {product.name}
              </h3>
              {product.preparation_time && product.preparation_time <= 15 && (
                <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-bold rounded-full">
                  <Sparkles className="w-3 h-3" />
                  Rápido
                </span>
              )}
            </div>
            {product.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium">A partir de</span>
              <span className="text-lg font-extrabold gradient-text">
                {formatPrice(product.price)}
              </span>
            </div>
            <button
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white p-3 rounded-xl shadow-lg shadow-pink-200 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-pink-300"
              onClick={(e) => {
                e.stopPropagation()
                onClick()
              }}
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
        
        {/* Image */}
        <div className="w-32 h-32 flex-shrink-0 relative overflow-hidden">
          {hasImage ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 img-placeholder animate-pulse-soft" />
              )}
              <img
                src={product.image}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/20 pointer-events-none" />
            </>
          ) : (
            <div className="w-full h-full img-placeholder flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-8 h-8 text-pink-300 mx-auto" />
                <span className="text-[10px] text-pink-400 font-medium mt-1 block">Sem foto</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Unavailable overlay */}
      {!product.available && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center">
          <span className="text-gray-500 font-semibold bg-gray-100 px-4 py-2 rounded-full">
            Indisponível
          </span>
        </div>
      )}
    </div>
  )
}
