import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  SkipBack, 
  SkipForward,
  Loader2,
  Clock,
  FileAudio,
  AlertCircle
} from "lucide-react";
import { CallRecording, RecordingPlayer as RecordingPlayerState } from "@/types/telephony";
import { pabxService } from "@/services/pabxService";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecordingPlayerProps {
  callId: string;
  tenantId: string;
  leadName?: string;
  callDate: Date;
  trigger?: React.ReactNode;
}

const RecordingPlayer: React.FC<RecordingPlayerProps> = ({
  callId,
  tenantId,
  leadName,
  callDate,
  trigger
}) => {
  const [recording, setRecording] = useState<CallRecording | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  const [playerState, setPlayerState] = useState<RecordingPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isLoading: false,
    error: undefined
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && !recording) {
      loadRecording();
    }
  }, [isOpen]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setPlayerState(prev => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: audio.duration || 0
      }));
    };

    const handleLoadStart = () => {
      setPlayerState(prev => ({ ...prev, isLoading: true }));
    };

    const handleCanPlay = () => {
      setPlayerState(prev => ({ 
        ...prev, 
        isLoading: false,
        duration: audio.duration || 0
      }));
    };

    const handleError = () => {
      setPlayerState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Erro ao carregar áudio'
      }));
    };

    const handleEnded = () => {
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [recording]);

  const loadRecording = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const recordingData = await pabxService.getCallRecording(tenantId, callId);
      
      if (recordingData && recordingData.isAvailable) {
        setRecording(recordingData);
      } else {
        setError('Gravação não disponível ou expirada');
      }
    } catch (err) {
      setError('Erro ao carregar gravação');
      console.error('Erro ao carregar gravação:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playerState.isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => {
        console.error('Erro ao reproduzir áudio:', err);
        toast({
          title: "Erro de Reprodução",
          description: "Não foi possível reproduzir a gravação",
          variant: "destructive",
        });
      });
    }
    
    setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = value[0];
    audio.currentTime = newTime;
    setPlayerState(prev => ({ ...prev, currentTime: newTime }));
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = value[0];
    audio.volume = newVolume;
    setPlayerState(prev => ({ ...prev, volume: newVolume }));
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playerState.volume > 0) {
      audio.volume = 0;
      setPlayerState(prev => ({ ...prev, volume: 0 }));
    } else {
      audio.volume = 1;
      setPlayerState(prev => ({ ...prev, volume: 1 }));
    }
  };

  const skipTime = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
    audio.currentTime = newTime;
    setPlayerState(prev => ({ ...prev, currentTime: newTime }));
  };

  const downloadRecording = async () => {
    if (!recording) return;

    try {
      const blob = await pabxService.downloadRecording(tenantId, recording.id);
      
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gravacao_${callId}_${format(callDate, 'yyyy-MM-dd_HH-mm')}.${recording.format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Download Iniciado",
          description: "A gravação está sendo baixada",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no Download",
        description: "Não foi possível baixar a gravação",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '00:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const defaultTrigger = (
    <Button variant="ghost" size="sm">
      <Play className="w-3 h-3 mr-1" />
      🔗 Play
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileAudio className="w-5 h-5" />
            Gravação da Chamada
          </DialogTitle>
          <DialogDescription>
            {leadName && `Lead: ${leadName} • `}
            {format(callDate, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Carregando gravação...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
                <p className="text-red-600 font-medium">Gravação Indisponível</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          )}

          {recording && !isLoading && !error && (
            <>
              {/* Informações da Gravação */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Duração</p>
                      <p className="font-medium">{formatTime(recording.duration)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tamanho</p>
                      <p className="font-medium">{formatFileSize(recording.fileSize)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Formato</p>
                      <Badge variant="outline">{recording.format.toUpperCase()}</Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <Badge variant={recording.isAvailable ? "default" : "destructive"}>
                        {recording.isAvailable ? "Disponível" : "Indisponível"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Player de Áudio */}
              <Card>
                <CardContent className="p-6">
                  <audio
                    ref={audioRef}
                    src={recording.recordingUrl}
                    preload="metadata"
                  />

                  {/* Controles Principais */}
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => skipTime(-10)}
                      disabled={playerState.isLoading}
                    >
                      <SkipBack className="w-4 h-4" />
                      10s
                    </Button>

                    <Button
                      size="lg"
                      onClick={togglePlayPause}
                      disabled={playerState.isLoading}
                      className="w-16 h-16 rounded-full"
                    >
                      {playerState.isLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : playerState.isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => skipTime(10)}
                      disabled={playerState.isLoading}
                    >
                      10s
                      <SkipForward className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="space-y-2">
                    <Slider
                      value={[playerState.currentTime]}
                      max={playerState.duration || 100}
                      step={1}
                      onValueChange={handleSeek}
                      disabled={playerState.isLoading}
                      className="w-full"
                    />
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatTime(playerState.currentTime)}</span>
                      <span>{formatTime(playerState.duration)}</span>
                    </div>
                  </div>

                  {/* Controles de Volume */}
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                    >
                      {playerState.volume === 0 ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <Slider
                      value={[playerState.volume]}
                      max={1}
                      step={0.1}
                      onValueChange={handleVolumeChange}
                      className="w-24"
                    />
                    
                    <div className="ml-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadRecording}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {playerState.error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{playerState.error}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Informações Adicionais */}
              {recording.expiresAt && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      <strong>Atenção:</strong> Esta gravação expira em{' '}
                      {format(recording.expiresAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecordingPlayer;

