import React from 'react';
import { CustomersAPI } from '../../../shared/api/api';
import { useCustomerContext } from '../../../shared/context/CustomerContext';
import CustomerForm, { CustomerFormValues } from './CustomerForm';

const EMPTY_CUSTOMER: CustomerFormValues = {
  name:    '',
  contact: '',
  phone:   '',
  email:   '',
  address: '',
  type:    'Commercial',
};

export default function AddCustomerScreen() {
  const { addCustomer } = useCustomerContext();

  const createCustomer = async (values: CustomerFormValues) => {
    const created = await CustomersAPI.create({ ...values, active_jobs: 0 });
    addCustomer(created);
  };

  return (
    <CustomerForm
      screenTitle="Add Customer"
      submitLabel="Add Customer"
      initialValues={EMPTY_CUSTOMER}
      onSubmit={createCustomer}
    />
  );
}
