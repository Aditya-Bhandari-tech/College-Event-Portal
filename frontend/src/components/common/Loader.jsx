import React from 'react';

const Loader = () => (
    <div className="flex justify-center py-10" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="sr-only">Loading...</span>
    </div>
);

export default Loader;
