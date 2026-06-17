'use client';

/**
 * CartItem — single item row in the cart
 * Shows product image, name, price, quantity stepper, and remove button
 * Links product name/image to the SSR product detail page
 */
import Link from 'next/link';
import Image from 'next/image';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';

export default function CartItem({ item, onUpdate, onRemove }) {
  const productId = item.productId || item.product_id || item._id;
  const lineTotal = (item.price || 0) * (item.quantity || 1);

  // console.log('item==============>', item)

  return (
    <div className="cart-item" id={`cart-item-${productId}`}>
      {/* Product Image — links to detail page */}
      <Link href={`/product?id=${productId}`} className="cart-item__image-container">
        {item.image || item.image_url ? (
          <Image src={item.image || item.image_url} alt={item.name} className="cart-item__image" width={100} height={100} unoptimized />
        ) : (
          <div className="cart-item__image-placeholder">No Image</div>
        )}
      </Link>

      {/* Product Details */}
      <div className="cart-item__details">
        <Link href={`/product?id=${productId}`} className="cart-item__name-link">
          <h4 className="cart-item__name">{item.name || 'Product Name'}</h4>
        </Link>
        {item.category && (
          <span className="cart-item__category">{item.category}</span>
        )}
        <div className="cart-item__price">₹{parseFloat(item?.price)?.toFixed(2) || '0.00'}</div>
      </div>

      {/* Actions: Quantity + Remove */}
      <div className="cart-item__actions">
        <div className="quantity-stepper">
          <button
            className="quantity-stepper__btn"
            onClick={() => onUpdate(productId, -1)}
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
          >
            <FiMinus size={14} />
          </button>
          <span className="quantity-stepper__value">{item.quantity}</span>
          <button
            className="quantity-stepper__btn"
            onClick={() => onUpdate(productId, 1)}
            aria-label="Increase quantity"
          >
            <FiPlus size={14} />
          </button>
        </div>

        <div className="cart-item__line-total">
          ₹{lineTotal.toFixed(2)}
        </div>

        <button
          className="cart-item__remove"
          onClick={() => onRemove(productId)}
          title="Remove item"
          aria-label="Remove item from cart"
        >
          <FiTrash2 size={18} />
        </button>
      </div>
    </div>
  );
}
