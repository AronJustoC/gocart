'use client'
import { useEffect, useRef } from 'react'
import { Provider } from 'react-redux'
import { SessionProvider } from 'next-auth/react'
import { makeStore } from '../lib/store'
import { setProduct } from '../lib/features/product/productSlice'

function ProductFetcher({ store }) {
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((products) => store.dispatch(setProduct(products)))
  }, [store])
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
        {children}
      </Provider>
    </SessionProvider>
  )
}
