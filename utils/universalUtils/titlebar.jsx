import React, { useEffect, useState } from 'react';
import { Breadcrumb } from 'antd';

const Titles = ({ items, onClick }) =>{
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
    }, []);
  
    if (!mounted) return null;
    return (
    
    <Breadcrumb separator=">">
      {items.map((item, index) => (
        <Breadcrumb.Item key={index}>
          <span
            onClick={() => onClick(item, index)}
          >
            {item.title}
          </span>
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  )};
  
export default Titles;
