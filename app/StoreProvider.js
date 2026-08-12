'use client'
import { useEffect, useRef } from 'react'
import { Provider } from 'react-redux'
import { SessionProvider, useSession } from 'next-auth/react'
import { makeStore } from '../lib/store'
import { setProduct } from '../lib/features/product/productSlice'
import { setConfig } from '../lib/features/config/configSlice'
import { setCart } from '../lib/features/cart/cartSlice'

function ProductFetcher({ store }) {
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((products) => store.dispatch(setProduct(products)))
  }, [store])
  return null
}

function ConfigFetcher({ store }) {
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((config) => store.dispatch(setConfig(config)))
  }, [store])
  return null
}

// hybrid cart persistence: localStorage always (works logged-out, survives
// refresh), plus a one-time merge into User.cart once authenticated, then
// keeps the DB copy in sync so it follows the user across devices
function CartSync({ store }) {
  const { status } = useSession()
  const hasMergedRef = useRef(false)

  useEffect(() => {
    const saved = localStorage.getItem('cart')
    if (!saved) return
    try {
      store.dispatch(setCart(JSON.parse(saved)))
    } catch { }
  }, [store])

  useEffect(() => {
    return store.subscribe(() => {
      localStorage.setItem('cart', JSON.stringify(store.getState().cart.cartItems))
    })
  }, [store])

  useEffect(() => {
    if (status !== 'authenticated' || hasMergedRef.current) return
    hasMergedRef.current = true

    fetch('/api/cart')
      .then((res) => (res.ok ? res.json() : { cart: {} }))
      .then(({ cart: dbCart }) => {
        const localCart = store.getState().cart.cartItems
        const merged = { ...dbCart }
        for (const [productId, qty] of Object.entries(localCart)) {
          merged[productId] = (merged[productId] || 0) + qty
        }
        store.dispatch(setCart(merged))
        fetch('/api/cart', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart: merged }),
        })
      })
  }, [status, store])

  useEffect(() => {
    if (status !== 'authenticated') return
    let timeout
    const unsubscribe = store.subscribe(() => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        fetch('/api/cart', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart: store.getState().cart.cartItems }),
        })
      }, 800)
    })
    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
  }, [status, store])

  return null
}

export default function StoreProvider({ children }) {
  const storeRef = useRef(undefined)
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
  }

  return (
    <SessionProvider>
      <Provider store={storeRef.current}>
        <ProductFetcher store={storeRef.current} />
        <ConfigFetcher store={storeRef.current} />
        <CartSync store={storeRef.current} />
        {children}
      </Provider>
    </SessionProvider>
  )
}
