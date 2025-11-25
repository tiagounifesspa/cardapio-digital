import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle, MessageCircle, Home } from 'lucide-react'

export function SuccessPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  
  const { orderNumber, total, businessPhone } = location.state || {}

  const formatPrice = (price: number) => {
    return price?.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }) || 'R$ 0,00'
  }

  const handleWhatsApp = () => {
    if (!businessPhone) return
    
    const phone = businessPhone.replace(/\D/g, '')
    const message = `Olá! Acabei de fazer o pedido #${orderNumber}. Gostaria de mais informações.`
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center animate-slide-up">
        
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-14 h-14 text-green-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Pedido Realizado!
        </h1>
        
        {orderNumber && (
          <p className="text-lg text-gray-600 mb-6">
            Pedido <span className="font-semibold">#{orderNumber}</span>
          </p>
        )}

        {/* Info Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <p className="text-gray-600 mb-4">
            Você receberá uma confirmação no seu WhatsApp em instantes.
          </p>
          
          {total && (
            <div className="py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">Total do pedido</p>
              <p className="text-2xl font-bold text-primary-600">{formatPrice(total)}</p>
            </div>
          )}
          
          <div className="py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Previsão</p>
            <p className="text-lg font-semibold text-gray-900">30-45 minutos</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(`/${slug}`)}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Fazer Novo Pedido
          </button>
          
          {businessPhone && (
            <button
              onClick={handleWhatsApp}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Falar com a Loja
            </button>
          )}
        </div>

        {/* Thank you */}
        <p className="text-gray-500 text-sm mt-8">
          Obrigado pela preferência! 🎉
        </p>
      </div>
    </div>
  )
}
