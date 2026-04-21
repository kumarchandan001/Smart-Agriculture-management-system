import React from 'react';
import SoilDashboard from '../../pages/SoilDashboard';

export default function Soil(){
  return (
    <div style={{padding: '12px', marginTop: '12px'}}>
      <SoilDashboard compact={true} />
    </div>
  );
}
