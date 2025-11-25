import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MapPin, Store, Truck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Header } from '../components/Header'
import { useCartStore } from '../store/cartStore'
import { Business, CustomerInfo } from '../types'

export function DeliveryPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  
  const deliveryType = useCartStore((state) => state.deliveryType)
  const setDeliveryType = useCartStore((state) => state.setDeliveryType)
  const customerInfo = useCartStore((state) => state.customerInfo)
  const setCustomerInfo = useCartStore((state) => state.setCustomerInfo)
  
  const [business, setBusiness] = useState<Business | null>(null)
  const [formData, setFormData] = useState<CustomerInfo>({
    name: customerInfo?.name || '',
    phone: customerInfo?.phone || '',
    address: customerInfo?.address || '',
    addressComplement: customerInfo?.addressComplement || '',
    notes: customerInfo?.notes || ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

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
      // Set default delivery type
      if (!deliveryType) {
        if (data.delivery_enabled) {
          setDeliveryType('delivery')
        } else if (data.pickup_enabled) {
          setDeliveryType('pickup')
        }
      }
    }
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return value
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setFormData({ ...formData, phone: formatted })
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    const phoneNumbers = formData.phone.replace(/\D/g, '')
    if (!phoneNumbers || phoneNumbers.length < 10) {
      newErrors.phone = 'WhatsApp inválido'
    }

    if (deliveryType === 'delivery' && !formData.address?.trim()) {
      newErrors.address = 'Endereço é obrigatório para entrega'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = () => {
    if (!validate()) return

    setCustomerInfo(formData)
    navigate(`/${slug}/pagamento`)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Header showBack title="Entrega" />

      <div className="px-4 py-6">
        <div className="max-w-lg mx-auto space-y-6">
          
          {/* Delivery Type */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Como deseja receber?</h2>
            
            <div className="space-y-3">
              {business?.delivery_enabled && (
                <button
                  onClick={() => setDeliveryType('delivery')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors ${
                    deliveryType === 'delivery'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`p-3 rounded-full ${
                    deliveryType === 'delivery' ? 'bg-primary-500' : 'bg-gray-100'
                  }`}>
                    <Truck className={`w-6 h-6 ${
                      deliveryType === 'delivery' ? 'text-white' : 'text-gray-500'
                    }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900">Entrega</h3>
                    <p className="text-sm text-gray-500">
                      {business.delivery_fee > 0 
                        ? `Taxa: R$ ${business.delivery_fee.toFixed(2)}`
                        : 'Grátis'
                      }
                      {' • '}{business.delivery_time_estimate}
                    </p>
                  </div>
                </button>
              )}

              {business?.pickup_enabled && (
                <button
                  onClick={() => setDeliveryType('pickup')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors ${
                    deliveryType === 'pickup'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`p-3 rounded-full ${
                    deliveryType === 'pickup' ? 'bg-primary-500' : 'bg-gray-100'
                  }`}>
                    <Store className={`w-6 h-6 ${
                      deliveryType === 'pickup' ? 'text-white' : 'text-gray-500'
                    }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900">Retirar no Local</h3>
                    <p className="text-sm text-gray-500">
                      Grátis • {business.pickup_time_estimate}
                    </p>
                  </div>
                </button>
              )}
            </div>

            {deliveryType === 'pickup' && business?.pickup_address && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-start gap-2">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <p className="text-sm text-gray-600">{business.pickup_address}</p>
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Seus Dados</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome completo"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="(11) 99999-9999"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {deliveryType === 'delivery' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Endereço *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Rua, número, bairro"
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.address ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Complemento
                    </label>
                    <input
                      type="text"
                      value={formData.addressComplement}
                      onChange={(e) => setFormData({ ...formData, addressComplement: e.target.value })}
                      placeholder="Apto, bloco, referência..."
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleContinue}
            disabled={!deliveryType}
            className={`w-full py-4 rounded-xl font-semibold transition-colors ${
              deliveryType
                ? 'bg-primary-500 hover:bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continuar para Pagamento
          </button>
        </div>
      </div>
    </div>
  )
}
