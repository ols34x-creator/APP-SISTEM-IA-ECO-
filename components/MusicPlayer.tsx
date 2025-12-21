import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '../hooks/useAppStore';

interface Track {
    src: string;
    title: string;
    artist: string;
}

const defaultPlaylist: Track[] = [
    {
        src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        title: 'Arde Outra Vez',
        artist: 'Thalles Roberto',
    },
    {
        src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
        title: 'Oceans (Where Feet May Fail)',
        artist: 'Hillsong United',
    },
    {
        src: 'https://storage.googleapis.com/media-session/sintel/snow-fight.mp3',
        title: 'What A Beautiful Name',
        artist: 'Hillsong Worship',
    },
];

const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const MusicPlayer: React.FC = () => {
    const { setIsMusicPlayerOpen, isMusicPlayerMinimized, setIsMusicPlayerMinimized } = useAppStore();
    const [tracks] = useState<Track[]>(defaultPlaylist);
    const [trackIndex, setTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isShuffled, setIsShuffled] = useState(false);
    const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');

    const audioRef = useRef<HTMLAudioElement>(null);
    const playerRef = useRef<HTMLDivElement>(null);
    const dragOffset = useRef({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 80 });

    const currentTrack = tracks[trackIndex];

    const playNext = useCallback(() => {
        if (isShuffled) {
            setTrackIndex(Math.floor(Math.random() * tracks.length));
        } else {
            setTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
        }
    }, [isShuffled, tracks.length]);

    useEffect(() => {
        const particlesContainer = document.getElementById('particles-container');
        if (!particlesContainer) return;

        const particleCount = 40;
        const createdParticles: HTMLElement[] = [];
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            const left = Math.random() * 100;
            const delay = Math.random() * 15;
            const duration = 15 + Math.random() * 10;
            const color = Math.random() > 0.5 ? 'rgb(var(--color-primary))' : 'rgb(var(--color-secondary))';
            
            particle.style.left = `${left}vw`;
            particle.style.animationDelay = `${delay}s`;
            particle.style.animationDuration = `${duration}s`;
            particle.style.background = color;
            
            particlesContainer.appendChild(particle);
            createdParticles.push(particle);
        }

        return () => {
            createdParticles.forEach(p => p.remove());
        };
    }, []);

    const onMouseDown = (e: React.MouseEvent) => {
        if (!playerRef.current) return;
        setIsDragging(true);
        const rect = playerRef.current.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        setPosition({
            x: e.clientX - dragOffset.current.x,
            y: e.clientY - dragOffset.current.y,
        });
    }, [isDragging]);

    const onMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        } else {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [isDragging, onMouseMove, onMouseUp]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.play().catch(e => console.error("Error playing audio:", e));
        } else {
            audio.pause();
        }
    }, [isPlaying, trackIndex]);
    
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const timeUpdate = () => setCurrentTime(audio.currentTime);
        const loadedMeta = () => setDuration(audio.duration);
        const onEnded = () => {
            if (repeatMode === 'one') {
                audio.currentTime = 0;
                audio.play();
            } else if (repeatMode === 'all' || !isShuffled) {
                playNext();
            } else if (isShuffled) {
                playNext();
            }
        };

        audio.addEventListener('timeupdate', timeUpdate);
        audio.addEventListener('loadedmetadata', loadedMeta);
        audio.addEventListener('ended', onEnded);

        if (isPlaying) {
            audio.play().catch(e => console.error("Error playing audio on track change:", e));
        }

        return () => {
            audio.removeEventListener('timeupdate', timeUpdate);
            audio.removeEventListener('loadedmetadata', loadedMeta);
            audio.removeEventListener('ended', onEnded);
        };
    }, [trackIndex, playNext, repeatMode, isShuffled, isPlaying]);

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (duration === 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newTime = (clickX / rect.width) * duration;
        if (audioRef.current) audioRef.current.currentTime = newTime;
    };

    const togglePlayPause = () => setIsPlaying(!isPlaying);
    const prevTrack = () => setTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    const toggleShuffle = () => setIsShuffled(!isShuffled);
    const toggleRepeat = () => {
        const modes: Array<'none' | 'one' | 'all'> = ['none', 'all', 'one'];
        const nextIndex = (modes.indexOf(repeatMode) + 1) % modes.length;
        setRepeatMode(modes[nextIndex]);
    };
    
    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
    
    if (isMusicPlayerMinimized) {
        return (
            <div ref={playerRef} className="player-container minimized" style={{ top: `${position.y}px`, left: `${position.x}px` }}>
                <div className="player-minimized-content drag-handle" onMouseDown={onMouseDown}>
                    <div className="minimized-song-info">
                        <div className="minimized-song-title">{currentTrack.title}</div>
                        <div className="minimized-song-artist">{currentTrack.artist}</div>
                    </div>
                    <div className="minimized-controls">
                        <button className="control-btn play-btn" onClick={togglePlayPause}>
                            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                        </button>
                        <button className="control-btn" onClick={playNext}><i className="fas fa-step-forward"></i></button>
                        <button className="control-btn" onClick={() => setIsMusicPlayerMinimized(false)}><i className="fas fa-expand-alt"></i></button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div ref={playerRef} className="player-container" style={{ top: `${position.y}px`, left: `${position.x}px` }}>
            <div className="album-art drag-handle" onMouseDown={onMouseDown}>
                <div className="album-art-header">
                    <button onClick={() => setIsMusicPlayerMinimized(true)} className="window-btn minimize-btn" aria-label="Minimize Player"><i className="fas fa-minus"></i></button>
                    <button onClick={() => setIsMusicPlayerOpen(false)} className="window-btn close-btn" aria-label="Close Player"><i className="fas fa-times"></i></button>
                </div>
                <div className="text-center">
                    <div className="music-text">music</div>
                    <div className="lorem-text">Lorem ipsum dolor sit</div>
                </div>
                <div className="wave-container">
                    {Array.from({ length: 8 }).map((_, i) => <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.1}s`, animationPlayState: isPlaying ? 'running' : 'paused' }}></div>)}
                </div>
            </div>
            
            <div className="player-content">
                <div className="song-info">
                    <div className="song-title">{currentTrack.title}</div>
                    <div className="song-artist">{currentTrack.artist}</div>
                </div>
                <div className="progress-container">
                    <div className="progress-bar" onClick={handleProgressClick}>
                        <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                    <div className="time-display">
                        <span>{formatTime(currentTime)}</span>
                        <span>-{formatTime(duration - currentTime)}</span>
                    </div>
                </div>
                <div className="controls">
                    <button onClick={toggleShuffle} className={`control-btn ${isShuffled ? 'active' : ''}`} aria-label="Shuffle"><i className="fas fa-random"></i></button>
                    <button onClick={prevTrack} className="control-btn" aria-label="Previous Track"><i className="fas fa-step-backward"></i></button>
                    <button onClick={togglePlayPause} className="control-btn play-btn" aria-label={isPlaying ? 'Pause' : 'Play'}><i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i></button>
                    <button onClick={playNext} className="control-btn" aria-label="Next Track"><i className="fas fa-step-forward"></i></button>
                    <button onClick={toggleRepeat} className={`control-btn ${repeatMode !== 'none' ? 'active' : ''}`} aria-label="Repeat">
                        <i className={`fas ${repeatMode === 'one' ? 'fa-redo-alt' : 'fa-redo'}`}></i>
                        {repeatMode === 'one' && <span style={{fontSize: '8px', position:'absolute', top:'10px', fontWeight:'bold'}}>1</span>}
                    </button>
                </div>
                <div className="branding">
                    <div className="logo">
                        <div className="logo-icon"><i className="fas fa-leaf"></i></div>
                        <div className="logo-text">ECO.<span>PLAY</span></div>
                    </div>
                    <div className="eco-music">ECO.MUSIC</div>
                </div>
            </div>

            <audio ref={audioRef} src={currentTrack?.src} preload="metadata"></audio>
        </div>
    );
};

export default MusicPlayer;