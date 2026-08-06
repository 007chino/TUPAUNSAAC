/**
 * Caso de uso: Cambiar estado del expediente con trazabilidad (panel administrativo)
 * Tipo: prueba UNITARIA — solicitudRepository está mockeado; se ejercita
 * solo la lógica de transición de estados de solicitudService.cambiarEstado.
 */
jest.mock('../../backend/src/repositories/solicitudRepository');

const solicitudRepository = require('../../backend/src/repositories/solicitudRepository');
const solicitudService = require('../../backend/src/services/solicitudService');

describe('solicitudService.cambiarEstado (unitaria)', () => {
  beforeEach(() => {
    solicitudRepository.obtenerInternalIdPorCodigo.mockResolvedValue({ internalId: 42, cestado: 'SOLICITADO' });
    solicitudRepository.cambiarEstadoDirecto.mockResolvedValue();
    solicitudRepository.registrarPagoOficial.mockResolvedValue({ cestado: 'CORRECTO' });
    solicitudRepository.insertarHistorial.mockResolvedValue();
    solicitudRepository.obtenerPorInternalId.mockResolvedValue({ id: 'TR-2026-0042', status: 'EN PROCESO' });
  });

  afterEach(() => jest.clearAllMocks());

  test('rechaza un estado que no está en la lista permitida', async () => {
    await expect(
      solicitudService.cambiarEstado('TR-2026-0042', 'ESTADO-INVENTADO', '', 'ADMIN')
    ).rejects.toMatchObject({ status: 400 });
    expect(solicitudRepository.cambiarEstadoDirecto).not.toHaveBeenCalled();
  });

  test('rechaza cuando el expediente no existe', async () => {
    solicitudRepository.obtenerInternalIdPorCodigo.mockResolvedValue(null);
    await expect(
      solicitudService.cambiarEstado('TR-NO-EXISTE', 'EN PROCESO', '', 'ADMIN')
    ).rejects.toMatchObject({ status: 404 });
  });

  test('para estado EN PROCESO actualiza directamente y registra el historial', async () => {
    await solicitudService.cambiarEstado('TR-2026-0042', 'EN PROCESO', '', 'ADMIN');

    expect(solicitudRepository.cambiarEstadoDirecto).toHaveBeenCalledWith(42, 'EN PROCESO');
    expect(solicitudRepository.registrarPagoOficial).not.toHaveBeenCalled();
    expect(solicitudRepository.insertarHistorial).toHaveBeenCalledWith(
      42,
      'EN PROCESO',
      expect.stringContaining('Expediente digital evaluado'),
      'ADMIN'
    );
  });

  test('para estado PAGADO usa el stored procedure oficial de pago en vez de un UPDATE directo', async () => {
    await solicitudService.cambiarEstado('TR-2026-0042', 'PAGADO', '', 'ADMIN');

    expect(solicitudRepository.registrarPagoOficial).toHaveBeenCalledWith('TR-2026-0042');
    expect(solicitudRepository.cambiarEstadoDirecto).not.toHaveBeenCalled();
    expect(solicitudRepository.insertarHistorial).toHaveBeenCalledWith(
      42, 'PAGADO', expect.stringContaining('Pago validado'), 'ADMIN'
    );
  });

  test('propaga el error cuando el stored procedure de pago rechaza la operación', async () => {
    solicitudRepository.registrarPagoOficial.mockResolvedValue({ cestado: 'ERROR', cmensaje: 'Voucher ya usado' });
    await expect(
      solicitudService.cambiarEstado('TR-2026-0042', 'PAGADO', '', 'ADMIN')
    ).rejects.toMatchObject({ status: 409, message: 'Voucher ya usado' });
    expect(solicitudRepository.insertarHistorial).not.toHaveBeenCalled();
  });

  test('usa la observación manual del administrador si se envía, en vez de la descripción por defecto', async () => {
    await solicitudService.cambiarEstado('TR-2026-0042', 'ANULADO', 'Voucher ilegible, se solicitó reenvío', 'ADMIN');

    expect(solicitudRepository.insertarHistorial).toHaveBeenCalledWith(
      42, 'ANULADO', 'Voucher ilegible, se solicitó reenvío', 'ADMIN'
    );
  });
});
