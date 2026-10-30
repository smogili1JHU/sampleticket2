import { useState } from 'react'
import TicketForm from './TicketForm';
import TicketList from './TicketList';
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
    /*const [count, setCount] = useState(0);*/
    const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
      
              <h1>New Ticket</h1>
              <TicketForm onCreated={() => setRefreshKey(k => k + 1)} />

              <h2>Tickets</h2>
              <TicketList refreshKey={refreshKey} />
        {/*<button*/}
        {/*  type="button"*/}
        {/*  className="counter"*/}
        {/*  onClick={() => setCount((count) => count + 1)}*/}
        {/*>*/}
        {/*  Count is {count}*/}
        {/*</button>*/}
      </section>

      <div className="ticks"></div>

    

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
