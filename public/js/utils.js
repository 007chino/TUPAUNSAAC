/**
 * Funciones puras del frontend (sin dependencias del DOM), extraídas del
 * script principal de public/index.html para poder probarlas por separado
 * con Jest. Se cargan como script clásico (sin bundler): el objeto queda
 * expuesto en `window.TupaUtils` para el navegador y también vía
 * `module.exports` para que Jest pueda hacer `require(...)` directamente.
 */
(function (root) {
  'use strict';

  /**
   * Caso de uso: Filtrar catálogo de trámites (búsqueda + oficina).
   * Usada por filterCatalog() en public/index.html.
   */
  function filterCatalogItems(catalog, query, office) {
    const normalizedQuery = String(query || '').toLowerCase();
    const normalizedOffice = office || '';

    return (catalog || []).filter((item) => {
      const matchesQuery =
        String(item.denominacion || '').toLowerCase().includes(normalizedQuery) ||
        String(item.descripcion || '').toLowerCase().includes(normalizedQuery) ||
        String(item.codigo || '').toLowerCase().includes(normalizedQuery);
      const matchesOffice = normalizedOffice === '' || item.office === normalizedOffice;
      return matchesQuery && matchesOffice;
    });
  }

  /**
   * Caso de uso: Registrar solicitud de trámite (validación previa al envío).
   * Usada por handleTramiteSubmission() en public/index.html.
   * Replica en el cliente la misma regla de DNI de 8 dígitos que aplica
   * el backend (solicitudService.crear), para dar feedback inmediato.
   */
  function validateSolicitudForm({ dni, nombres, apellidoPaterno, requisitesTotal, requisitesChecked }) {
    if (!dni || !/^\d{8}$/.test(String(dni))) {
      return { valid: false, error: 'El DNI debe tener 8 dígitos.' };
    }
    if (!nombres || !nombres.trim()) {
      return { valid: false, error: 'Los nombres son obligatorios.' };
    }
    if (!apellidoPaterno || !apellidoPaterno.trim()) {
      return { valid: false, error: 'El apellido paterno es obligatorio.' };
    }
    if (requisitesTotal > 0 && requisitesChecked < requisitesTotal) {
      return { valid: false, error: 'Debes confirmar todos los requisitos obligatorios antes de enviar.' };
    }
    return { valid: true, error: null };
  }

  /**
   * Caso de uso: Rastreo de expediente (etiqueta e ícono según estado).
   * Usada por searchTrackingData() en public/index.html.
   */
  const STATUS_META = {
    'SOLICITADO': { label: 'SOLICITADO', icon: 'fa-folder-open' },
    'EN PROCESO': { label: 'EN EVALUACIÓN', icon: 'fa-hourglass-half' },
    'PAGADO': { label: 'PAGO COMPROBADO', icon: 'fa-credit-card' },
    'PAGADO SIN ADJUNTO': { label: 'PAGO REGISTRADO', icon: 'fa-credit-card' },
    'CERRADO': { label: 'RESUELTO / FINALIZADO', icon: 'fa-circle-check' },
    'ANULADO': { label: 'RECHAZADO / OBSERVADO', icon: 'fa-circle-xmark' }
  };

  function getStatusMeta(status) {
    return STATUS_META[status] || { label: status, icon: 'fa-circle-question' };
  }

  const TupaUtils = { filterCatalogItems, validateSolicitudForm, getStatusMeta };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TupaUtils;
  }
  if (root) {
    root.TupaUtils = TupaUtils;
  }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
