'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { selectProfile } from '@/redux/slice/authSlice';
import {
  selectCheckoutStep,
  selectCheckoutAddressId,
  selectCheckoutPaymentMethod,
  nextStep,
  prevStep,
  setStep,
  setSelectedAddress,
  setPaymentMethod,
  resetCheckout,
} from '@/redux/slice/checkoutSlice';
import {
  useGetAddressesQuery,
  useAddAddressMutation,
  useGetCartDetailsQuery,
  usePlaceOrderMutation,
} from '@/services/orderApi';
import AddressCard from '@/components/orders/AddressCard';
import AddressForm from '@/components/orders/AddressForm';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { FiCheck, FiMapPin, FiCreditCard, FiCheckSquare, FiPlus } from 'react-icons/fi';

const steps = [
  { id: 1, label: 'Address', icon: <FiMapPin /> },
  { id: 2, label: 'Payment', icon: <FiCreditCard /> },
  { id: 3, label: 'Review', icon: <FiCheckSquare /> },
];

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const currentStep = useSelector(selectCheckoutStep);
  const selectedAddressId = useSelector(selectCheckoutAddressId);
  const paymentMethod = useSelector(selectCheckoutPaymentMethod);

  const profile = useSelector(selectProfile);
  const userId = profile?.user_id;

  // Queries & Mutations
  const { data: addressData, isLoading: isLoadingAddresses } = useGetAddressesQuery(userId, { skip: !userId });
  const { data: cartData, isLoading: isLoadingCart } = useGetCartDetailsQuery(userId, { skip: !userId });
  const [addAddress, { isLoading: isAddingAddress }] = useAddAddressMutation();
  const [placeOrder, { isLoading: isPlacingOrder }] = usePlaceOrderMutation();

  const addresses = addressData?.data || [];
  const rawCartData = cartData?.data;
  const isCartArray = Array.isArray(rawCartData);
  const cartItems = isCartArray ? rawCartData : (rawCartData?.items || []);
  const totalAmount = isCartArray
    ? (rawCartData.length > 0 ? rawCartData[0].cart_total : 0)
    : (rawCartData?.totalAmount || 0);
  const cart = { items: cartItems, totalAmount };

  const [showAddressForm, setShowAddressForm] = useState(false);

  const handleNext = () => {
    if (currentStep === 1 && !selectedAddressId) {
      alert('Please select a delivery address');
      return;
    }
    dispatch(nextStep());
  };

  const handlePrev = () => dispatch(prevStep());

  const handleAddAddress = async (formData) => {
    try {
      const payload = {
        userId,
        ...formData,
        is_default: formData.is_default ? 1 : 0,
      };
      // The backend will automatically link it to the user based on token, 
      // but orderApi.js might expect userId to invalidate cache or similar.
      const res = await addAddress(payload).unwrap();
      setShowAddressForm(false);
      // Backend doesn't return the inserted address object directly in data yet, 
      // so we might not be able to auto-select it immediately without refetching.
      // If it does return it, it would be res.data.address_id.
    } catch (err) {
      console.error('Failed to add address', err);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      await placeOrder({
        user_id: userId,
        address_id: selectedAddressId,
        payment_method: paymentMethod,
        total_amount: cart.totalAmount,
        status: 'pending',
      }).unwrap();

      dispatch(resetCheckout());
      router.replace('/orders');
    } catch (error) {
      // Handled by global middleware
      console.error(error);
    }
  };

  if (isLoadingCart) return <Loader message="Preparing checkout..." />;

  // Block checkout if cart is empty
  if (cart.items.length === 0 && currentStep === 1) {
    return (
      <div className="empty-state">
        <h2 className="empty-state__title">Your cart is empty</h2>
        <Button onClick={() => router.push('/products')}>Go to Products</Button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1 className="page-title">Checkout</h1>

      {/* Stepper */}
      <div className="checkout-stepper">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`checkout-stepper__item ${currentStep === step.id ? 'active' : currentStep > step.id ? 'completed' : ''
              }`}
          >
            <div className="checkout-stepper__icon">
              {currentStep > step.id ? <FiCheck size={16} /> : step.icon}
            </div>
            <span className="checkout-stepper__label">{step.label}</span>
            {step.id !== steps.length && <div className="checkout-stepper__line" />}
          </div>
        ))}
      </div>

      <div className="checkout-content">
        <div className="checkout-content__main">

          {/* STEP 1: ADDRESS */}
          {currentStep === 1 && (
            <div className="checkout-section fade-in">
              <div className="checkout-section__header">
                <h2>Select Delivery Address</h2>
                {!showAddressForm && (
                  <Button variant="ghost" onClick={() => setShowAddressForm(true)}>
                    <FiPlus /> Add New
                  </Button>
                )}
              </div>

              {isLoadingAddresses ? (
                <div className="p-4"><Loader message="Loading addresses..." /></div>
              ) : showAddressForm ? (
                <AddressForm
                  onSubmit={handleAddAddress}
                  onCancel={() => setShowAddressForm(false)}
                  isLoading={isAddingAddress}
                />
              ) : (
                <div className="address-grid">
                  {addresses.length === 0 ? (
                    <p className="text-muted">No saved addresses found.</p>
                  ) : (
                    addresses.map(address => (
                      <AddressCard
                        key={address.address_id || address._id}
                        address={address}
                        isSelected={selectedAddressId === (address.address_id || address._id)}
                        onSelect={(id) => dispatch(setSelectedAddress(id))}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: PAYMENT */}
          {currentStep === 2 && (
            <div className="checkout-section fade-in">
              <h2>Select Payment Method</h2>
              <div className="payment-methods">
                <label className={`payment-method ${paymentMethod === 'credit_card' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="credit_card"
                    checked={paymentMethod === 'credit_card'}
                    onChange={(e) => dispatch(setPaymentMethod(e.target.value))}
                  />
                  <span>Credit Card</span>
                </label>
                <label className={`payment-method ${paymentMethod === 'debit_card' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="debit_card"
                    checked={paymentMethod === 'debit_card'}
                    onChange={(e) => dispatch(setPaymentMethod(e.target.value))}
                  />
                  <span>Debit Card</span>
                </label>
                <label className={`payment-method ${paymentMethod === 'paypal' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => dispatch(setPaymentMethod(e.target.value))}
                  />
                  <span>PayPal</span>
                </label>
                <label className={`payment-method ${paymentMethod === 'upi' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => dispatch(setPaymentMethod(e.target.value))}
                  />
                  <span>UPI</span>
                </label>
                <label className={`payment-method ${paymentMethod === 'wallet' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="wallet"
                    checked={paymentMethod === 'wallet'}
                    onChange={(e) => dispatch(setPaymentMethod(e.target.value))}
                  />
                  <span>Wallet</span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW */}
          {currentStep === 3 && (
            <div className="checkout-section fade-in">
              <h2>Review Your Order</h2>

              <div className="review-box">
                <div className="review-box__header">Delivery Details</div>
                <div className="review-box__content">
                  <p><strong>Address ID:</strong> {selectedAddressId}</p>
                  <p><strong>Payment Method:</strong> {paymentMethod}</p>
                </div>
              </div>

              <div className="review-box">
                <div className="review-box__header">Order Items</div>
                <div className="review-box__content">
                  {cart.items.map(item => (
                    <div key={item.productId} className="review-item">
                      <span>{item.quantity}x {item.name || 'Product'}</span>
                      <span>₹{(item.price * item.quantity)?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="checkout-actions">
            {currentStep > 1 ? (
              <Button variant="secondary" onClick={handlePrev}>Back</Button>
            ) : (
              <div></div> // empty spacer
            )}

            {currentStep < 3 ? (
              <Button variant="primary" onClick={handleNext} disabled={showAddressForm}>
                Continue
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handlePlaceOrder}
                loading={isPlacingOrder}
                className="btn-place-order"
              >
                Place Order
              </Button>
            )}
          </div>
        </div>

        {/* ORDER SUMMARY SIDEBAR */}
        <div className="checkout-content__sidebar">
          <div className="checkout-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Items ({cart.items.length})</span>
              <span>₹{cart?.totalAmount}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span className="text-success">Free</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row summary-row--total">
              <span>Total Pay</span>
              <span>₹{cart?.totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
