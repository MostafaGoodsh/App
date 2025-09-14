import React from 'react';
import { ReelsCardManagement } from '@/components/admin/ReelsCardManagement';

const ReelsCardAdmin = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">إدارة كارت الريلز</h1>
        <p className="text-muted-foreground mt-2">
          قم بتعديل عنوان ووصف وخلفية كارت الفيديوهات القصيرة
        </p>
      </div>
      
      <ReelsCardManagement />
    </div>
  );
};

export default ReelsCardAdmin;