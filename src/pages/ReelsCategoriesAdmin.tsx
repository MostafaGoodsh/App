import React from 'react';
import { ReelsCategoriesManagement } from '@/components/admin/ReelsCategoriesManagement';

const ReelsCategoriesAdmin = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">إدارة أقسام الريلز</h1>
      <ReelsCategoriesManagement />
    </div>
  );
};

export default ReelsCategoriesAdmin;