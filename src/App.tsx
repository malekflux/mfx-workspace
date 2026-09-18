import { useState } from 'react';
import { LayoutDashboard, Briefcase, Settings, Menu, X, BarChart3 } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Workspace } from './components/Workspace';
import { ThemeToggle } from './components/ThemeToggle';
import { AdvancedReports } from './components/AdvancedReports';
import { GoogleSheetsSync } from './components/GoogleSheetsSync';

type View = 'dashboard' | 'workspace' | 'reports' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'workspace', name: 'Workspace', icon: Briefcase },
    { id: 'reports', name: 'Reports', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'workspace':
        return <Workspace />;
      case 'reports':
        return <AdvancedReports />;
      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-ink mb-2">Settings</h2>
              <p className="text-muted">Manage your workspace settings</p>
            </div>
            <GoogleSheetsSync />
            <div className="bg-surface rounded-lg shadow-sm border border-line p-6">
              <h3 className="text-lg font-bold text-ink mb-4">About</h3>
              <div className="space-y-2 text-sm text-muted">
                <p><strong className="text-ink">Version:</strong> 1.0.0</p>
                <p><strong className="text-ink">Company:</strong> MFx Digital Solutions</p>
                <p><strong className="text-ink">Website:</strong> <a href="https://www.mfx360.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.mfx360.com</a></p>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-canvas transition-colors">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-surface border-r border-line transition-all duration-300 z-40 ${
          isSidebarOpen ? 'w-64' : 'hidden lg:block lg:w-20'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-line">
            {isSidebarOpen && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
                  <img src="/mfx-logo.png" alt="MFx" className="w-7 object-contain" />
                </div>
                <span className="font-bold text-ink">Workspace</span>
              </div>
            )}
            <button
              aria-label="Toggle navigation"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-canvas rounded-lg transition-colors lg:hidden"
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5 text-muted" />
              ) : (
                <Menu className="w-5 h-5 text-muted" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  aria-label={item.name}
                  onClick={() => { setCurrentView(item.id as View); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'text-muted hover:bg-canvas'
                  } ${!isSidebarOpen && 'lg:justify-center'}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isSidebarOpen && (
                    <span className="font-semibold text-sm">{item.name}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Theme Toggle */}
          <div className="p-4 border-t border-line">
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        {/* Top Bar */}
        <header className="h-16 bg-surface border-b border-line px-6 flex items-center justify-between">
          <button
            aria-label="Toggle navigation"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-canvas rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-muted" />
          </button>

          <div className="flex items-center gap-4">
            <img src="/mfx-logo.png" alt="MFx" className="brand-logo" />
            <div className="text-right">
              <p className="text-sm font-semibold text-ink">MFx Digital Solutions</p>
              <p className="text-xs text-muted">www.mfx360.com</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div key={currentView} className="page-enter p-4 md:p-8 max-w-[1600px] mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

export default App;