'use client';

interface QRCodeProps {
  value: string;
  size?: number;
  level?: string;
  includeMargin?: boolean;
}

const QRCode = ({
  value,
  size = 200,
  level = 'H',
  includeMargin = false,
}: QRCodeProps) => {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(value)}&size=${size}x${size}`;

  return (
    <div className="qrcode">
      <img
        src={qrCodeUrl}
        alt="QR Code"
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          padding: includeMargin ? '8px' : '0',
          backgroundColor: 'white'
        }}
      />
    </div>
  );
};

export default QRCode;
