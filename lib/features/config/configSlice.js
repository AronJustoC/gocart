import { createSlice } from '@reduxjs/toolkit'

const configSlice = createSlice({
    name: 'config',
    initialState: {
        currencySymbol: '$',
        culqiPublicKey: '',
    },
    reducers: {
        setConfig: (state, action) => {
            state.currencySymbol = action.payload.currencySymbol
            state.culqiPublicKey = action.payload.culqiPublicKey
        },
    }
})

export const { setConfig } = configSlice.actions

export default configSlice.reducer
