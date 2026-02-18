import React from 'react';

const EmptyState = ({ message }) => (
    <div className="text-center py-8 sm:py-12 bg-white rounded-2xl border border-dashed border-slate-300 px-4" role="status">
        <p className="text-slate-500">{message}</p>
    </div>
);

export default EmptyState;
