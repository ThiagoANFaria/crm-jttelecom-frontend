import React from 'react';
import { Loader2, Building2 } from 'lucide-react';

const TenantLoading: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Building2 className="w-8 h-8 text-jt-blue" />
          <Loader2 className="w-6 h-6 text-jt-blue animate-spin" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">
            Carregando ambiente
          </h2>
          <p className="text-gray-600">
            Configurando seu espaço de trabalho...
          </p>
        </div>
        
        {/* Logo JT Vox */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <div className="bg-jt-blue text-white px-3 py-2 rounded-lg font-montserrat font-black text-lg shadow-sm">
            JT
          </div>
          <div className="flex gap-1 items-center">
            {[10, 16, 14, 18, 12].map((height, index) => (
              <div
                key={index}
                className="w-1 bg-jt-green rounded-full animate-pulse"
                style={{
                  height: `${height}px`,
                  animationDelay: `${index * 0.2}s`,
                  animationDuration: '1.5s'
                }}
              ></div>
            ))}
          </div>
          <span className="text-jt-blue font-montserrat font-bold text-2xl tracking-wide">
            VOX
          </span>
        </div>
      </div>
    </div>
  );
};

export default TenantLoading;

