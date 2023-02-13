import { Application } from './mxgraph.enums';
import { handleImportedCells } from './mxgraph.report';

const { GOVERNANCE, STUDIO } = Application;

export function mapCells({ mxCells, metadata, consumer }) {
  // TODO Tratar metadata
  const { app, diagramType, version } = metadata;

  const sourceApp = app._text;
  const targetApp = consumer;

  if (sourceApp === GOVERNANCE && targetApp === STUDIO) {
    const markersNotSupported = [
      'markerPoint',
      'marker-ad-hoc',
      'marker-compensation',
      'marker-sequential-mi',
      'marker-parallel-mi',
    ];

    const unsupportedCells = [
      'DATA_STORE',
      'WORKFLOW_INTERFACE',
      'INTERMEDIATE_EVENT',
    ];

    let hasUnsupported = false;
    let importedCellsReport = [['Tipo do elemento', 'Valor', 'Status']];

    let filteredCells = mxCells.filter(
      (cell) => !markersNotSupported.includes(cell._attributes?.style)
    );

    filteredCells = filteredCells.map((cell) => {
      const { type, value, style } = cell?._attributes || {};
      const normalizeValue = value || '';

      if (type === 'TASK') {
        return handleTask({ cell, importedCellsReport });
      }

      if (type === 'GATEWAY') {
        return handleGateway({ cell, importedCellsReport });
      }

      if (type === 'START_EVENT') {
        return handleStartEvent({ cell, importedCellsReport });
      }

      if (type === 'END_EVENT') {
        return handleEndEvent({ cell, importedCellsReport });
      }

      if (style === 'marker-loop') {
        cell._attributes.style = 'attribute-loop';
      }

      // Elementos não suportados
      if (unsupportedCells.includes(type)) {
        cell._attributes.value = normalizeValue;
        cell._attributes.style = 'unsupported';
        cell._attributes.subType = 'none';
        cell.mxGeometry._attributes.width = 125;
        cell.mxGeometry._attributes.height = 60;

        importedCellsReport.push([style, value, 'Não suportado']);
        hasUnsupported = true;
      }

      return cell;
    });

    handleImportedCells({ hasUnsupported, importedCellsReport });

    return filteredCells;
  }

  return mxCells;
}

function handleTask({ cell, importedCellsReport }) {
  const { subType, style, value } = cell?._attributes || {};

  if (!['script', 'none'].includes(subType)) {
    cell._attributes.style = 'task';
    cell._attributes.subType = 'none';

    importedCellsReport.push([style, value, 'Adaptado']);
  } else {
    importedCellsReport.push([style, value, 'Importado']);
  }

  return cell;
}

function handleGateway({ cell, importedCellsReport }) {
  const { subType, style, value } = cell?._attributes || {};
  const unsupportedGateway = ['none', 'inclusive', 'event-based'];

  if (unsupportedGateway.includes(subType)) {
    cell._attributes.style = 'gateway-exclusive';
    cell._attributes.subType = 'exclusive';

    importedCellsReport.push([style, value, 'Adaptado']);
  } else {
    importedCellsReport.push([style, value, 'Importado']);
  }

  return cell;
}

function handleStartEvent({ cell, importedCellsReport }) {
  const { subType, style, value } = cell?._attributes || {};

  if (!['none'].includes(subType)) {
    cell._attributes.style = 'start-event';
    cell._attributes.subType = 'none';

    importedCellsReport.push([style, value, 'Adaptado']);
  } else {
    importedCellsReport.push([style, value, 'Importado']);
  }

  cell.mxGeometry._attributes.width = 32;
  cell.mxGeometry._attributes.height = 32;

  return cell;
}

function handleEndEvent({ cell, importedCellsReport }) {
  const { style, value } = cell?._attributes || {};

  cell._attributes.style = 'end-event-terminate';
  cell._attributes.subType = 'none';
  cell.mxGeometry._attributes.width = 32;
  cell.mxGeometry._attributes.height = 32;

  importedCellsReport.push([style, value, 'Adaptado']);

  return cell;
}
