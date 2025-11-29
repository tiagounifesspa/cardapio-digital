import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Search, MapPin, Truck, Package, Sparkles, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Header } from '../components/Header'
import { ProductCard } from '../components/ProductCard'
import { CartButton } from '../components/CartButton'
import { useCartStore } from '../store/cartStore'
import { Business, MenuItem } from '../types'

// Ícones das categorias
const categoryIcons: Record<string, string> = {
  'bolos': '🎂',
  'doces': '🍬',
  'tortas': '🥧',
  'sobremesas': '🍮',
  'salgados': '🥐',
  'bebidas': '🥤',
  'outros': '📦'
}

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
      'bolos': 'Bolos',
      'doces': 'Doces',
      'tortas': 'Tortas',
      'sobremesas': 'Sobremesas',
      'salgados': 'Salgados',
      'bebidas': 'Bebidas',
      'outros': 'Outros'
    }
    return labels[category] || category.charAt(0).toUpperCase() + category.slice(1)
  }

  const getCategoryIcon = (category: string) => {
    return categoryIcons[category] || '📦'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-rose-500 animate-pulse-soft" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white" />
        </div>
        <p className="text-gray-500 font-medium animate-pulse">Carregando cardápio...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass rounded-3xl p-8 text-center max-w-sm">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Ops!</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-28">
      <Header business={business || undefined} />
      
      {/* Business Info Banner */}
      {business && (
        <div className="glass border-b border-pink-100/50 px-4 py-4">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
              {business.delivery_enabled && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100">
                  <Truck className="w-4 h-4 text-pink-500" />
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    {business.delivery_time_estimate}
                  </span>
                </div>
              )}
              {business.pickup_enabled && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                  <Package className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Retirada: {business.pickup_time_estimate}
                  </span>
                </div>
              )}
              {business.pickup_address && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                    {business.pickup_address}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="sticky top-[72px] z-40 glass-strong px-4 py-3 border-b border-pink-100/30">
        <div className="max-w-lg mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400" />
            <input
              type="text"
              placeholder="O que você deseja hoje?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-white/80 border border-pink-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 placeholder-gray-400 text-gray-700 font-medium transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-pink-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="sticky top-[140px] z-40 glass px-4 py-3">
        <div className="max-w-lg mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200'
                  : 'bg-white/80 text-gray-600 hover:bg-white hover:shadow-md border border-pink-100'
              }`}
            >
              <span className="text-base">✨</span>
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200'
                    : 'bg-white/80 text-gray-600 hover:bg-white hover:shadow-md border border-pink-100'
                }`}
              >
                <span className="text-base">{getCategoryIcon(category)}</span>
                {getCategoryLabel(category)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="px-4 py-6">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Category Title */}
          {selectedCategory !== 'all' && (
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{getCategoryIcon(selectedCategory)}</span>
              <h2 className="text-2xl font-bold text-gray-800">
                {getCategoryLabel(selectedCategory)}
              </h2>
              <span className="px-3 py-1 bg-pink-100 text-pink-600 text-sm font-semibold rounded-full">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'itens'}
              </span>
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-500">Tente buscar por outro termo</p>
            </div>
          ) : (
            filteredProducts.map((product, index) => (
              <div 
                key={product.id}
                style={{ animationDelay: `${index * 50}ms` }}
                className="animate-slide-up"
              >
                <ProductCard
                  product={product}
                  onClick={() => navigate(`/${slug}/produto/${product.id}`)}
                />
              </div>
            ))
          )}
        </div>
      </div>

      <CartButton />
    </div>
  )
}
