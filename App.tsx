import React from 'react';
import { Experience } from './components/Experience';
import { UI } from './components/UI';
import { GestureController } from './components/GestureController';

const App: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-[#050505]">
      <Experience />
      <UI />
      <GestureController />
    </div>
  );
};

export default App;
