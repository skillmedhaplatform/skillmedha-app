import React from 'react';
import switchStyles from './switch.module.scss';

const Switch = ({ isOn }) => {
  const backgroundColor = isOn ? switchStyles.on : switchStyles.off;
  const label = isOn ? 'ON' : 'OFF';

  return (
    <div className={`${switchStyles.switch} ${backgroundColor}`}>
      <div className={switchStyles.knob} />
      <span className={switchStyles.label}>{label}</span>
    </div>
  );
};
export default Switch;

