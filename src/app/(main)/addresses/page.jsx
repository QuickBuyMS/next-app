'use client';

import { useState } from 'react';
import { useGetAddressesQuery, useAddAddressMutation, useUpdateAddressMutation } from '@/services/orderApi';
import { useSelector, useDispatch } from 'react-redux';
import AddressCard from '@/components/orders/AddressCard';
import AddressForm from '@/components/orders/AddressForm';
import Loader from '@/components/ui/Loader';
import Button from '@/components/ui/Button';
import { FiPlus } from 'react-icons/fi';
import { showSnackbar } from '@/redux/slice/snackbarSlice';

import { selectProfile } from '@/redux/slice/authSlice';

export default function AddressesPage() {
  const profile = useSelector(selectProfile);
  const userId = profile?.user_id;
  const dispatch = useDispatch();

  const { data: response, isLoading } = useGetAddressesQuery(userId, {
    skip: !userId,
  });
  
  const [addAddress, { isLoading: isAdding }] = useAddAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();

  const addresses = response?.data || [];

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const handleAddNew = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleEdit = (address) => {
    setEditingAddress({
      ...address,
      is_default: address.is_default === 1 || address.is_default === true,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleSubmit = async (formData) => {
    try {
      const payload = {
        userId: userId,
        ...formData,
        is_default: formData.is_default ? 1 : 0,
      };

      if (editingAddress) {
        await updateAddress({ addressId: editingAddress.address_id, ...payload }).unwrap();
        dispatch(showSnackbar({ message: 'Address updated successfully' }));
      } else {
        await addAddress(payload).unwrap();
        dispatch(showSnackbar({ message: 'Address added successfully' }));
      }
      
      setShowForm(false);
      setEditingAddress(null);
    } catch (err) {
      dispatch(showSnackbar({ 
        message: err?.data?.message || 'Failed to save address', 
        type: 'error' 
      }));
    }
  };

  if (isLoading) {
    return <div className="p-8 flex-center"><Loader message="Loading addresses..." /></div>;
  }

  return (
    <div className="addresses-page fade-in" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>My Addresses</h1>
        {!showForm && (
          <Button variant="primary" onClick={handleAddNew} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiPlus /> Add New Address
          </Button>
        )}
      </div>

      {showForm ? (
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #eee', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h2>
          <AddressForm 
            initialData={editingAddress}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isAdding || isUpdating}
          />
        </div>
      ) : (
        <div className="address-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {addresses.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '12px', gridColumn: '1 / -1' }}>
              <p style={{ color: '#666', marginBottom: '16px' }}>You haven't saved any addresses yet.</p>
              <Button variant="outline" onClick={handleAddNew}>Add Your First Address</Button>
            </div>
          ) : (
            addresses.map(address => (
              <AddressCard 
                key={address.address_id || address._id} 
                address={address} 
                onEdit={handleEdit}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
