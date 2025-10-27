import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Logiker Menza - Online étel rendelés';
export const size = {
  width: 1200,
  height: 630
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'sans-serif'
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 20 }}>🍽️</div>
        <div style={{ fontWeight: 'bold' }}>Logiker Menza</div>
        <div style={{ fontSize: 48, marginTop: 20 }}>Online rendelés</div>
      </div>
    ),
    {
      ...size
    }
  );
}
