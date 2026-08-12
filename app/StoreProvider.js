'use client'
import { useEffect, useRef } from 'react'
import { Provider } from 'react-redux'
import { SessionProvider } from 'next-auth/react'
import { makeStore } from '../lib/store'
import { setProduct } from '../lib/features/product/productSlice'
import { setConfig } from '../lib/features/config/configSlice'

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
        {children}
      </Provider>
    </SessionProvider>
  )
}
