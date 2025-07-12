import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTenant } from "@/contexts/TenantContext";
import { pabxService } from "@/services/pabxService";
import { ClickToCallRequest } from "@/types/telephony";
import { Phone, Loader2 } from "lucide-react";

interface ClickToCallButtonProps {
  phoneNumber: string;
  leadId?: string;
  leadName?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
  onCallStarted?: (callId: string) => void;
  onCallError?: (error: string) => void;
  disabled?: boolean;
}

const ClickToCallButton: React.FC<ClickToCallButtonProps> = ({
  phoneNumber,
  leadId,
  leadName,
  variant = "ghost",
  size = "sm",
  className,
  children,
  onCallStarted,
  onCallError,
  disabled = false
}) => {
  const [isCalling, setIsCalling] = useState(false);
  const { toast } = useToast();
  const { currentTenant } = useTenant();

  const makeCall = async () => {
    if (!currentTenant) {
      toast({
        title: "Erro",
        description: "Tenant não identificado",
        variant: "destructive",
      });
      return;
    }

    if (!phoneNumber || !phoneNumber.trim()) {
      toast({
        title: "Número Inválido",
        description: "Número de telefone não informado",
        variant: "destructive",
      });
      return;
    }

    // Validar número de telefone
    if (!pabxService.validatePhoneNumber(phoneNumber)) {
      toast({
        title: "Número Inválido",
        description: "Por favor, verifique o número de telefone",
        variant: "destructive",
      });
      return;
    }

    setIsCalling(true);
    
    try {
      const request: ClickToCallRequest = {
        tenantId: currentTenant.id,
        phoneNumber: phoneNumber.replace(/\D/g, ''), // Remover formatação
        leadId: leadId,
        userId: 'current_user', // TODO: pegar do contexto de auth
        autoRecord: true
      };

      const response = await pabxService.makeCall(currentTenant.id, request);
      
      if (response.success) {
        const formattedNumber = pabxService.formatPhoneNumber(phoneNumber).formatted;
        const displayName = leadName || formattedNumber;
        
        toast({
          title: "Chamada Iniciada",
          description: `Ligando para ${displayName}`,
        });
        
        // Callback de sucesso
        if (onCallStarted && response.callId) {
          onCallStarted(response.callId);
        }
      } else {
        const errorMessage = response.message || "Erro ao realizar chamada";
        
        toast({
          title: "Erro na Chamada",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Callback de erro
        if (onCallError) {
          onCallError(errorMessage);
        }
      }
    } catch (error) {
      const errorMessage = "Erro ao conectar com o PABX";
      
      console.error('Erro ao realizar chamada:', error);
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Callback de erro
      if (onCallError) {
        onCallError(errorMessage);
      }
    } finally {
      setIsCalling(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    makeCall();
  };

  const isDisabled = disabled || isCalling || !phoneNumber;

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={isDisabled}
      title={`Ligar para ${pabxService.formatPhoneNumber(phoneNumber).formatted}`}
    >
      {isCalling ? (
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
      ) : (
        <Phone className="w-3 h-3 mr-1" />
      )}
      {children || (
        <>
          {isCalling ? 'Ligando...' : '☎️ Click-to-Call'}
        </>
      )}
    </Button>
  );
};

export default ClickToCallButton;

