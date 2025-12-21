
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useAppStore } from '../hooks/useAppStore';

// Define types for global Leaflet library
declare const L: any;

const portsData = [
    { id: 1, name: "Porto de Santos", country: "Brasil", code: "BRSSZ", lat: -23.9608, lng: -46.3332, capacity: "120M t/ano", routes: [2, 3, 5] },
    { id: 2, name: "Porto de Rotterdam", country: "Holanda", code: "NLRTM", lat: 51.8850, lng: 4.2690, capacity: "470M t/ano", routes: [1, 3, 4] },
    { id: 3, name: "Porto de Xangai", country: "China", code: "CNSHA", lat: 31.2304, lng: 121.4737, capacity: "650M t/ano", routes: [1, 2, 4, 5] },
    { id: 4, name: "Porto de Singapore", country: "Singapura", code: "SGSIN", lat: 1.3521, lng: 103.8198, capacity: "600M t/ano", routes: [2, 3, 5] },
    { id: 5, name: "Porto de Los Angeles", country: "EUA", code: "USLAX", lat: 33.7542, lng: -118.2160, capacity: "200M t/ano", routes: [1, 3, 4] },
    { id: 6, name: "Porto de Hamburgo", country: "Alemanha", code: "DEHAM", lat: 53.5511, lng: 9.9937, capacity: "130M t/ano", routes: [2, 4] },
];

