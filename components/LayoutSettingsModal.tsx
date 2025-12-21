



import React from 'react';
import { useAppStore, THEMES } from '../hooks/useAppStore';
import { useLanguage } from '../hooks/useLanguage';

interface LayoutSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LayoutSettingsModal: React.FC<LayoutSettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    isLayoutMode, setIsLayoutMode, 
    isSidebarPinned, setIsSidebarPinned,
    headerBehavior, setHeaderBehavior,
    theme, setTheme,
    fontSize, setFontSize,
    fontFamily, setFontFamily,
    activeTab, resetLayout
  } = useAppStore();
  const { t } = useLanguage();

  const canResetLayout = activeTab === 'dashboard' || activeTab === 'transactions';

  if (!isOpen) return null;

  const fontSizes = [
      { label: 'Pequeno', value: '87.5%' },
      { label: 'Normal', value: '100%' },
      { label: 'Grande', value: '112.5%' },
      { label: 'Extra', value: '125%' },
  ];

  const fontFamilies = [
      { label: 'Padrão', value: 'Segoe UI, sans-serif' },
      { label: 'Serifa', value: 'Georgia, serif' },
      { label: 'Mono', value: 'Courier New, monospace' },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[2000]" onClick={onClose}>
      <div className="bg-bg-card p-6 rounded-lg shadow-xl w-full max-w-md text-light max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold">{t('layoutAndTheme')}</h2>
          <button onClick={onClose} className="text-gray-text hover:text-light text-2xl">&times;</button>
        </div>
        
        <div className="space-y-6 overflow-y-auto pr-2">
          {/* Sidebar Pin Section */}
          <div>
            <h3 className="font-semibold mb-2">{t('sidebarBehavior')}</h3>
            <label htmlFor="sidebar-pin-toggle" className="flex items-center justify-between bg-bg-main p-3 rounded-md cursor-pointer">
              <span>{t('pinSidebar')}</span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  id="sidebar-pin-toggle" 
                  className="sr-only" 
                  checked={isSidebarPinned}
                  onChange={() => setIsSidebarPinned(!isSidebarPinned)} 
                />
                <div className="block bg-border-color w-14 h-8 rounded-full"></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isSidebarPinned ? 'transform translate-x-6 bg-primary' : ''}`}></div>
              </div>
            </label>
            <p className="text-xs text-gray-text mt-2">{t('sidebarPinDesc')}</p>
          </div>

          {/* Header Behavior Section */}
          <div>
            <h3 className="font-semibold mb-2">{t('headerBehavior')}</h3>
            <div className="flex gap-2 bg-bg-main p-1 rounded-md">
              <button onClick={() => setHeaderBehavior('scroll')} className={`flex-1 p-2 rounded text-center text-sm font-semibold transition-colors ${headerBehavior === 'scroll' ? 'bg-secondary text-white shadow-md' : 'text-gray-text hover:bg-border-color'}`}>
                  {t('scrollHeader')}
              </button>
              <button onClick={() => setHeaderBehavior('sticky')} className={`flex-1 p-2 rounded text-center text-sm font-semibold transition-colors ${headerBehavior === 'sticky' ? 'bg-secondary text-white shadow-md' : 'text-gray-text hover:bg-border-color'}`}>
                  {t('stickyHeader')}
              </button>
            </div>
            <p className="text-xs text-gray-text mt-2">{t('headerBehaviorDesc')}</p>
          </div>
          
          {/* Typography Section */}
          <div>
              <h3 className="font-semibold mb-2">Tipografia</h3>
              <div className="space-y-3">
                  <div>
                      <label className="text-xs text-gray-text font-semibold block mb-1">Tamanho da Fonte</label>
                      <div className="grid grid-cols-4 gap-1 bg-bg-main p-1 rounded-md">
                          {fontSizes.map(f => (
                              <button 
                                  key={f.value} 
                                  onClick={() => setFontSize(f.value)}
                                  className={`p-2 rounded text-center text-xs font-semibold transition-colors ${fontSize === f.value ? 'bg-secondary text-white shadow-md' : 'text-gray-text hover:bg-border-color'}`}
                              >
                                  {f.label}
                              </button>
                          ))}
                      </div>
                  </div>
                  <div>
                      <label className="text-xs text-gray-text font-semibold block mb-1">Estilo da Fonte</label>
                      <div className="grid grid-cols-3 gap-1 bg-bg-main p-1 rounded-md">
                          {fontFamilies.map(f => (
                              <button 
                                  key={f.value} 
                                  onClick={() => setFontFamily(f.value)}
                                  className={`p-2 rounded text-center text-xs font-semibold transition-colors ${fontFamily === f.value ? 'bg-secondary text-white shadow-md' : 'text-gray-text hover:bg-border-color'}`}
                                  style={{ fontFamily: f.value }}
                              >
                                  {f.label}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
          
          {/* Layout Mode Section */}
          <div>
            <h3 className="font-semibold mb-2">Modo de Layout de Página</h3>
            <label htmlFor="layout-toggle" className="flex items-center justify-between bg-bg-main p-3 rounded-md cursor-pointer">
              <span>Ativar modo de edição</span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  id="layout-toggle" 
                  className="sr-only" 
                  checked={isLayoutMode}
                  onChange={() => setIsLayoutMode(!isLayoutMode)} 
                />
                <div className="block bg-border-color w-14 h-8 rounded-full"></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isLayoutMode ? 'transform translate-x-6 bg-primary' : ''}`}></div>
              </div>
            </label>
            <p className="text-xs text-gray-text mt-2">Quando ativado, você pode arrastar e soltar os painéis para reordenar a página.</p>
            <button
                onClick={() => canResetLayout && resetLayout(activeTab)}
                disabled={!canResetLayout}
                className="w-full mt-3 px-4 py-2 bg-border-color text-light font-semibold rounded-md hover:bg-opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title={canResetLayout ? "Restaura a ordem dos painéis para a página atual." : "Restauração de layout não disponível para esta página."}
            >
                <i className="fas fa-undo"></i> Restaurar Layout Padrão
            </button>
          </div>
          
          {/* Theme Section */}
          <div>
            <h3 className="font-semibold mb-2">Tema da Aplicação</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(THEMES).map(([themeKey, themeData]) => (
                <button
                  key={themeKey}
                  onClick={() => setTheme(themeKey)}
                  className={`p-3 rounded-lg border-2 transition-colors text-left ${theme === themeKey ? 'border-primary bg-bg-main' : 'border-transparent hover:bg-bg-main'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full border-2 border-bg-card" style={{ backgroundColor: `rgb(${themeData.colors['--color-primary-val']})` }}></div>
                      <div className="w-6 h-6 rounded-full border-2 border-bg-card" style={{ backgroundColor: `rgb(${themeData.colors['--color-secondary-val']})` }}></div>
                      <div className="w-6 h-6 rounded-full border-2 border-bg-card" style={{ backgroundColor: `rgb(${themeData.colors['--color-bg-main-val']})` }}></div>
                    </div>
                    <span className="font-semibold text-sm">{themeData.name}</span>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-text mt-2">Escolha um esquema de cores para a interface.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutSettingsModal;
