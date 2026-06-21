import React from 'react';

export default function SkeletonCard() {
  return (
    <div style={{ cursor: 'default' }}>
      <div className="dc-skeleton" style={{ aspectRatio: '3/4', borderRadius: 4, marginBottom: 12 }} />
      <div className="dc-skeleton" style={{ height: 10, width: '45%', borderRadius: 4, marginBottom: 8 }} />
      <div className="dc-skeleton" style={{ height: 14, width: '85%', borderRadius: 4, marginBottom: 6 }} />
      <div className="dc-skeleton" style={{ height: 14, width: '65%', borderRadius: 4, marginBottom: 10 }} />
      <div className="dc-skeleton" style={{ height: 16, width: '40%', borderRadius: 4 }} />
    </div>
  );
}
