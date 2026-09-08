import { useEffect, useRef, useState } from 'react';
import { getAddressesAPI, type Address } from '../../api/addresses';
import { useAuth } from '../../context/AuthContext';
import './AddressSelector.css';

interface AddressSelectorProps {
  onSelect: (addressLine1: string, siteLocation: string) => void;
}

export default function AddressSelector({ onSelect }: AddressSelectorProps) {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    getAddressesAPI()
      .then((res) => {
        const list = res.data?.addresses ?? [];
        setAddresses(list);
        const def = list.find((a) => a.isDefault);
        if (def) {
          setSelectedId(def._id);
          onSelectRef.current(formatAddressLine(def), formatLocation(def));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user || loading) return null;
  if (addresses.length === 0) return null;

  function formatAddressLine(a: Address): string {
    const parts = [a.addressLine1, a.addressLine2].filter(Boolean);
    return parts.join(', ');
  }

  function formatLocation(a: Address): string {
    return [a.city, a.state, a.pincode].filter(Boolean).join(', ');
  }

  function handleSelect(addr: Address) {
    setSelectedId(addr._id);
    onSelect(formatAddressLine(addr), formatLocation(addr));
  }

  function handleClear() {
    setSelectedId(null);
    onSelect('', '');
  }

  return (
    <div className="addr-selector">
      <span className="addr-selector-label">Saved Addresses</span>
      <div className="addr-selector-list">
        {addresses.map((addr) => (
          <button
            key={addr._id}
            type="button"
            className={`addr-selector-card ${selectedId === addr._id ? 'addr-selector-card--active' : ''}`}
            onClick={() => handleSelect(addr)}
          >
            <span className="addr-selector-card-label">
              {addr.label}
              {addr.isDefault && <span className="addr-selector-default">Default</span>}
            </span>
            <span className="addr-selector-card-line">{formatAddressLine(addr)}</span>
            <span className="addr-selector-card-location">{formatLocation(addr)}</span>
          </button>
        ))}
        <button
          type="button"
          className={`addr-selector-card addr-selector-card--manual ${selectedId === null ? 'addr-selector-card--active' : ''}`}
          onClick={handleClear}
        >
          <span className="addr-selector-card-label">Enter Manually</span>
          <span className="addr-selector-card-line">Type a new address below</span>
        </button>
      </div>
    </div>
  );
}
