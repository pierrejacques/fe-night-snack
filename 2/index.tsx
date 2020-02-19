import React, { useState, useEffect } from 'react';

export const TinyComponent = () => {
  const [count, setCount] = useState(0);

  const increaseCount = () => {
    console.log(count);
    setCount(count + 1);
  };

  useEffect(() => {
    window.addEventListener('resize', increaseCount);
    return () => {
      window.removeEventListener('resize', increaseCount);
    }
  }, [increaseCount])

  return <div>我是一份前端夜点心</div>
}

export const useWindowSize = () => {
  // 第一步：声明能够体现视口大小变化的状态
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // 第二步：通过生命周期 Hook 声明回调的绑定和解绑逻辑
  useEffect(() => {
    const updateSize = () => setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
}

export const TinyComponentImproved = () => {
  const [count, setCount] = useState(0);

  const windowSize = useWindowSize();

  const increaseCount = () => {
    console.log(count);
    setCount(count + 1);
  };

  // 第三步：通过值来触发回调逻辑
  useEffect(increaseCount, [windowSize]);

  return <div>我是一份前端夜点心</div>
}
