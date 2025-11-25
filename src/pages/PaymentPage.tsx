import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Banknote, CreditCard, QrCode, Wallet } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Header } from '../components/Header'
import { useCartStore } from '../store/cartStore'
import { PaymentMethod } from '../types'

export function PaymentPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  
  const paymentMethod = useCartStore((state) => state.paymentMethod)
  const setPaymentMethod = useCartStore((state) => state.setPaymentMethod)
  const paymentChangeFor = useCartStore((state) => state.paymentChangeFor)
  const setPaymentChangeFor = useCartStore((state) => state.setPaymentChangeFor)
    
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [changeValue, setChangeValue] = useState(paymentChangeFor?.toString() || '')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPaymentMethods()
  }, [])

  const loadPaymentMethods = async () => {
    try {
      const { data } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (data && data.length > 0) {
        setMethods(data)
      } else {
        // Default payment methods if none configured
        setMethods([
          { id: 'cash', user_id: '', name: 'Dinheiro', type: 'cash', is_active: true },
          { id: 'pix', user_id: '', name: 'PIX', type: 'pix', is_active: true },
          { id: 'credit', user_id: '', name: 'Cartão de Crédito', type: 'credit_card', is_active: true },
          { id: 'debit', user_id: '', name: 'Cartão de Débito', type: 'debit_card', is_active: true },
        ])
      }
    } catch (error) {
      console.error('Error loading payment methods:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'cash':
        return <Banknote className="w-6 h-6" />
      case 'pix':
        return <QrCode className="w-6 h-6" />
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="w-6 h-6" />
      default:
        return <Wallet className="w-6 h-6" />
    }
  }

  const handleSelectMethod = (method: PaymentMethod) => {
    setPaymentMethod(method)
    if (method.type !== 'cash') {
      setPaymentChangeFor(null)
      setChangeValue('')
    }
  }

  const handleContinue = () => {
    if (!paymentMethod) return

    if (paymentMethod.type === 'cash' && changeValue) {
      setPaymentChangeFor(parseFloat(changeValue))
    }

    navigate(`/${slug}/resumo`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Header showBack title="Pagamento" />

      <div className="px-4 py-6">
        <div className="max-w-lg mx-auto space-y-6">
          
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Forma de Pagamento</h2>
            
            <div className="space-y-3">
              {methods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleSelectMethod(method)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors ${
                    paymentMethod?.id === method.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`p-3 rounded-full ${
                    paymentMethod?.id === method.id ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {getPaymentIcon(method.type)}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900">{method.name}</h3>
                    {method.instructions && (
                      <p className="text-sm text-gray-500">{method.instructions}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Change for cash */}
          {paymentMethod?.type === 'cash' && (
            <div className="bg-white rounded-xl p-4 shadow-sm animate-fade-in">
              <h2 className="font-semibold text-gray-900 mb-4">Troco para quanto?</h2>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <input
                  type="number"
                  value={changeValue}
                  onChange={(e) => setChangeValue(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Deixe em branco se não precisar de troco
              </p>
            </div>
          )}

          {/* PIX info */}
          {paymentMethod?.type === 'pix' && (
            <div className="bg-blue-50 rounded-xl p-4 animate-fade-in">
              <p className="text-sm text-blue-700">
                💡 A chave PIX será enviada no WhatsApp após confirmar o pedido.
              </p>
            </div>
          )}

          {/* Card info */}
          {(paymentMethod?.type === 'credit_card' || paymentMethod?.type === 'debit_card') && (
            <div className="bg-yellow-50 rounded-xl p-4 animate-fade-in">
              <p className="text-sm text-yellow-700">
                💳 Pagamento será realizado na entrega/retirada.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleContinue}
            disabled={!paymentMethod}
            className={`w-full py-4 rounded-xl font-semibold transition-colors ${
              paymentMethod
                ? 'bg-primary-500 hover:bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Revisar Pedido
          </button>
        </div>
      </div>
    </div>
  )
}
