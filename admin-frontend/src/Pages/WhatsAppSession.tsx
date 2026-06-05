import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  QrCode, 
  RefreshCw, 
  LogOut, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  Network, 
  Sparkles, 
  ChevronLeft,
  Smartphone,
  Info
} from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function WhatsAppSession() {
  const [status, setStatus] = useState<string>('DISCONNECTED');
  const [qrBase64, setQrBase64] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [pollingActive, setPollingActive] = useState<boolean>(false);
  const [webhookLoading, setWebhookLoading] = useState<boolean>(false);
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [qrExpired, setQrExpired] = useState<boolean>(false);
  const [qrExpireTime, setQrExpireTime] = useState<number | null>(null);
  
  const navigate = useNavigate();
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check current session status
  const checkSessionStatus = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await api.get('/openwa-session/status');
      const data = response.data;
      
      const normalizedStatus = String(data.status || 'DISCONNECTED').toUpperCase();
      setStatus(normalizedStatus);
      setSessionDetails(data);

      if (data.authenticated) {
        setStatus('CONNECTED');
        setQrBase64('');
        setQrExpired(false);
        setQrExpireTime(null);
        if (pollingActive) {
          toast.success('WhatsApp connected successfully!');
          setPollingActive(false);
        }
      } else if (normalizedStatus === 'ERROR' || normalizedStatus === 'DISCONNECTED') {
        setStatus('DISCONNECTED');
        setQrBase64('');
        setQrExpired(false);
        setQrExpireTime(null);
      } else if (normalizedStatus === 'QR_READY' || normalizedStatus === 'SCAN_QR') {
        if (qrBase64) {
          setStatus('SCAN_QR');
        } else {
          setStatus('INITIALIZING');
          fetchQRCode(true);
        }
      } else if (normalizedStatus === 'STARTED' || normalizedStatus === 'INITIALIZING') {
        setStatus('INITIALIZING');
      }
    } catch (error: any) {
      console.error('Failed to get status:', error);
      if (!silent) {
        toast.error('Could not fetch connection status');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Start the session
  const startSession = async () => {
    setLoading(true);
    try {
      toast.loading('Initializing WhatsApp gateway...', { id: 'init-session' });
      await api.post('/openwa-session/start');
      toast.success('Session gateway initialized!', { id: 'init-session' });
      
      // Immediately check status and start polling for QR
      setStatus('INITIALIZING');
      setPollingActive(true);
      await fetchQRCode();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to initialize session', { id: 'init-session' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch the QR code
  const fetchQRCode = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await api.get('/openwa-session/qr');
      const qrData = response.data?.qr || response.data?.qrCode;
      if (qrData) {
        setQrBase64(qrData);
        setStatus('SCAN_QR');
        setQrExpired(false);
        const expiresIn = response.data?.expiresIn || 30000;
        setQrExpireTime(Date.now() + expiresIn);
      }
    } catch (error: any) {
      console.error('Failed to get QR code:', error);
      if (!silent) {
        toast.error('QR code not available yet. Please wait.');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Disconnect/Logout session
  const logoutSession = async () => {
    if (!window.confirm('Are you sure you want to disconnect your WhatsApp? This will pause all automated invitations.')) return;
    
    setLoading(true);
    try {
      toast.loading('Disconnecting WhatsApp...', { id: 'logout-session' });
      await api.post('/openwa-session/logout');
      toast.success('WhatsApp session disconnected successfully', { id: 'logout-session' });
      setStatus('DISCONNECTED');
      setQrBase64('');
      setQrExpired(false);
      setQrExpireTime(null);
      setSessionDetails(null);
      setPollingActive(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to disconnect session', { id: 'logout-session' });
    } finally {
      setLoading(false);
    }
  };

  // Register Webhook URL on OpenWA server
  const registerWebhook = async () => {
    setWebhookLoading(true);
    try {
      toast.loading('Registering webhook listeners...', { id: 'webhook-reg' });
      await api.post('/openwa-session/webhook/register');
      toast.success('WhatsApp Event Webhook successfully bound!', { id: 'webhook-reg' });
      checkSessionStatus(true);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Webhook registration failed', { id: 'webhook-reg' });
    } finally {
      setWebhookLoading(false);
    }
  };

  // Expiry Timer for QR Code
  useEffect(() => {
    if (!qrExpireTime || status !== 'SCAN_QR') return;

    const interval = setInterval(() => {
      if (Date.now() >= qrExpireTime) {
        setQrExpired(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [qrExpireTime, status]);

  // Polling loop
  useEffect(() => {
    // If the QR has expired, pause status checking polls to save bandwidth
    if (qrExpired) return;

    if (pollingActive || status === 'SCAN_QR' || status === 'INITIALIZING') {
      pollTimerRef.current = setInterval(() => {
        checkSessionStatus(true);
        if (status === 'SCAN_QR' && !qrBase64) {
          fetchQRCode(true);
        }
      }, 4000);
    } else {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    }

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [pollingActive, status, qrBase64]);

  // Initial check
  useEffect(() => {
    checkSessionStatus();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 bg-slate-50 min-h-screen">
      {/* Dynamic Laser Animation CSS injection */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scanLaser {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .laser-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(to right, transparent, #10b981, transparent);
          box-shadow: 0 0 10px #10b981, 0 0 20px #10b981;
          animation: scanLaser 3s ease-in-out infinite;
        }
      `}} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              WhatsApp Integration
              <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
            </h1>
            <p className="text-sm text-slate-500">Connect your WhatsApp device to automate outgoing invitations and manage RSVPs.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => checkSessionStatus(false)} 
            disabled={loading}
            className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connection Status Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center justify-between">
                Connection Status
                {status === 'CONNECTED' ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 font-medium px-2.5 py-1 flex items-center gap-1.5 rounded-full shadow-sm animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    CONNECTED
                  </Badge>
                ) : status === 'SCAN_QR' || status === 'INITIALIZING' ? (
                  <Badge className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50 font-medium px-2.5 py-1 flex items-center gap-1.5 rounded-full shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                    AUTHENTICATING
                  </Badge>
                ) : (
                  <Badge className="bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-100 font-medium px-2.5 py-1 flex items-center gap-1.5 rounded-full">
                    <span className="h-2 w-2 rounded-full bg-slate-400" />
                    DISCONNECTED
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Multi-tenant WhatsApp web session bridge details</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {status === 'CONNECTED' ? (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                  <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center ring-8 ring-emerald-50/50">
                    <CheckCircle className="h-10 w-10 text-emerald-600 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-800">Your Phone is Connected!</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                      Invitely is actively listening. All scheduled invitation campaigns and incoming RSVP handlers are fully functional.
                    </p>
                  </div>

                  <div className="w-full max-w-md bg-slate-50 rounded-xl p-4 border border-slate-100 text-left space-y-2 mt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Session ID:</span>
                      <span className="font-mono font-semibold text-slate-800">{sessionDetails?.sessionId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Gateway Status:</span>
                      <span className="font-semibold text-emerald-600 flex items-center gap-1">
                        Active & Synced
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Outgoing Provider:</span>
                      <span className="font-semibold text-blue-600">OpenWA Gateway</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md pt-4">
                    <Button 
                      variant="outline" 
                      onClick={registerWebhook}
                      disabled={webhookLoading}
                      className="flex-1 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm"
                    >
                      <Network className="h-4 w-4 mr-2 text-slate-500" />
                      {webhookLoading ? 'Syncing Webhooks...' : 'Sync Webhooks'}
                    </Button>

                    <Button 
                      variant="destructive" 
                      onClick={logoutSession}
                      disabled={loading}
                      className="flex-1 shadow-sm shadow-red-500/10"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Disconnect Device
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 py-2">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                    <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-blue-900">Why connect your WhatsApp?</h4>
                      <p className="text-xs text-blue-700 leading-relaxed">
                        By integrating OpenWA, you bypass Twilio's per-message cost limits entirely. Outgoing messages run from your own device, templates require zero Facebook review, and incoming responses trigger AI processing automatically!
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Setup Instructions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">1</div>
                        <h4 className="text-xs font-bold text-slate-800">Launch Gateway</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Click "Initialize Gateway Session" below to request a new validation bridge.</p>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">2</div>
                        <h4 className="text-xs font-bold text-slate-800">Scan QR Code</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Open WhatsApp {">"} Linked Devices {">"} Link a Device. Scan the generated QR matrix.</p>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">3</div>
                        <h4 className="text-xs font-bold text-slate-800">Sync Webhooks</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Register listeners so incoming guest responses update RSVPs dynamically.</p>
                      </div>
                    </div>
                  </div>

                  {status === 'DISCONNECTED' && (
                    <div className="pt-4 flex justify-center">
                      <Button 
                        onClick={startSession} 
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transform hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <Smartphone className="h-5 w-5 mr-2 animate-pulse" />
                        Initialize Gateway Session
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Network className="h-4 w-4 text-blue-600" />
                Webhook Sync Center
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <p className="text-xs text-slate-500">
                Incoming messages are captured by your OpenWA instance. Syncing the Webhook ensures the server sends message delivery statuses, RSVPs, and media attachment updates right back to your Invitely database.
              </p>
              <div className="flex items-center justify-between p-3 border border-slate-100 bg-slate-50/50 rounded-xl text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-slate-700">Webhook Receiver URL</span>
                  <p className="font-mono text-slate-400 select-all">/api/openwa/webhook</p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={registerWebhook}
                  disabled={webhookLoading || status !== 'CONNECTED'}
                  className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Force Sync Webhook
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QR Code Scan Frame */}
        <div className="lg:col-span-1">
          <Card className="border-none shadow-sm h-full bg-white flex flex-col">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <QrCode className="h-5 w-5 text-blue-600" />
                Scan Screen
              </CardTitle>
              <CardDescription>Device linking frame</CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col items-center justify-center pt-8 pb-8 space-y-6">
              {status === 'SCAN_QR' && qrBase64 ? (
                <div className="space-y-6 w-full flex flex-col items-center">
                  <div className="relative p-4 border border-slate-100 rounded-2xl bg-white shadow-md max-w-[240px] w-full aspect-square flex items-center justify-center overflow-hidden">
                    {qrExpired && (
                      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4 space-y-3 z-10">
                        <AlertCircle className="h-10 w-10 text-red-500 animate-bounce" />
                        <h4 className="text-white text-xs font-bold">QR Code Expired</h4>
                        <p className="text-[10px] text-slate-300 max-w-[160px] leading-relaxed">
                          For security, this QR code has expired. Please regenerate a new one.
                        </p>
                        <Button 
                          size="sm" 
                          onClick={() => fetchQRCode(false)} 
                          className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-3 py-1.5 h-auto rounded-lg shadow-md"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Regenerate
                        </Button>
                      </div>
                    )}
                    <img 
                      src={qrBase64.startsWith('data:') ? qrBase64 : `data:image/png;base64,${qrBase64}`} 
                      alt="WhatsApp QR Code" 
                      className={`w-full h-full object-contain rounded-lg transition-opacity duration-300 ${qrExpired ? 'opacity-30' : 'opacity-100'}`}
                    />
                    {/* Glowing Green Scanning Laser */}
                    {!qrExpired && <div className="laser-line" />}
                  </div>
                  
                  <div className="text-center space-y-2">
                    {qrExpired ? (
                      <Badge className="bg-red-100 text-red-800 border-none font-semibold uppercase">
                        Expired
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800 border-none font-semibold uppercase animate-pulse">
                        QR Ready for Scan
                      </Badge>
                    )}
                    <p className="text-[11px] text-slate-500 max-w-[200px] leading-relaxed mx-auto">
                      {qrExpired 
                        ? "Scan limit reached. Please click Regenerate QR to request a fresh matrix." 
                        : "Scan within 30 seconds. Polling is active and this panel will update instantly upon sync."}
                    </p>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fetchQRCode(false)} 
                    disabled={loading}
                    className="w-full max-w-[200px] bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate QR
                  </Button>
                </div>
              ) : status === 'INITIALIZING' ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <div className="text-center space-y-1">
                    <h4 className="text-sm font-semibold text-slate-800">Initializing Session...</h4>
                    <p className="text-[10px] text-slate-400 max-w-[180px] leading-relaxed">
                      Warming up Chromium instance. QR code will appear here in a few moments.
                    </p>
                  </div>
                </div>
              ) : status === 'CONNECTED' ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                  <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/10 animate-pulse">
                    <QrCode className="h-10 w-10 text-emerald-600" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">Connection Locked</h4>
                    <p className="text-xs text-slate-500 max-w-[185px]">
                      Your authenticated device is actively bound. No scan needed.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                  <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                    <AlertCircle className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-slate-700">No Active Session</h4>
                    <p className="text-xs text-slate-400 max-w-[180px] leading-relaxed">
                      Initialize the session connection to show validation credentials.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="border-t border-slate-100 bg-slate-50/50 p-4 justify-center">
              <a 
                href="https://github.com/rmyndharis/OpenWA" 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                Troubleshoot Connection
              </a>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
