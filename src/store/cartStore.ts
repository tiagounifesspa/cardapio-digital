import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, CustomerInfo, PaymentMethod } from '../types'

interface CartState {
  items: CartItem[]
  deliveryType: 'pickup' | 'delivery' | null
  customerInfo: CustomerInfo | null
  paymentMethod: PaymentMethod | null
  paymentChangeFor: number | null
  businessSlug: string | null
  
  // Actions
  addItem: (item: CartItem) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  setDeliveryType: (type: 'pickup' | 'delivery') => void
  setCustomerInfo: (info: CustomerInfo) => void
  setPaymentMethod: (method: PaymentMethod) => void
  setPaymentChangeFor: (value: number | null) => void
  setBusinessSlug: (slug: string) => void
  
  // Computed
  getSubtotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryType: null,
      customerInfo: null,
      paymentMethod: null,
      paymentChangeFor: null,
      businessSlug: null,

      addItem: (item) => {
        set((state) => {
          // Check if item already exists with same options
          const existingIndex = state.items.findIndex(
            (i) => 
              i.menuItem.id === item.menuItem.id &&
              JSON.stringify(i.selectedOptions) === JSON.stringify(item.selectedOptions)
          )

          if (existingIndex >= 0) {
            const newItems = [...state.items]
            newItems[existingIndex].quantity += item.quantity
            newItems[existingIndex].totalPrice = 
              newItems[existingIndex].quantity * 
              (item.menuItem.price + item.selectedOptions.reduce(
                (acc, opt) => acc + opt.values.reduce((a, v) => a + v.priceModifier, 0), 0
              ))
            return { items: newItems }
          }

          return { items: [...state.items, item] }
        })
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId)
        }))
      },

      updateQuantity: (itemId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((item) => item.id !== itemId) }
          }

          return {
            items: state.items.map((item) => {
              if (item.id === itemId) {
                const unitPrice = item.menuItem.price + 
                  item.selectedOptions.reduce(
                    (acc, opt) => acc + opt.values.reduce((a, v) => a + v.priceModifier, 0), 0
                  )
                return {
                  ...item,
                  quantity,
                  totalPrice: quantity * unitPrice
                }
              }
              return item
            })
          }
        })
      },

      clearCart: () => {
        set({
          items: [],
          deliveryType: null,
          customerInfo: null,
          paymentMethod: null,
          paymentChangeFor: null
        })
      },

      setDeliveryType: (type) => set({ deliveryType: type }),
      setCustomerInfo: (info) => set({ customerInfo: info }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setPaymentChangeFor: (value) => set({ paymentChangeFor: value }),
      setBusinessSlug: (slug) => set({ businessSlug: slug }),

      getSubtotal: () => {
        return get().items.reduce((acc, item) => acc + item.totalPrice, 0)
      },

      getItemCount: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0)
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        deliveryType: state.deliveryType,
        customerInfo: state.customerInfo,
        paymentMethod: state.paymentMethod,
        paymentChangeFor: state.paymentChangeFor,
        businessSlug: state.businessSlug
      })
    }
  )
)
