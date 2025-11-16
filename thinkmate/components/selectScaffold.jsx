import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';




const SelectScaffold = ({ selection = null }) => {
    useEffect(() => {
        console.log('[SelectScaffold] selection changed:', selection);
    }, [selection]);

    return (
    <div style={{ 
        padding: '1rem', 
        borderRadius: '8px', 
        background: 'rgba(255,255,255,0.1)',
        width: '85%',
        margin: 'auto',
        }}>
        <div
        style={{ 
            color: '#eee',
            fontSize: '1rem',
            }}
            >Current selection:</div>
        <div style={{ 
            marginTop: 8,
            color: '#eee',
            fontSize: '1.5rem',
            fontWeight: '500',
            }}>{selection ?? 'none'}</div>
    </div>
);

};

export default SelectScaffold;