import React from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { UsersAPI, AppUser } from '../../../shared/api/api';
import { useStaffContext } from '../../../shared/context/StaffContext';
import StaffForm, { StaffFormValues } from './StaffForm';

type EditStaffRouteProp = RouteProp<{ EditStaff: { staff: AppUser } }, 'EditStaff'>;

export default function EditStaffScreen() {
  const route           = useRoute<EditStaffRouteProp>();
  const { staff }       = route.params;
  const { updateStaff } = useStaffContext();

  const initialValues: StaffFormValues = {
    name:            staff.name,
    phone:           staff.phone ?? '',
    email:           staff.email ?? '',
    yearsExperience: String(staff.years_experience ?? ''),
    role:            staff.role,
    available:       staff.available ?? true,
    specialties:     staff.specialties ?? [],
    password:        '',
  };

  const saveStaffMember = async (values: StaffFormValues) => {
    const payload: Partial<AppUser> = {
      name:             values.name,
      phone:            values.phone,
      email:            values.email,
      years_experience: parseInt(values.yearsExperience, 10) || 0,
      available:        values.available,
      specialties:      values.specialties,
    };

    const updated = await UsersAPI.update(staff.id, payload);
    updateStaff(updated);
  };

  return (
    <StaffForm
      mode="edit"
      screenTitle="Edit Staff Member"
      submitLabel="Save Changes"
      initialValues={initialValues}
      onSubmit={saveStaffMember}
    />
  );
}
