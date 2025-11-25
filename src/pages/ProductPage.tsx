import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Header } from '../components/Header'
import { useCartStore } from '../store/cartStore'
import { MenuItem, ProductOption, SelectedOption, CartItem } from '../types'

export function ProductPage() {
  const { slug, productId } = useParams<{ slug: string; productId: string }>()
  const navigate = useNavigate()
  const addItem = useCartStore((state) => state.addItem)
  
  const [product, setProduct] = useState<MenuItem | null>(null)
  const [options, setOptions] = useState<ProductOption[]>([])
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (productId) {
      loadProduct()
    }
  }, [productId])

  const loadProduct = async () => {
    try {
      setLoading(true)
      
      // Load product
      const { data: productData, error: productError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', productId)
        .single()

      if (productError) throw productError
      setProduct(productData)

      // Load options
      const { data: optionsData, error: optionsError } = await supabase
        .from('product_options')
        .select(`
          *,
          values:product_option_values(*)
        `)
        .eq('menu_item_id', productId)
        .order('sort_order')

      if (!optionsError && optionsData) {
        setOptions(optionsData)
        
        // Initialize selected options with defaults
        const initialSelected: SelectedOption[] = optionsData.map(opt => ({
          optionId: opt.id,
          optionName: opt.name,
          values: opt.values
            .filter((v: any) => v.is_default)
            .map((v: any) => ({
              valueId: v.id,
              valueName: v.name,
              priceModifier: v.price_modifier
            }))
        }))
        setSelectedOptions(initialSelected)
      }

    } catch (err) {
      console.error('Error loading product:', err)
      setError('Produto não encontrado')
    } finally {
      setLoading(false)
    }
  }

  const handleOptionSelect = (option: ProductOption, valueId: string, valueName: string, priceModifier: number) => {
    setSelectedOptions(prev => {
      const existingIndex = prev.findIndex(o => o.optionId === option.id)
      
      if (option.type === 'single') {
        // Single selection - replace
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = {
            optionId: option.id,
            optionName: option.name,
            values: [{ valueId, valueName, priceModifier }]
          }
          return updated
        }
        return [...prev, {
          optionId: option.id,
          optionName: option.name,
          values: [{ valueId, valueName, priceModifier }]
        }]
      } else {
        // Multiple selection - toggle
        if (existingIndex >= 0) {
          const existing = prev[existingIndex]
          const valueExists = existing.values.some(v => v.valueId === valueId)
          
          if (valueExists) {
            // Remove value
            const updated = [...prev]
            updated[existingIndex] = {
              ...existing,
              values: existing.values.filter(v => v.valueId !== valueId)
            }
            return updated
          } else {
            // Add value (check max)
            if (option.max_selections && existing.values.length >= option.max_selections) {
              return prev
            }
            const updated = [...prev]
            updated[existingIndex] = {
              ...existing,
              values: [...existing.values, { valueId, valueName, priceModifier }]
            }
            return updated
          }
        }
        return [...prev, {
          optionId: option.id,
          optionName: option.name,
          values: [{ valueId, valueName, priceModifier }]
        }]
      }
    })
  }

  const isValueSelected = (optionId: string, valueId: string) => {
    const option = selectedOptions.find(o => o.optionId === optionId)
    return option?.values.some(v => v.valueId === valueId) || false
  }

  const calculateTotal = () => {
    if (!product) return 0
    
    const optionsTotal = selectedOptions.reduce((acc, opt) => {
      return acc + opt.values.reduce((a, v) => a + v.priceModifier, 0)
    }, 0)
    
    return (product.price + optionsTotal) * quantity
  }

  const validateOptions = () => {
    for (const option of options) {
      if (option.required) {
        const selected = selectedOptions.find(o => o.optionId === option.id)
        if (!selected || selected.values.length === 0) {
          return false
        }
      }
      if (option.min_selections > 0) {
        const selected = selectedOptions.find(o => o.optionId === option.id)
        if (!selected || selected.values.length < option.min_selections) {
          return false
        }
      }
    }
    return true
  }

  const handleAddToCart = () => {
    if (!product || !validateOptions()) return

    const cartItem: CartItem = {
      id: `${product.id}-${Date.now()}`,
      menuItem: product,
      quantity,
      selectedOptions: selectedOptions.filter(o => o.values.length > 0),
      notes: notes.trim() || undefined,
      totalPrice: calculateTotal()
    }

    addItem(cartItem)
    navigate(`/${slug}`)
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Ops!</h1>
        <p className="text-gray-500">{error || 'Produto não encontrado'}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Header showBack title={product.name} />
      
      {/* Product Image */}
      {product.image && (
        <div className="w-full h-64 bg-gray-200">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Product Info */}
      <div className="px-4 py-6">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
          {product.description && (
            <p className="text-gray-600 mb-4">{product.description}</p>
          )}
          <p className="text-2xl font-bold text-primary-600">{formatPrice(product.price)}</p>
        </div>
      </div>

      {/* Options */}
      {options.length > 0 && (
        <div className="px-4 space-y-6">
          <div className="max-w-lg mx-auto space-y-6">
            {options.map((option) => (
              <div key={option.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{option.name}</h3>
                  {option.required && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                      Obrigatório
                    </span>
                  )}
                </div>
                
                {option.type === 'multiple' && option.max_selections && (
                  <p className="text-sm text-gray-500 mb-3">
                    Escolha até {option.max_selections} opções
                  </p>
                )}

                <div className="space-y-2">
                  {option.values?.map((value: any) => (
                    <button
                      key={value.id}
                      onClick={() => handleOptionSelect(option, value.id, value.name, value.price_modifier)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
                        isValueSelected(option.id, value.id)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium text-gray-900">{value.name}</span>
                      {value.price_modifier > 0 && (
                        <span className="text-sm text-gray-500">
                          +{formatPrice(value.price_modifier)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="px-4 py-6">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Observações</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Sem cobertura, mais doce..."
              className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Add to Cart */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          {/* Quantity */}
          <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Minus className="w-5 h-5 text-gray-600" />
            </button>
            <span className="font-semibold text-gray-900 w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddToCart}
            disabled={!validateOptions()}
            className={`flex-1 py-4 px-6 rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors ${
              validateOptions()
                ? 'bg-primary-500 hover:bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Adicionar {formatPrice(calculateTotal())}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
