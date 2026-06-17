import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentStep: 1, // 1: Address, 2: Payment, 3: Review
  selectedAddressId: null,
  paymentMethod: 'credit_card', // default to credit_card
};

export const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    nextStep: (state) => {
      if (state.currentStep < 3) state.currentStep += 1;
    },
    prevStep: (state) => {
      if (state.currentStep > 1) state.currentStep -= 1;
    },
    setStep: (state, action) => {
      state.currentStep = action.payload;
    },
    setSelectedAddress: (state, action) => {
      state.selectedAddressId = action.payload;
    },
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    resetCheckout: (state) => {
      return initialState;
    },
  },
});

export const {
  nextStep,
  prevStep,
  setStep,
  setSelectedAddress,
  setPaymentMethod,
  resetCheckout,
} = checkoutSlice.actions;

export const selectCheckoutStep = (state) => state.checkout.currentStep;
export const selectCheckoutAddressId = (state) => state.checkout.selectedAddressId;
export const selectCheckoutPaymentMethod = (state) => state.checkout.paymentMethod;

export default checkoutSlice.reducer;
