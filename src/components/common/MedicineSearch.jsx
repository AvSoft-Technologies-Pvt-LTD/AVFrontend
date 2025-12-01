import React, { useState, useEffect, useRef, useCallback } from 'react';
import { searchMedicinesByName } from '../../utils/masterService';
import { debounce } from 'lodash';
import { Input, List, Spin, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const MedicineSearch = ({
  onSelect,
  placeholder = 'Search medicine...',
  style = { width: '100%' },
  disabled = false,
  initialValue = '',
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const searchRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await searchMedicinesByName(searchQuery);
        setSuggestions(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error searching medicines:', err);
        setError('Failed to fetch medicines. Please try again.');
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Handle input change
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim()) {
      setLoading(true);
      debouncedSearch(value);
    } else {
      setSuggestions([]);
    }
  };

  // Handle medicine selection
  const handleSelect = (medicine) => {
    setQuery(medicine.name);
    onSelect?.(medicine);
    setIsDropdownVisible(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={searchRef}>
      <Input
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        prefix={<SearchOutlined />}
        style={style}
        disabled={disabled}
        onFocus={() => setIsDropdownVisible(true)}
        allowClear
      />
      
      {isDropdownVisible && (loading || suggestions.length > 0 || error) && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 10,
            background: 'white',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            maxHeight: '250px',
            overflowY: 'auto',
            marginTop: '4px',
          }}
        >
          {loading ? (
            <div style={{ padding: '10px', textAlign: 'center' }}>
              <Spin size="small" />
            </div>
          ) : error ? (
            <div style={{ padding: '10px', color: '#ff4d4f' }}>{error}</div>
          ) : suggestions.length === 0 ? (
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description="No medicines found" 
              style={{ padding: '10px' }}
            />
          ) : (
            <List
              size="small"
              dataSource={suggestions}
              renderItem={(medicine) => (
                <List.Item
                  onClick={() => handleSelect(medicine)}
                  style={{
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>{medicine.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {medicine.manufacturerName} • {medicine.type} • {medicine.packSizeLabel}
                    </div>
                    <div style={{ fontSize: '12px', color: '#1890ff' }}>
                      ₹{medicine.price}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MedicineSearch;
