import React from 'react';
import PestDashboard from '../../pages/PestDashboard';

export default function Pest(){
  return (
    <div style={{padding: '12px', marginTop: '12px'}}>
      <PestDashboard compact={true} />
    </div>
  );
}
