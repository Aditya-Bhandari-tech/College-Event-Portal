import React from 'react';
import { Play, Trash2, Maximize2, Image as ImageIcon } from 'lucide-react';

/**
 * Premium Gallery Media Grid Component
 * Used for both General Gallery and Event-specific Galleries
 */
const GalleryMediaGrid = ({
    title,
    subtitle,
    items = [],
    onItemClick,
    onDelete,
    canManage = false,
    icon: Icon = ImageIcon,
    gradientClasses = "from-blue-50 to-indigo-50/30",
    headerAccentClasses = "bg-blue-600 shadow-blue-200",
    badgeClasses = "text-blue-600 border-blue-200",
    emptyMessage = "No media items found in this section."
}) => {
    if (items.length === 0) return null;

    return (
        <section className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden group mb-8">
            {/* Dynamic Header */}
            <div className={`p-5 md:p-6 bg-gradient-to-r ${gradientClasses} border-b border-slate-100 flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${headerAccentClasses} text-white rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-500`}>
                        <Icon size={24} />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">{title}</h3>
                        {subtitle && <p className="text-sm text-slate-500 font-medium">{subtitle}</p>}
                    </div>
                </div>
                <div className="text-right">
                    <span className={`px-4 py-1.5 bg-white/80 backdrop-blur-sm ${badgeClasses} text-xs font-black rounded-full border shadow-sm uppercase tracking-wider`}>
                        {items.length} File{items.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Media Grid */}
            <div className="p-4 md:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                    {items.map((img, idx) => (
                        <div
                            key={img.public_id || img._id || idx}
                            className="group/item aspect-square rounded-2xl overflow-hidden relative shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 bg-slate-50"
                        >
                            {img.resource_type === 'video' ? (
                                <div
                                    className="w-full h-full flex items-center justify-center group-hover/item:scale-110 transition-transform duration-700 cursor-pointer"
                                    onClick={() => onItemClick(items, idx)}
                                >
                                    <video
                                        src={img.url}
                                        className="w-full h-full object-cover opacity-90"
                                        muted
                                        playsInline
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover/item:bg-black/20 transition-colors">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-2xl">
                                            <Play size={24} className="text-white fill-white ml-1" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <img
                                    src={img.url}
                                    alt={`${title} item ${idx + 1}`}
                                    className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700 cursor-pointer"
                                    loading="lazy"
                                    onClick={() => onItemClick(items, idx)}
                                />
                            )}

                            {/* Hover Overlays */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 pointer-events-none flex items-end p-3">
                                <Maximize2 size={18} className="text-white/80" />
                            </div>

                            {/* Action Buttons */}
                            {canManage && onDelete && (
                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 translate-y-2 group-hover/item:opacity-100 group-hover/item:translate-y-0 transition-all duration-300">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(img.public_id, img._id); }}
                                        className="p-2.5 bg-red-500/90 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg backdrop-blur-sm hover:scale-110 active:scale-95"
                                        title="Remove Media"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default GalleryMediaGrid;
