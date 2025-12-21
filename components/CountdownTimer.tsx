
import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
    targetDate: string; // 'DD/MM/YY'
    targetTime?: string; // 'HH:MM'
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, targetTime }) => {
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            if (!targetDate) return;

            // Parse date 'DD/MM/YY'
            const [day, month, year] = targetDate.split('/').map(Number);
            const fullYear = year < 100 ? 2000 + year : year;
            
            let date = new Date(fullYear, month - 1, day);
            
            if (targetTime) {
                const [hours, minutes] = targetTime.split(':').map(Number);
                date.setHours(hours, minutes, 0, 0);
            } else {
                date.setHours(23, 59, 59, 999); // End of day if no time
            }

            const now = new Date();
            const difference = date.getTime() - now.getTime();

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                
                let timeString = '';
                if (days > 0) timeString += `${days}d `;
                timeString += `${hours}h ${minutes}m`;
                
                setTimeLeft(timeString);
                setIsExpired(false);
            } else {
                setTimeLeft('Expirado');
                setIsExpired(true);
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [targetDate, targetTime]);

    if (!targetDate) return null;

    return (
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${isExpired ? 'bg-red-500 text-white' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
            {isExpired ? 'Atrasado' : timeLeft}
        </span>
    );
};

export default CountdownTimer;
