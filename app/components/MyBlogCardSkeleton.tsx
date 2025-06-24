import React from "react";

const MyBlogCardSkeleton: React.FC = () => {
  return (
    <div className="myblog-card skeleton flex flex-col space-y-2 border-2 px-3 py-3 h-auto animate-pulse">
      <div className="bg-gray-300 w-3/4 h-6 rounded"></div>
      <div className="bg-gray-200 w-full h-48 rounded"></div>
      <div className="bg-gray-300 w-1/4 h-4 rounded"></div>
      <div className="flex justify-end space-x-2 mt-auto">
        <div className="bg-gray-200 w-16 h-8 rounded"></div>
        <div className="bg-gray-200 w-16 h-8 rounded"></div>
      </div>
    </div>
  );
};

export default MyBlogCardSkeleton;
