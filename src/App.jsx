import { useState } from 'react'
import BottomNavigation from './components/BottomNavigation'
import MapView from './views/MapView'
import MotorBikeManagement from './views/MotorBikeManagement'
import './App.css'

function App() {
  const [activeView, setActiveView] = useState('map')

  const renderView = () => {
    switch (activeView) {
      case 'map':
        return <MapView />
      case 'motorcycles':
        return <MotorBikeManagement />
      default:
        return <MapView />
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Traccar GPS</h1>
      </header>
      <main className="app-main">
        {renderView()}
      </main>
      <BottomNavigation 
        activeView={activeView} 
        onViewChange={setActiveView} 
      />
    </div>
  )
}

export default App

