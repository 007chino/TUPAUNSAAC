-- Migración propia de la aplicación (no forma parte del dump oficial de la UNSAAC).
-- Agrega la tabla de trazabilidad/auditoría que el esquema original no contempla,
-- necesaria para RF-07 (Rastreo y Trazabilidad) y CU-03/CU-04.

-- Extensión aditiva de tsolicitante: el dump oficial solo guarda DNI y nombres.
-- Se agregan columnas de contacto (correo, teléfono, código de alumno) requeridas
-- por RF-03 / HU-02, sin tocar ninguna columna oficial existente.
ALTER TABLE `tsolicitante`
  ADD COLUMN `ccodigoalumno` varchar(15) DEFAULT NULL AFTER `cnumerodocumento`,
  ADD COLUMN `ccorreo` varchar(100) DEFAULT NULL,
  ADD COLUMN `ctelefono` varchar(20) DEFAULT NULL;

CREATE TABLE IF NOT EXISTS `tsolicitudtramitehistorial` (
  `nidthistorial` int NOT NULL AUTO_INCREMENT,
  `nidtsolicitudtramite` bigint NOT NULL,
  `cestado` varchar(30) NOT NULL,
  `cdescripcion` varchar(500) DEFAULT NULL,
  `cidtusuario` varchar(10) DEFAULT NULL,
  `dfecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`nidthistorial`),
  KEY `nidtsolicitudtramite` (`nidtsolicitudtramite`),
  CONSTRAINT `tsolicitudtramitehistorial_ibfk_1`
    FOREIGN KEY (`nidtsolicitudtramite`) REFERENCES `tsolicitudtramite` (`nidtsolicitudtramite`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
