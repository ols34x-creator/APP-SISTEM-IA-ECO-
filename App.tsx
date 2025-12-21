
import React, { useState } from 'react';
import AppShell from './components/AppShell';
import FeatureTabs from './components/FeatureTabs';
import LandingPage from './components/LandingPage';
import { useAuth } from './hooks/useAuth';
import AuthPage from './components/AuthPage';

const MainApp: React.FC = () => {
    const [showLanding, setShowLanding] = useState(true);

    const handleEnter = () => {
        setShowLanding(false);
    };

    const handleReturnToLanding = () => {
        setShowLanding(true);
    };

    if (showLanding) {
        return <LandingPage onEnter={handleEnter} />;
    }

    return (
        <div className="flex min-h-screen">
            <AppShell onReturnToLanding={handleReturnToLanding}>
                <FeatureTabs />
            </AppShell>
        </div>
    );
};


const App: React.FC = () => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return <AuthPage />;
    }

    return <MainApp />;
};

export default App;