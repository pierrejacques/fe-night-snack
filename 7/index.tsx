import React, { Component, PureComponent, memo, useState, useEffect } from 'react';
import { render } from 'react-dom';

interface Props {
  name: string;
  value: number;
}

class Displayer extends PureComponent<Props> {
  render() {
    const { name, value } = this.props;
    console.log(`render ${name} ${value}`);
    return (
      <div>
        <label>{name}</label>
        <span>{value}</span>
      </div>
    )
  }
}

const DisplayerFC = memo(({ name, value }: Props) => {
    console.log(`render ${name}`);
    return (
      <div>
        <label>{name}</label>
        <span>{value}</span>
      </div>
    )
});

const App = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCount(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <DisplayerFC name="十位" value={Math.floor(count / 10)} />
      <DisplayerFC name="个位" value={count % 10} />
    </div>
  )
}

render(App, document.getElementById('#app'));
