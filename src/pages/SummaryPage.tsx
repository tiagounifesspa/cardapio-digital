import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, MapPin, CreditCard, Package } from 'lucide-react'
import { supabase, supabaseUrl, supabaseAnonKey } from '../lib/supabase'
import { Header } from '../components/Header'
import { useCartStore } from '../store/cartStore'
import { Business } from '../types'

export function SummaryPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  
  const items = useCartStore((state) => state.items)
  const deliveryType = useCartStore((state) => state.deliveryType)
  const customerInfo = useCartStore((state) => state.customerInfo)
  const paymentMethod = useCartStore((state) => state.paymentMethod)
  const paymentChangeFor = useCartStore((state) => state.paymentChangeFor)
  const subtotal = useCartStore((state) => state.getSubtotal())
  const clearCart = useCartStore((state) => state.clearCart)
  
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    loadBusiness()
  }, [slug])

  const loadBusiness = async () => {
    const { data } = await supabase
      .from('business_settings')
      .select('*')
      .eq('slug', slug)
      .single()

    if (data) {
      setBusiness(data)
    }
  }

  const deliveryFee = deliveryType === 'delivery' ? (business?.delivery_fee || 0) : 0
  const total = subtotal + deliveryFee

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const handleConfirmOrder = async () => {
    if (!customerInfo || !paymentMethod || !business) return

    setLoading(true)

    try {
      // Create order
      const orderData = {
        user_id: business.user_id,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        customer_address_complement: customerInfo.addressComplement,
        customer_notes: customerInfo.notes,
        items: items.map(item => ({
          menu_item_id: item.menuItem.id,
          name: item.menuItem.name,
          quantity: item.quantity,
          unit_price: item.menuItem.price,
          options: item.selectedOptions,
          notes: item.notes,
          total_price: item.totalPrice
        })),
        subtotal,
        delivery_fee: deliveryFee,
        discount: 0,
        total,
        delivery_type: deliveryType,
        payment_method_id: paymentMethod.id,
        payment_method_name: paymentMethod.name,
        payment_change_for: paymentChangeFor
      }

      // Chamar Edge Function para processar pedido e enviar WhatsApp
      // Usando fetch direto pois o cardápio é público (sem autenticação)
      const response = await fetch(`${supabaseUrl}/functions/v1/process-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao processar pedido')
      }
      
      const result = await response.json()
      const order = result.order

      // Clear cart and navigate to success
      clearCart()
      navigate(`/${slug}/sucesso`, { 
        state: { 
          orderNumber: order.order_number,
          total,
          businessPhone: business.business_phone
        }
      })

    } catch (error) {
      console.error('Error creating order:', error)
      alert('Erro ao criar pedido. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!customerInfo || !paymentMethod) {
    navigate(`/${slug}/entrega`)
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Header showBack title="Resumo do Pedido" />

      <div className="px-4 py-6">
        <div className="max-w-lg mx-auto space-y-4">
          
          {/* Items */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-primary-500" />
              <h2 className="font-semibold text-gray-900">Itens do Pedido</h2>
            </div>
            
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.quantity}x {item.menuItem.name}
                    </p>
                    {item.selectedOptions.length > 0 && (
                      <p className="text-sm text-gray-500">
                        {item.selectedOptions.map(o => 
                          o.values.map(v => v.valueName).join(', ')
                        ).join(' • ')}
                      </p>
                    )}
                  </div>
                  <p className="font-medium text-gray-900">{formatPrice(item.totalPrice)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary-500" />
              <h2 className="font-semibold text-gray-900">
                {deliveryType === 'delivery' ? 'Entrega' : 'Retirada'}
              </h2>
            </div>
            
            <div className="space-y-2 text-gray-600">
              <p className="font-medium text-gray-900">{customerInfo.name}</p>
              <p>{customerInfo.phone}</p>
              {deliveryType === 'delivery' && customerInfo.address && (
                <p>
                  {customerInfo.address}
                  {customerInfo.addressComplement && ` - ${customerInfo.addressComplement}`}
                </p>
              )}
              {deliveryType === 'pickup' && business?.pickup_address && (
                <p className="text-sm">Retirar em: {business.pickup_address}</p>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary-500" />
              <h2 className="font-semibold text-gray-900">Pagamento</h2>
            </div>
            
            <p className="text-gray-600">{paymentMethod.name}</p>
            {paymentMethod.type === 'cash' && paymentChangeFor && (
              <p className="text-sm text-gray-500">Troco para {formatPrice(paymentChangeFor)}</p>
            )}
          </div>

          {/* Totals */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {deliveryType === 'delivery' && (
                <div className="flex justify-between text-gray-600">
                  <span>Taxa de entrega</span>
                  <span>{deliveryFee > 0 ? formatPrice(deliveryFee) : 'Grátis'}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600">
              Li e concordo com os termos de uso e política de privacidade
            </span>
          </label>

        </div>
      </div>

      {/* Confirm Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleConfirmOrder}
            disabled={!agreed || loading}
            className={`w-full py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
              agreed && !loading
                ? 'bg-primary-500 hover:bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Confirmar Pedido
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
