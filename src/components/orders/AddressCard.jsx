import { FiCheckCircle, FiEdit2 } from 'react-icons/fi';

export default function AddressCard({ address, isSelected, onSelect, onEdit }) {
  return (
    <div
      className={`address-card ${isSelected ? 'address-card--selected' : ''}`}
      onClick={() => onSelect && onSelect(address.address_id || address._id)}
      style={{ cursor: onSelect ? 'pointer' : 'default' }}
    >
      <div className="address-card__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h4 className="address-card__type" style={{ textTransform: 'uppercase', fontSize: '12px', background: '#f0f0f0', padding: '4px 8px', borderRadius: '4px' }}>
            {address.address_type || 'shipping'}
          </h4>
          {(address.is_default === 1 || address.is_default === true) && (
            <span style={{ fontSize: '10px', background: '#e8f5e9', color: '#2e7d32', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
              DEFAULT
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onEdit && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(address); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#008b8b' }}
            >
              <FiEdit2 size={18} />
            </button>
          )}
          {isSelected && (
            <FiCheckCircle className="address-card__check" size={20} />
          )}
        </div>
      </div>

      <div className="address-card__body" style={{ marginTop: '12px' }}>
        <p className="address-card__text" style={{ fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' }}>
          {address.address_line1}
          {address.address_line2 && `, ${address.address_line2}`}
        </p>
        <p className="address-card__text" style={{ color: '#666', fontSize: '14px', marginBottom: '2px' }}>
          {address.city}, {address.state} - {address.pincode}
        </p>
        <p className="address-card__text address-card__text--muted" style={{ color: '#999', fontSize: '13px' }}>
          {address.country || 'India'}
        </p>
      </div>
    </div>
  );
}
