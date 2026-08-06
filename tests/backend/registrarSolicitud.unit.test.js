/**
 * Caso de uso: Registrar solicitud de trámite (portal del estudiante)
 * Tipo: prueba UNITARIA — catalogoRepository y solicitudRepository están
 * mockeados; se ejercita solo la validación y orquestación de solicitudService.crear.
 */
jest.mock('../../backend/src/repositories/catalogoRepository');
jest.mock('../../backend/src/repositories/solicitudRepository');

const catalogoRepository = require('../../backend/src/repositories/catalogoRepository');
const solicitudRepository = require('../../backend/src/repositories/solicitudRepository');
const solicitudService = require('../../backend/src/services/solicitudService');

const PAYLOAD_VALIDO = {
  dni: '73456123',
  nombres: 'María',
  apellidoPaterno: 'Quispe',
  apellidoMaterno: 'Huamán',
  codigoAlumno: '190456',
  correo: 'maria@unsaac.edu.pe',
  telefono: '984123456',
  procedureCode: 'PE123299E43',
  voucher: '0001234567'
};

const TRAMITE_MOCK = { codigo: 'PE123299E43', denominacion: 'Acceso a la información pública' };
const MONTO_MOCK = { id: 10, monto: 25.5 };

describe('solicitudService.crear (unitaria)', () => {
  beforeEach(() => {
    catalogoRepository.obtenerPorCodigo.mockResolvedValue(TRAMITE_MOCK);
    catalogoRepository.montoActivo.mockResolvedValue(MONTO_MOCK);
    solicitudRepository.crearSolicitud.mockResolvedValue({ cestado: 'CORRECTO', ncodigo: 999 });
    solicitudRepository.actualizarContactoSolicitante.mockResolvedValue();
    solicitudRepository.adjuntarComprobante.mockResolvedValue();
    solicitudRepository.insertarHistorial.mockResolvedValue();
    solicitudRepository.obtenerPorInternalId.mockResolvedValue({ id: 'TR-2026-0999', status: 'SOLICITADO' });
  });

  afterEach(() => jest.clearAllMocks());

  test('rechaza un DNI que no tiene 8 dígitos', async () => {
    await expect(
      solicitudService.crear({ ...PAYLOAD_VALIDO, dni: '123' }, [])
    ).rejects.toMatchObject({ status: 400 });
    expect(solicitudRepository.crearSolicitud).not.toHaveBeenCalled();
  });

  test('rechaza si no se indica un trámite del catálogo', async () => {
    await expect(
      solicitudService.crear({ ...PAYLOAD_VALIDO, procedureCode: '' }, [])
    ).rejects.toMatchObject({ status: 400 });
  });

  test('rechaza cuando el trámite no existe en el catálogo', async () => {
    catalogoRepository.obtenerPorCodigo.mockResolvedValue(null);
    await expect(solicitudService.crear(PAYLOAD_VALIDO, [])).rejects.toMatchObject({ status: 404 });
  });

  test('rechaza cuando el trámite no tiene monto vigente configurado', async () => {
    catalogoRepository.montoActivo.mockResolvedValue(null);
    await expect(solicitudService.crear(PAYLOAD_VALIDO, [])).rejects.toMatchObject({ status: 409 });
  });

  test('registra la solicitud, adjunta archivos y guarda el historial inicial', async () => {
    const archivos = [{ originalname: 'dni.pdf', path: '/tmp/uploads/abc123-dni.pdf' }];

    const resultado = await solicitudService.crear(PAYLOAD_VALIDO, archivos);

    expect(solicitudRepository.crearSolicitud).toHaveBeenCalledWith(
      expect.objectContaining({ dni: '73456123', ccodigo: 'PE123299E43', monto: 25.5 })
    );
    expect(solicitudRepository.actualizarContactoSolicitante).toHaveBeenCalledWith(
      '73456123',
      expect.objectContaining({ correo: 'maria@unsaac.edu.pe' })
    );
    expect(solicitudRepository.adjuntarComprobante).toHaveBeenCalledWith(
      999,
      expect.objectContaining({ voucher: '0001234567' })
    );
    expect(solicitudRepository.insertarHistorial).toHaveBeenCalledWith(
      999,
      'SOLICITADO',
      expect.stringContaining('1 documento(s) adjunto(s)')
    );
    expect(resultado).toEqual({ id: 'TR-2026-0999', status: 'SOLICITADO' });
  });

  test('propaga el error de negocio cuando el stored procedure rechaza la solicitud', async () => {
    solicitudRepository.crearSolicitud.mockResolvedValue({ cestado: 'ERROR', cmensaje: 'Alumno inhabilitado' });
    await expect(solicitudService.crear(PAYLOAD_VALIDO, [])).rejects.toMatchObject({
      status: 500,
      message: 'Alumno inhabilitado'
    });
  });
});
