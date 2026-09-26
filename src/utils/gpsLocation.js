import { PROVINCES_LIST } from '../categories'

// Helper para detectar la ubicación GPS exacta del cliente en República Dominicana

export const detectGpsLocation = () => {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('La geolocalización no está soportada en este dispositivo.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        let detectedProvinceId = 'santo domingo';
        let detectedLabel = 'Santo Domingo / D.N.';

        try {
          // Intentar geocodificación inversa mediante Nominatim API (con timeout corto de 3.5s)
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            const address = data.address || {};
            const rawLocationStr = String(
              address.state || address.province || address.city || address.county || address.town || ''
            ).toLowerCase();

            // Buscar coincidencia en PROVINCES_LIST
            const match = PROVINCES_LIST.find(p => {
              if (p.id === 'all') return false;
              const pid = p.id.toLowerCase();
              const plabel = p.labelEs.toLowerCase();
              return rawLocationStr.includes(pid) || plabel.includes(rawLocationStr);
            });

            if (match) {
              detectedProvinceId = match.id;
              detectedLabel = match.labelEs.replace('📍 ', '');
            }
          }
        } catch (e) {
          console.log('Notice: Fallback a coordenadas locales:', e);
        }

        // Si la geocodificación falló o tardó, resolver por coordenadas aproximadas en RD
        if (detectedProvinceId === 'santo domingo') {
          if (lat >= 19.30 && lat <= 19.65 && lng >= -70.85 && lng <= -70.45) {
            detectedProvinceId = 'santiago';
            detectedLabel = 'Santiago';
          } else if (lat >= 18.90 && lat <= 19.28 && lng >= -70.78 && lng <= -70.35) {
            detectedProvinceId = 'la vega';
            detectedLabel = 'La Vega / Jarabacoa';
          } else if (lat >= 18.30 && lat <= 18.58 && lng >= -70.35 && lng <= -70.00) {
            detectedProvinceId = 'san cristóbal';
            detectedLabel = 'San Cristóbal';
          } else if (lat >= 18.40 && lat <= 18.85 && lng >= -68.70 && lng <= -68.20) {
            detectedProvinceId = 'bávaro';
            detectedLabel = 'Bávaro / Punta Cana';
          } else if (lat >= 19.65 && lat <= 19.95 && lng >= -70.90 && lng <= -70.40) {
            detectedProvinceId = 'puerto plata';
            detectedLabel = 'Puerto Plata';
          } else if (lat >= 18.35 && lat <= 18.65 && lng >= -69.50 && lng <= -69.10) {
            detectedProvinceId = 'san pedro';
            detectedLabel = 'San Pedro de Macorís';
          } else if (lat >= 18.30 && lat <= 18.60 && lng >= -69.10 && lng <= -68.75) {
            detectedProvinceId = 'la romana';
            detectedLabel = 'La Romana';
          }
        }

        resolve({
          provinceId: detectedProvinceId,
          provinceLabel: detectedLabel,
          lat,
          lng
        });
      },
      (error) => {
        let msg = 'No se pudo obtener la ubicación GPS.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Permiso de ubicación denegado. Activa el GPS en tu navegador o teléfono.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'La solicitud de ubicación expiró.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000
      }
    );
  });
};
