import React from 'react';
import { UsersAPI, AppUser } from '../../../shared/api/api';
import { useStaffContext } from '../../../shared/context/StaffContext';
import StaffForm, { StaffFormValues } from './StaffForm';

const EMPTY_STAFF_MEMBER: StaffFormValues = {
  name:            '',
  phone:           '',
  email:           '',
  yearsExperience: '',
  role:            'technician',
  available:       true,
  specialties:     [],
  password:        '',
};

export default function AddStaffScreen() {
  const { addStaff } = useStaffContext();

  const createStaffMember = async (values: StaffFormValues) => {
    const isTechnician = values.role === 'technician';

    const payload: Omit<AppUser, 'id'> & { password: string } = {
      name:             values.name,
      email:            values.email,
      password:         values.password,
      role:             values.role,
      phone:            values.phone,
      technician_id:    null,
      specialties:      isTechnician ? values.specialties : [],
      available:        isTechnician ? values.available : null,
      jobs_today:       null,
      rating:           null,
      years_experience: isTechnician ? parseInt(values.yearsExperience, 10) || 0 : null,
    };

    const created = await UsersAPI.create(payload);
    addStaff(created);
  };

  return (
    <StaffForm
      mode="create"
      screenTitle="Add Staff Member"
      submitLabel="Add Staff Member"
      initialValues={EMPTY_STAFF_MEMBER}
      onSubmit={createStaffMember}
    />
  );
}
