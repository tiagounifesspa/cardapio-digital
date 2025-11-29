import { ShoppingBag, ArrowLeft, Store } from 'lucide-react'
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
    <header className="sticky top-0 z-50 glass-strong border-b border-pink-100/50 shadow-sm shadow-pink-100/30">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-pink-50 rounded-xl transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          
          {business?.business_logo ? (
            <div className="relative">
              <img
                src={business.business_logo}
                alt={business.business_name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-pink-200 ring-offset-2"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
            </div>
          ) : (
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-200">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
            </div>
          )}
          
          <div>
            <h1 className="font-bold text-gray-800 text-base">
              {title || business?.business_name || 'Cardápio'}
            </h1>
            {business?.business_address ? (
              <p className="text-xs text-gray-500 truncate max-w-[180px]">
                {business.business_address}
              </p>
            ) : (
              <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Aberto agora
              </p>
            )}
          </div>
        </div>

        {!isCartPage && (
          <button
            onClick={() => navigate(`/${businessSlug}/carrinho`)}
            className="relative p-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-xl transition-all duration-300 shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 hover:scale-105"
          >
            <ShoppingBag className="w-5 h-5 text-white" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md animate-scale-in">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  )
}