const EcoMaps: React.FC = () => {
    const { addNotification } = useAppStore();
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const routeLayer = useRef<any>(null);
    
    // UI States
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Logic States
    const [originPort, setOriginPort] = useState('');
    const [destinationPort, setDestinationPort] = useState('');
    const [routeInfo, setRouteInfo] = useState<any>(null);
    const [isSatellite, setIsSatellite] = useState(false);

    const filteredPorts = useMemo(() => {
        if (!searchQuery) return portsData;
        const q = searchQuery.toLowerCase();
        return portsData.filter(p => 
            p.name.toLowerCase().includes(q) ||
            p.country.toLowerCase().includes(q) ||
            p.code.toLowerCase().includes(q)
        );
    }, [searchQuery]);
    
    // Helper to setup popup actions globally (since Leaflet HTML strings are outside React scope)
    useEffect(() => {
        (window as any).setMapOrigin = (id: string) => {
            setOriginPort(id);
            addNotification({ message: 'Porto de origem definido!', type: 'info' });
        };
        (window as any).setMapDestination = (id: string) => {
            setDestinationPort(id);
            addNotification({ message: 'Porto de destino definido!', type: 'info' });
        };
    }, [addNotification]);

    // Map setup
    useEffect(() => {
        if (mapRef.current && !mapInstance.current) {
            const map = L.map(mapRef.current, { zoomControl: false }).setView([20, 0], 2);
            mapInstance.current = map;
            
            const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri'
            });

            // Store layers for toggling
            (map as any).layers = { osm: osmLayer, satellite: satelliteLayer };

            const portIcon = L.divIcon({
                html: '<i class="fas fa-anchor text-primary text-lg"></i>',
                className: 'bg-bg-card p-1 rounded-full shadow-lg border border-border-color flex items-center justify-center',
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
            });

            portsData.forEach(port => {
                const connectedPortsList = port.routes.map(id => {
                    const p = portsData.find(x => x.id === id);
                    return p ? p.name : null;
                }).filter(Boolean).join('<br/>• ');

                // Enhanced Popup with Actions
                const popupContent = `
                    <div style="min-width: 240px; font-family: 'Segoe UI', sans-serif; color: #1f2937;">
                        <div style="border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 10px;">
                            <h3 style="font-weight: 800; color: #111827; font-size: 16px; margin: 0; line-height: 1.2;">${port.name}</h3>
                            <div style="font-size: 12px; color: #6b7280; margin-top: 4px; display: flex; align-items: center; gap: 6px;">
                                <i class="fas fa-globe-americas"></i> ${port.country} 
                                <span style="background: #ccfbf1; color: #0f766e; padding: 1px 6px; border-radius: 4px; font-weight: 700; font-size: 10px;">${port.code}</span>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                            <div style="background: #f3f4f6; padding: 8px; border-radius: 6px;">
                                <div style="font-size: 9px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Capacidade</div>
                                <div style="font-size: 13px; color: #111827; font-weight: 700;">${port.capacity}</div>
                            </div>
                            <div style="background: #f3f4f6; padding: 8px; border-radius: 6px;">
                                <div style="font-size: 9px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Rotas</div>
                                <div style="font-size: 13px; color: #111827; font-weight: 700;">${port.routes.length} Conexões</div>
                            </div>
                        </div>

                        <div style="display: flex; gap: 5px; margin-top: 10px;">
                            <button onclick="window.setMapOrigin('${port.id}')" style="flex: 1; background: #3b82f6; color: white; border: none; padding: 6px; border-radius: 4px; font-size: 11px; cursor: pointer; font-weight: bold;">
                                Definir Origem
                            </button>
                            <button onclick="window.setMapDestination('${port.id}')" style="flex: 1; background: #10b981; color: white; border: none; padding: 6px; border-radius: 4px; font-size: 11px; cursor: pointer; font-weight: bold;">
                                Definir Destino
                            </button>
                        </div>
                    </div>
                `;

                L.marker([port.lat, port.lng], { icon: portIcon })
                    .addTo(map)
                    .bindPopup(popupContent);
            });
        }
    }, []);

    const calculateRoute = () => {
        if (!originPort || !destinationPort || originPort === destinationPort) {
            addNotification({ message: 'Selecione portos de origem e destino diferentes.', type: 'warning' });
            return;
        }
        const origin = portsData.find(p => p.id === parseInt(originPort));
        const destination = portsData.find(p => p.id === parseInt(destinationPort));

        if (origin && destination && mapInstance.current) {
            if (routeLayer.current) {
                mapInstance.current.removeControl(routeLayer.current);
            }
            
            routeLayer.current = L.Routing.control({
                waypoints: [ L.latLng(origin.lat, origin.lng), L.latLng(destination.lat, destination.lng) ],
                routeWhileDragging: true,
                lineOptions: { styles: [{ color: 'rgb(var(--color-secondary))', opacity: 0.8, weight: 6 }] },
                createMarker: () => null, // Hide default markers
                show: false, // Hide instruction panel
                addWaypoints: false
            }).addTo(mapInstance.current);

            // Mock route info
            const distance = Math.round(mapInstance.current.distance([origin.lat, origin.lng], [destination.lat, destination.lng]) / 1000);
            setRouteInfo({
                name: `Rota ${origin.name} → ${destination.name}`,
                ports: `${origin.code} → ${destination.code}`,
                distance: `${distance.toLocaleString('pt-BR')} km`,
                duration: `${Math.round(distance / 450)} dias`,
                fuel: `${(distance * 0.15).toLocaleString('pt-BR', {maximumFractionDigits:0})} t`,
                co2: `${(distance * 0.47).toLocaleString('pt-BR', {maximumFractionDigits:0})} t`,
                description: `Rota marítima simulada entre ${origin.country} e ${destination.country}.`
            });
            
            addNotification({ message: 'Rota calculada com sucesso!', type: 'success' });
            // Close sidebar on mobile/small screens when route is calculated for better view
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
        }
    };
    
    const clearRoute = () => {
        if (routeLayer.current && mapInstance.current) {
            mapInstance.current.removeControl(routeLayer.current);
            routeLayer.current = null;
        }
        setOriginPort('');
        setDestinationPort('');
        setRouteInfo(null);
        addNotification({ message: 'Rota limpa.', type: 'info' });
    };

    const toggleSatelliteView = () => {
        const map = mapInstance.current;
        if (!map) return;
        if (isSatellite) {
            map.removeLayer(map.layers.satellite);
            map.addLayer(map.layers.osm);
        } else {
            map.removeLayer(map.layers.osm);
            map.addLayer(map.layers.satellite);
        }
        setIsSatellite(!isSatellite);
    };
    
    return (
        <div className="flex h-[calc(100vh-120px)] bg-bg-card rounded-lg shadow-2xl overflow-hidden relative">
            
            {/* Sidebar Toggle Button (Visible when closed) */}
            {!isSidebarOpen && (
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="absolute top-4 left-4 z-[1001] w-10 h-10 bg-bg-card border border-border-color rounded-lg shadow-lg flex items-center justify-center text-primary hover:bg-bg-main transition-all"
                    title="Abrir Painel"
                >
                    <i className="fas fa-bars"></i>
                </button>
            )}

            {/* Sidebar */}
            <div className={`${isSidebarOpen ? 'w-[380px] opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-10'} bg-bg-main flex flex-col flex-shrink-0 border-r border-border-color transition-all duration-300 ease-in-out overflow-hidden relative`}>
                
                <div className="p-5 h-full flex flex-col">
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-border-color">
                        <div className="flex items-center gap-3">
                            <i className="fas fa-ship text-2xl text-primary"></i>
                            <h1 className="text-xl font-bold text-light">ECO.<span className="text-primary">MAPS</span></h1>
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)} className="text-gray-text hover:text-light transition-colors">
                            <i className="fas fa-chevron-left"></i>
                        </button>
                    </div>
                    
                    {/* Route Controls */}
                    <div className="bg-bg-card p-4 rounded-lg mb-4 border border-border-color shadow-sm shrink-0">
                        <h3 className="font-semibold text-secondary mb-3 flex items-center gap-2 text-sm">
                            <i className="fas fa-route"></i> Planejador de Rotas
                        </h3>
                        <div className="space-y-3">
                            <div className="relative">
                                <label className="text-[10px] font-bold text-gray-text uppercase absolute -top-1.5 left-2 bg-bg-card px-1">Origem</label>
                                <select value={originPort} onChange={e => setOriginPort(e.target.value)} className="form-select w-full mt-1 text-sm pt-2">
                                    <option value="">Selecione ou clique no mapa</option>
                                    {portsData.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                                </select>
                            </div>
                            <div className="relative">
                                <label className="text-[10px] font-bold text-gray-text uppercase absolute -top-1.5 left-2 bg-bg-card px-1">Destino</label>
                                 <select value={destinationPort} onChange={e => setDestinationPort(e.target.value)} className="form-select w-full mt-1 text-sm pt-2">
                                    <option value="">Selecione ou clique no mapa</option>
                                    {portsData.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                                </select>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button onClick={calculateRoute} className="btn-action flex-1 bg-primary text-sm hover:bg-opacity-90 shadow-md"><i className="fas fa-calculator mr-2"></i>Calcular</button>
                                <button onClick={clearRoute} className="btn-action flex-1 bg-border-color text-sm hover:bg-opacity-80 shadow-md"><i className="fas fa-trash mr-2"></i>Limpar</button>
                            </div>
                        </div>
                    </div>

                    {/* Ports List */}
                    <div className="flex-grow flex flex-col min-h-0">
                         <h3 className="font-semibold text-secondary mb-3 flex items-center gap-2 text-sm">
                            <i className="fas fa-anchor"></i> Portos Principais
                         </h3>
                         <div className="relative mb-3 shrink-0">
                            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-text text-xs"></i>
                            <input type="text" placeholder="Buscar portos..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="form-input w-full pl-9 py-2 text-sm" />
                        </div>
                        <div className="overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {filteredPorts.map(port => (
                                <div key={port.id} className="bg-bg-card p-3 rounded-lg border-l-4 border-transparent hover:border-primary transition-all cursor-pointer hover:bg-border-color/30 group" onClick={() => {
                                    if(mapInstance.current) {
                                        mapInstance.current.flyTo([port.lat, port.lng], 5);
                                    }
                                }}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-light text-sm">{port.name}</p>
                                            <p className="text-[10px] text-gray-text">{port.country}</p>
                                        </div>
                                        <span className="text-[10px] font-mono bg-bg-main px-1.5 py-0.5 rounded text-secondary border border-border-color">{port.code}</span>
                                    </div>
                                    <div className="text-[10px] text-gray-text flex justify-between mt-2 pt-2 border-t border-border-color/50">
                                        <span className="flex items-center gap-1"><i className="fas fa-weight-hanging text-gray-500"></i> {port.capacity}</span>
                                        <span className="flex items-center gap-1 group-hover:text-light transition-colors"><i className="fas fa-network-wired text-gray-500"></i> {port.routes.length} rotas</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-grow relative h-full w-full">
                <div ref={mapRef} id="map" className="w-full h-full bg-gray-900 z-0"></div>
                
                {/* Floating Map Controls */}
                <div className="absolute top-5 right-5 z-[1000] flex flex-col gap-2">
                     <button onClick={() => mapInstance.current?.zoomIn()} className="map-btn" title="Zoom In"><i className="fas fa-plus"></i></button>
                     <button onClick={() => mapInstance.current?.zoomOut()} className="map-btn" title="Zoom Out"><i className="fas fa-minus"></i></button>
                     <button onClick={toggleSatelliteView} className="map-btn" title="Alternar Satélite"><i className={`fas ${isSatellite ? 'fa-map' : 'fa-satellite'}`}></i></button>
                </div>

                {/* Route Info Overlay */}
                {routeInfo && (
                     <div className="absolute bottom-5 left-5 right-5 md:right-auto z-[1000] bg-bg-main/95 backdrop-blur-md p-5 rounded-lg md:w-96 shadow-2xl border-l-4 border-secondary ring-1 ring-white/10 animate-fade-in-up">
                        <div className="flex justify-between items-start border-b border-border-color pb-3 mb-3">
                             <div className="overflow-hidden">
                                <h2 className="text-lg font-bold text-light truncate">{routeInfo.name}</h2>
                                <p className="text-xs text-gray-400 font-mono mt-1">{routeInfo.ports}</p>
                            </div>
                            <button onClick={() => setRouteInfo(null)} className="text-gray-400 hover:text-white transition-colors ml-2">&times;</button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="bg-bg-card p-2 rounded border border-border-color"> <p className="text-base font-bold text-secondary">{routeInfo.distance}</p><p className="text-[10px] text-gray-text uppercase tracking-wider">Distância</p> </div>
                            <div className="bg-bg-card p-2 rounded border border-border-color"> <p className="text-base font-bold text-secondary">{routeInfo.duration}</p><p className="text-[10px] text-gray-text uppercase tracking-wider">Duração Est.</p> </div>
                            <div className="bg-bg-card p-2 rounded border border-border-color"> <p className="text-base font-bold text-warning">{routeInfo.fuel}</p><p className="text-[10px] text-gray-text uppercase tracking-wider">Combustível</p> </div>
                            <div className="bg-bg-card p-2 rounded border border-border-color"> <p className="text-base font-bold text-danger">{routeInfo.co2}</p><p className="text-[10px] text-gray-text uppercase tracking-wider">Emissão CO₂</p> </div>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                .form-input, .form-select { width: 100%; padding: 8px; border: 1px solid rgb(var(--color-border-color)); border-radius: 5px; background-color: rgb(var(--color-bg-main)); color: rgb(var(--color-light)); outline: none; }
                .form-input:focus, .form-select:focus { border-color: rgb(var(--color-primary)); }
                .btn-action { padding: 10px 18px; border: none; border-radius: 5px; cursor: pointer; font-weight: 600; color: white; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
                .map-btn { width: 40px; height: 40px; background-color: rgb(var(--color-bg-card)); color: rgb(var(--color-light)); border: 1px solid rgb(var(--color-border-color)); border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: all 0.2s; display: flex; align-items: center; justify-content: center; font-size: 16px; }
                .map-btn:hover { background-color: rgb(var(--color-secondary)); color: white; transform: translateY(-1px); }
                .leaflet-routing-container { display: none; } /* Hide default routing panel */
                .leaflet-popup-content-wrapper { border-radius: 8px; padding: 0; overflow: hidden; }
                .leaflet-popup-content { margin: 0 !important; width: auto !important; }
                .leaflet-container a.leaflet-popup-close-button { color: #9ca3af; padding: 8px; font-size: 18px; }
            `}</style>
        </div>
    );
};

export default EcoMaps;
