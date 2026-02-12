'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { WithdrawalPDF } from './withdrawal-pdf';

export function ReceiptModal({ isOpen, onClose, withdrawal }: any) {
  const [qrDataUri, setQrDataUri] = useState<string>('');
  const [logoDataUri, setLogoDataUri] = useState<string>('');

  useEffect(() => {
    if (isOpen && withdrawal) {
      // 1. Converter Logo SVG para DataURI
      const img = new Image();
      img.src = '/assets/images/dogao-do-pastor.svg';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        setLogoDataUri(canvas.toDataURL('image/png'));
      };

      // 2. Converter QR Code para DataURI após pequeno delay
      setTimeout(() => {
        const svg = document.getElementById('qr-svg-logic');
        if (svg) {
          const svgData = new XMLSerializer().serializeToString(svg);
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const imgQr = new Image();
          imgQr.onload = () => {
            canvas.width = imgQr.width;
            canvas.height = imgQr.height;
            ctx?.drawImage(imgQr, 0, 0);
            setQrDataUri(canvas.toDataURL('image/png'));
          };
          imgQr.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        }
      }, 600);
    }
  }, [isOpen, withdrawal]);

  if (!withdrawal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-center font-black uppercase tracking-tighter">
            Cupom de Retirada
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-4 space-y-4">
          <div className="p-4 bg-white border-2 border-slate-100 rounded-xl shadow-inner">
            <QRCodeSVG 
              id="qr-svg-logic"
              value={`DOGAO-${withdrawal.id}`} 
              size={180} 
              level="H" 
            />
          </div>
          
          <div className="text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Código da Doação</p>
            <p className="text-3xl font-black text-slate-800">#{withdrawal.id}</p>
          </div>
        </div>

        <div className="space-y-3">
          <PDFDownloadLink
            document={<WithdrawalPDF withdrawal={withdrawal} qrDataUri={qrDataUri} logoDataUri={logoDataUri} />}
            fileName={`CUPOM-${withdrawal.id}.pdf`}
          >
            {({ loading }) => (
              <Button className="w-full bg-orange-600 hover:bg-orange-700 h-14 font-black gap-2 text-lg" disabled={loading}>
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Download className="w-5 h-5" />}
                BAIXAR CUPOM PDF
              </Button>
            )}
          </PDFDownloadLink>

          <Button variant="ghost" onClick={onClose} className="w-full text-slate-400 font-bold uppercase text-[10px]">
            Voltar para Doações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}