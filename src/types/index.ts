export interface Business {
  id: string
  user_id: string
  business_name: string
  business_phone: string
  business_address?: string
  business_logo?: string
  business_description?: string
  delivery_enabled: boolean
  delivery_fee: number
  delivery_min_order: number
  delivery_time_estimate: string
  pickup_enabled: boolean
  pickup_time_estimate: string
  pickup_address?: string
  business_hours: BusinessHours
  slug: string
}

export interface BusinessHours {
  monday: DayHours
  tuesday: DayHours
  wednesday: DayHours
  thursday: DayHours
  friday: DayHours
  saturday: DayHours
  sunday: DayHours
}

export interface DayHours {
  open: string | null
  close: string | null
  enabled: boolean
}

export interface MenuItem {
  id: string
  user_id: string
  name: string
  description?: string
  category: string
  price: number
  image?: string
  available: boolean
  preparation_time: number
  options?: ProductOption[]
}

export interface ProductOption {
  id: string
  menu_item_id: string
  name: string
  type: 'single' | 'multiple'
  required: boolean
  min_selections: number
  max_selections?: number
  values: ProductOptionValue[]
}

export interface ProductOptionValue {
  id: string
  option_id: string
  name: string
  price_modifier: number
  is_default: boolean
  is_active: boolean
}

export interface PaymentMethod {
  id: string
  user_id: string
  name: string
  type: 'cash' | 'pix' | 'credit_card' | 'debit_card' | 'other'
  instructions?: string
  icon?: string
  is_active: boolean
}

export interface CartItem {
  id: string
  menuItem: MenuItem
  quantity: number
  selectedOptions: SelectedOption[]
  notes?: string
  totalPrice: number
}

export interface SelectedOption {
  optionId: string
  optionName: string
  values: {
    valueId: string
    valueName: string
    priceModifier: number
  }[]
}

export interface CustomerInfo {
  name: string
  phone: string
  address?: string
  addressComplement?: string
  notes?: string
}

export interface Order {
  id?: string
  user_id: string
  order_number?: string
  customer_name: string
  customer_phone: string
  customer_address?: string
  customer_address_complement?: string
  customer_notes?: string
  items: CartItem[]
  subtotal: number
  delivery_fee: number
  discount: number
  total: number
  delivery_type: 'pickup' | 'delivery'
  payment_method_id: string
  payment_method_name: string
  payment_change_for?: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
}
