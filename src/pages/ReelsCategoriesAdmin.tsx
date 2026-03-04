import React from 'react';
import { ReelsCategoriesManagement } from '@/components/admin/ReelsCategoriesManagement';

const ReelsCategoriesAdmin = () => {
  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
      <h1 className="mb-4 text-2xl font-bold sm:mb-6 sm:text-3xl">إدارة أقسام الريلز</h1>
      <ReelsCategoriesManagement />
    </div>
  );
};

export default ReelsCategoriesAdmin;
