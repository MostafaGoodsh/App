import React from 'react';
import { ReelsCardManagement } from '@/components/admin/ReelsCardManagement';

const ReelsCardAdmin = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">إدارة كارت الريلز</h1>
      <ReelsCardManagement />
    </div>
  );
};

export default ReelsCardAdmin;