import React from 'react';
import { useRoute } from '@react-navigation/native';
import { CustomersAPI } from '../../../shared/api/api';
import { useCustomerContext } from '../../../shared/context/CustomerContext';
import CustomerForm, { CustomerFormValues } from './CustomerForm';

export default function EditCustomerScreen() {
  const route = useRoute();
  const { customerId } = route.params as { customerId: number };
  const { customers, updateCustomer } = useCustomerContext();
  const customer = customers.find(existing => existing.id === customerId)!;

  const initialValues: CustomerFormValues = {
    name:    customer.name,
    contact: customer.contact,
    phone:   customer.phone,
    email:   customer.email,
    address: customer.address,
    type:    customer.type,
  };

  const saveCustomer = async (values: CustomerFormValues) => {
    const saved = await CustomersAPI.update(customer.id, { ...customer, ...values });
    updateCustomer(saved);
  };

  return (
    <CustomerForm
      screenTitle="Edit Customer"
      submitLabel="Save Changes"
      initialValues={initialValues}
      onSubmit={saveCustomer}
    />
  );
}
