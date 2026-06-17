import { useForm } from 'react-hook-form';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function AddressForm({ onSubmit, onCancel, isLoading, initialData }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: initialData || {
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      address_type: 'shipping',
      is_default: false,
    },
  });

  return (
    <form className="address-form fade-in" onSubmit={handleSubmit(onSubmit)}>
      <div className="address-form__grid">
        <Input
          label="Address Line 1"
          placeholder="House No, Building, Street"
          {...register('address_line1', { required: 'Address Line 1 is required' })}
          error={errors.address_line1?.message}
        />

        <Input
          label="Address Line 2"
          placeholder="Locality, Area"
          {...register('address_line2', { required: 'Address Line 2 is required' })}
          error={errors.address_line2?.message}
        />

        <Input
          label="City"
          placeholder="City"
          {...register('city', { required: 'City is required' })}
          error={errors.city?.message}
        />

        <Input
          label="State"
          placeholder="State"
          {...register('state', { required: 'State is required' })}
          error={errors.state?.message}
        />

        <Input
          label="Pincode"
          placeholder="Pincode"
          type="text"
          maxLength="6"
          {...register('pincode', { 
            required: 'Pincode is required',
            pattern: { value: /^[0-9]{6}$/, message: 'Invalid pincode' }
          })}
          error={errors.pincode?.message}
        />

        <div className="input-group">
          <label className="input-group__label">Address Type</label>
          <select
            className="input-group__field"
            {...register('address_type')}
          >
            <option value="shipping">Shipping</option>
            <option value="billing">Billing</option>
            <option value="home">Home</option>
            <option value="office">Office</option>
          </select>
        </div>

        <div className="input-group" style={{ gridColumn: '1 / -1', flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
          <input
            type="checkbox"
            id="is_default"
            {...register('is_default')}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
          <label htmlFor="is_default" style={{ cursor: 'pointer', margin: 0 }}>
            Set as default address
            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>Used for all future orders and billing</div>
          </label>
        </div>
      </div>

      <div className="address-form__actions" style={{ marginTop: '20px' }}>
        <Button variant="secondary" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={isLoading} disabled={!isValid}>
          {initialData ? 'Update Address' : 'Save Address'}
        </Button>
      </div>
    </form>
  );
}
