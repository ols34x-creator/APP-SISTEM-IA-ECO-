
import React, { useState, useEffect, useRef } from 'react';

// Extend the Window interface to include the YouTube API callback and player object
declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
        YT: any;
    }
}

const EcoPlay: React.FC = () => {
    const [videoUrl, setVideoUrl] = useState('');
    const [currentMedia, setCurrentMedia] = useState<{ id: string, type: 'youtube' | 'direct' | 'other' }>({ id: 'jfKfPfyJRdk', type: 'youtube' });
    const playerRef = useRef<any>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Function to extract video ID from various YouTube URL formats
    const getYouTubeId = (url: string) => {
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname === 'youtu.be') {
                return urlObj.pathname.slice(1);
            } else if (urlObj.hostname.includes('youtube.com')) {
                return urlObj.searchParams.get('v') || '';
            }
        } catch (e) {
            return '';
        }
        return '';
    };

    const isDirectVideo = (url: string) => {
        return /\.(mp4|webm|ogg)$/i.test(url);
    };

    const handleLoadVideo = () => {
        if (!videoUrl.trim()) return;

        const ytId = getYouTubeId(videoUrl);
        if (ytId) {
            setCurrentMedia({ id: ytId, type: 'youtube' });
        } else if (isDirectVideo(videoUrl)) {
            setCurrentMedia({ id: videoUrl, type: 'direct' });
        } else {
            setCurrentMedia({ id: videoUrl, type: 'other' });
        }
    };
    
    useEffect(() => {
        if (currentMedia.type !== 'youtube') return;

        // Initialize or reload YouTube player
        const initYT = () => {
            if (playerRef.current && playerRef.current.loadVideoById) {
                playerRef.current.loadVideoById(currentMedia.id);
            } else if (window.YT && window.YT.Player) {
                playerRef.current = new window.YT.Player('youtube-player', {
                    height: '100%',
                    width: '100%',
                    videoId: currentMedia.id,
                    playerVars: {
                        'playsinline': 1,
                        'autoplay': 0,
                        'controls': 1,
                        'modestbranding': 1,
                    },
                });
            }
        };

        window.onYouTubeIframeAPIReady = initYT;
        
        if (window.YT && window.YT.Player) {
            initYT();
        }
    }, [currentMedia]);

    const renderPlayer = () => {
        if (currentMedia.type === 'youtube') {
            return <div id="youtube-player" className="w-full h-full"></div>;
        }
        if (currentMedia.type === 'direct') {
            return (
                <video 
                    ref={videoRef}
                    src={currentMedia.id}
                    controls
                    className="w-full h-full bg-black object-contain"
                />
            );
        }
        // Fallback for other platforms (Vimeo, etc) via direct iframe
        return (
            <iframe 
                src={currentMedia.id}
                className="w-full h-full border-none"
                allowFullScreen
                allow="autoplay; encrypted-media"
            />
        );
    };

    const controlAction = (action: 'play' | 'pause' | 'stop') => {
        if (currentMedia.type === 'youtube' && playerRef.current) {
            if (action === 'play') playerRef.current.playVideo();
            if (action === 'pause') playerRef.current.pauseVideo();
            if (action === 'stop') playerRef.current.stopVideo();
        } else if (currentMedia.type === 'direct' && videoRef.current) {
            if (action === 'play') videoRef.current.play();
            if (action === 'pause') videoRef.current.pause();
            if (action === 'stop') { videoRef.current.pause(); videoRef.current.currentTime = 0; }
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-bg-card rounded-2xl p-6 shadow-xl border border-border-color/50">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
                    <div>
                        <h2 className="text-3xl font-black text-light tracking-tight flex items-center gap-3">
                            <i className="fas fa-play-circle text-primary animate-pulse"></i> ECO.PLAY
                        </h2>
                        <p className="text-gray-text text-sm mt-1">Player multimídia integrado para auditorias, treinamentos ou monitoramento.</p>
                    </div>
                    
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-grow">
                            <input 
                                type="text"
                                value={videoUrl}
                                onChange={e => setVideoUrl(e.target.value)}
                                placeholder="Link do YouTube, Vimeo ou arquivo .mp4..."
                                className="w-full md:w-[400px] p-4 bg-bg-main border border-border-color rounded-xl text-light focus:border-primary transition-all outline-none pr-12 text-sm"
                            />
                            <i className="fas fa-link absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
                        </div>
                        <button 
                            onClick={handleLoadVideo}
                            className="bg-primary text-white font-black uppercase tracking-widest px-8 py-4 rounded-xl hover:opacity-90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                        >
                            <i className="fas fa-cloud-download-alt"></i> Carregar
                        </button>
                    </div>
                </div>

                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-border-color/30 group">
                    {renderPlayer()}
                </div>

                <div className="flex justify-center items-center gap-6 mt-8 p-6 bg-bg-main/50 rounded-2xl border border-border-color/30">
                    <button onClick={() => controlAction('stop')} className="control-btn bg-danger/20 text-danger hover:bg-danger hover:text-white">
                        <i className="fas fa-stop"></i>
                    </button>
                    <button onClick={() => controlAction('pause')} className="control-btn bg-warning/20 text-warning hover:bg-warning hover:text-white">
                        <i className="fas fa-pause"></i>
                    </button>
                    <button onClick={() => controlAction('play')} className="control-btn bg-success text-white hover:scale-110 shadow-xl shadow-success/20">
                        <i className="fas fa-play text-xl"></i>
                    </button>
                    
                    <div className="h-10 w-px bg-border-color/50 mx-4 hidden md:block"></div>
                    
                    <div className="hidden md:flex flex-col text-left">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tipo de Mídia</span>
                        <span className="text-xs font-bold text-light uppercase">{currentMedia.type} {currentMedia.type === 'youtube' ? 'API Engine' : 'Direct Link'}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-bg-card p-4 rounded-xl border border-border-color/50 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary"><i className="fab fa-youtube"></i></div>
                    <div><p className="text-xs font-bold text-light">YouTube Docs</p><p className="text-[10px] text-gray-500">Integração nativa</p></div>
                </div>
                <div className="bg-bg-card p-4 rounded-xl border border-border-color/50 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary"><i className="fas fa-file-video"></i></div>
                    <div><p className="text-xs font-bold text-light">Arquivos Diretos</p><p className="text-[10px] text-gray-500">MP4, WebM, Ogg</p></div>
                </div>
                <div className="bg-bg-card p-4 rounded-xl border border-border-color/50 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center text-warning"><i className="fas fa-external-link-square-alt"></i></div>
                    <div><p className="text-xs font-bold text-light">Outros</p><p className="text-[10px] text-gray-500">Vimeo, Twitch, etc</p></div>
                </div>
            </div>

            <style>{`
                .control-btn {
                    width: 56px;
                    height: 56px;
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default EcoPlay;
