import React from 'react';

const COLORS = [
    '#4f46e5', '#7c3aed', '#db2777', '#059669', '#d97706',
    '#dc2626', '#0284c7', '#16a34a', '#9333ea', '#ea580c',
    '#0891b2', '#be185d', '#65a30d', '#c026d3', '#0d9488',
];

const getColor = (name = '') => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return COLORS[Math.abs(hash) % COLORS.length];
};

const getInitials = (name = '') => {
    const trimmed = name.trim();
    if (!trimmed) return '?';
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return trimmed[0].toUpperCase();
};

const Avatar = ({ username = '', size = 40, className = '', showOnlineDot = false }) => {
    const bg = getColor(username);
    const initials = getInitials(username);

    return (
        <div className={`relative flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
            <div
                className="rounded-full flex items-center justify-center font-bold text-white border border-white/10 select-none"
                style={{
                    width: size,
                    height: size,
                    minWidth: size,
                    minHeight: size,
                    fontSize: size * 0.38,
                    backgroundColor: bg,
                }}
            >
                {initials}
            </div>
            {showOnlineDot && (
                <div
                    className="absolute bottom-0 right-0 bg-green-500 rounded-full border-2 border-neutral-900"
                    style={{ width: size * 0.3, height: size * 0.3 }}
                />
            )}
        </div>
    );
};

export default Avatar;
