const dashboardService = require('../services/dashboardService');

async function estadisticas(req, res, next) {
  try {
    const data = await dashboardService.estadisticas();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function exportarCsv(req, res, next) {
  try {
    const csv = await dashboardService.exportarCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="Reporte_TUPA_UNSAAC.csv"');
    res.send(`﻿${csv}`);
  } catch (error) {
    next(error);
  }
}

module.exports = { estadisticas, exportarCsv };
