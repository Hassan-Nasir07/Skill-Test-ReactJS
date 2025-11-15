import React, { useState, memo } from 'react';
import PrecisionGame from './features/precision-game/PrecisionGame';
import ModernAimTrainerGame from './components/ModernAimTrainerGame';
import ModernRefleXGame from './components/ModernRefleXGame';
import ModernTypingGame from './components/ModernTypingGame';
import './App.css';

const App = memo(() => {
    const [currentGame, setCurrentGame] = useState('precision');

    const handleGameChange = (gameKey) => {
        setCurrentGame(gameKey);
    };

    const renderCurrentGame = () => {
        switch (currentGame) {
            case 'precision':
                return <PrecisionGame onGameChange={handleGameChange} />;
            case 'aim':
                return <ModernAimTrainerGame onGameChange={handleGameChange} />;
            case 'reflex':
                return <ModernRefleXGame onGameChange={handleGameChange} />;
            case 'typing':
                return <ModernTypingGame onGameChange={handleGameChange} />;
            default:
                return <PrecisionGame onGameChange={handleGameChange} />;
        }
    };

    return (
        <div className="container-fluid min-vh-100 bg-dark">
            <div className="row min-vh-100">
                <div className="col-12">
                    {renderCurrentGame()}
                </div>
            </div>
        </div>
    );
});

App.displayName = 'App';

export default App;
