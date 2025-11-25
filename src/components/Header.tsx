import { ShoppingCart, ArrowLeft } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { Business } from '../types'

interface HeaderProps {
  business?: Business
  showBack?: boolean
  title?: string
}

export function Header({ business, showBack, title }: HeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const itemCount = useCartStore((state) => state.getItemCount())
  const businessSlug = useCartStore((state) => state.businessSlug)

  const isCartPage = location.pathname.includes('/carrinho')

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          
          {business?.business_logo ? (
            <img
              src={business.business_logo}
              alt={business.business_name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-bold text-lg">
                {(business?.business_name || title || 'C')[0]}
              </span>
            </div>
          )}
          
          <div>
            <h1 className="font-semibold text-gray-900 text-sm">
              {title || business?.business_name || 'Cardápio'}
            </h1>
            {business?.business_address && (
              <p className="text-xs text-gray-500 truncate max-w-[180px]">
                {business.business_address}
              </p>
            )}
          </div>
        </div>

        {!isCartPage && (
          <button
            onClick={() => navigate(`/${businessSlug}/carrinho`)}
            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ShoppingCart className="w-6 h-6 text-gray-600" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  )
}
