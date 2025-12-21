import React from 'react';
import { useAppStore } from '../hooks/useAppStore';

const NotificationPanel: React.FC = () => {
    const { notifications, dismissNotification } = useAppStore();

    if (notifications.length === 0) {
        return null;
    }

    const icons = {
        info: 'fa-info-circle',
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        danger: 'fa-times-circle',
    };

    const colors = {
        info: 'bg-blue-500',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        danger: 'bg-red-500',
    };

    return (
        <div className="fixed top-5 right-5 z-[2000] space-y-3 w-80">
            {notifications.map(notification => (
                <div key={notification.id} className={`relative flex items-center p-4 rounded-lg shadow-lg text-white ${colors[notification.type]} animate-slide-in-right`}>
                    <i className={`fas ${icons[notification.type]} text-xl mr-3`}></i>
                    <p className="flex-1 text-sm">{notification.message}</p>
                    <button onClick={() => dismissNotification(notification.id)} className="ml-2 text-lg font-bold">&times;</button>
                </div>
            ))}
            <style>{`
                @keyframes slide-in-right {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in-right { animation: slide-in-right 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default NotificationPanel;
