import React, { useState } from 'react';
import { Card, Form, Button, message } from 'antd';
import MedicineSearch from '../common/MedicineSearch';

const MedicineSearchDemo = () => {
  const [form] = Form.useForm();
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  const handleMedicineSelect = (medicine) => {
    console.log('Selected Medicine:', medicine);
    setSelectedMedicine(medicine);
  };

  const handleSubmit = () => {
    if (!selectedMedicine) {
      message.warning('Please select a medicine first');
      return;
    }
    message.success(`Selected: ${selectedMedicine.name} (${selectedMedicine.packSizeLabel})`);
    // Here you would typically submit the form data to your API
  };

  return (
    <Card 
      title="Medicine Search Demo" 
      style={{ maxWidth: 600, margin: '20px auto' }}
    >
      <Form form={form} layout="vertical">
        <Form.Item 
          label="Search and select a medicine"
          name="medicine"
          rules={[{ required: true, message: 'Please select a medicine' }]}
        >
          <MedicineSearch 
            onSelect={handleMedicineSelect}
            placeholder="Type to search medicines..."
            style={{ width: '100%' }}
          />
        </Form.Item>

        {selectedMedicine && (
          <div style={{ marginBottom: 16, padding: '12px', background: '#f9f9f9', borderRadius: '4px' }}>
            <h4>Selected Medicine:</h4>
            <p><strong>Name:</strong> {selectedMedicine.name}</p>
            <p><strong>Manufacturer:</strong> {selectedMedicine.manufacturerName}</p>
            <p><strong>Type:</strong> {selectedMedicine.type}</p>
            <p><strong>Pack Size:</strong> {selectedMedicine.packSizeLabel}</p>
            <p><strong>Price:</strong> ₹{selectedMedicine.price}</p>
          </div>
        )}

        <Form.Item>
          <Button 
            type="primary" 
            onClick={handleSubmit}
            disabled={!selectedMedicine}
          >
            Add to Prescription
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default MedicineSearchDemo;
