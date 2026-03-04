import React from 'react';
import { ReelsCardManagement } from '@/components/admin/ReelsCardManagement';

const ReelsCardAdmin = () => {
  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
      <h1 className="mb-4 text-2xl font-bold sm:mb-6 sm:text-3xl">إدارة كارت الريلز</h1>
      <ReelsCardManagement />
    </div>
  );
};

export default ReelsCardAdmin;
