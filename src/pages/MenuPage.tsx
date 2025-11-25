import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Search, Clock, MapPin } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Header } from '../components/Header'
import { ProductCard } from '../components/ProductCard'
import { CartButton } from '../components/CartButton'
import { useCartStore } from '../store/cartStore'
import { Business, MenuItem } from '../types'

export function MenuPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const setBusinessSlug = useCartStore((state) => state.setBusinessSlug)
  
  const [business, setBusiness] = useState<Business | null>(null)
  const [products, setProducts] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      setBusinessSlug(slug)
      loadBusinessData()
    }
  }, [slug])

  const loadBusinessData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load business settings
      const { data: businessData, error: businessError } = await supabase
        .from('business_settings')
        .select('*')
        .eq('slug', slug)
        .single()

      if (businessError) {
        // Try to find by user_id if slug doesn't exist yet
        const { data: menuItems } = await supabase
          .from('menu_items')
          .select('user_id')
          .limit(1)

        if (menuItems && menuItems.length > 0) {
          // Create default business settings
          setBusiness({
            id: '',
            user_id: menuItems[0].user_id,
            business_name: 'Cardápio Digital',
            business_phone: '',
            delivery_enabled: true,
            delivery_fee: 0,
            delivery_min_order: 0,
            delivery_time_estimate: '30-45 min',
            pickup_enabled: true,
            pickup_time_estimate: '20-30 min',
            business_hours: {} as any,
            slug: slug || ''
          })
        } else {
          setError('Estabelecimento não encontrado')
          return
        }
      } else {
        setBusiness(businessData)
      }

      // Load menu items - filter by user_id from business settings
      const userId = businessData?.user_id
      let menuQuery = supabase
        .from('menu_items')
        .select('*')
        .eq('available', true)
      
      if (userId) {
        menuQuery = menuQuery.eq('user_id', userId)
      }
      
      const { data: menuData, error: menuError } = await menuQuery
        .order('category')
        .order('sort_order')
        .order('name')

      if (menuError) throw menuError

      setProducts(menuData || [])
      
      // Extract unique categories
      const uniqueCategories = [...new Set(menuData?.map(item => item.category) || [])]
      setCategories(uniqueCategories)

    } catch (err) {
      console.error('Error loading data:', err)
      setError('Erro ao carregar cardápio')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'bolos': '🎂 Bolos',
      'doces': '🍬 Doces',
      'tortas': '🥧 Tortas',
      'sobremesas': '🍮 Sobremesas',
      'salgados': '🥐 Salgados',
      'bebidas': '🥤 Bebidas',
      'outros': '📦 Outros'
    }
    return labels[category] || category
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Ops!</h1>
        <p className="text-gray-500 text-center">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header business={business || undefined} />
      
      {/* Business Info */}
      {business && (
        <div className="bg-white border-b border-gray-100 px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center gap-4 text-sm text-gray-600">
            {business.delivery_enabled && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{business.delivery_time_estimate}</span>
              </div>
            )}
            {business.pickup_address && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{business.pickup_address}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="sticky top-[60px] z-40 bg-gray-50 px-4 py-3">
        <div className="max-w-lg mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar no cardápio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="sticky top-[124px] z-40 bg-gray-50 px-4 py-2">
        <div className="max-w-lg mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {getCategoryLabel(category)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="px-4 py-4">
        <div className="max-w-lg mx-auto space-y-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-500">Nenhum produto encontrado</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => navigate(`/${slug}/produto/${product.id}`)}
              />
            ))
          )}
        </div>
      </div>

      <CartButton />
    </div>
  )
}
