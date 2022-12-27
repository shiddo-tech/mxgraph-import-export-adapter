import { Application } from './mxgraph.enums';

const { GOVERNANCE, STUDIO } = Application;

export function mapCells({ mxCells, metadata, consumer }) {
  // TODO Tratar metadata
  const { app, diagramType, version } = metadata;

  const sourceApp = app._text;
  const targetApp = consumer;

  if (sourceApp === GOVERNANCE && targetApp === STUDIO) {
    const markersNotSupported = [
      'markerPoint',
      'marker-loop',
      'marker-ad-hoc',
      'marker-compensation',
      'marker-sequential-mi',
      'marker-parallel-mi',
    ];

    return mxCells
      .filter((cell) => !markersNotSupported.includes(cell._attributes?.style))
      .map((cell) => {
        let { type, subType, style, value } = cell?._attributes || {};

        const breakLine = '&#xA;';
        const normalizeValue = value ? `${value}${breakLine}` : '';

        if (type === 'TASK' && subType !== 'none') {
          cell._attributes.style = 'task';
          cell._attributes.subType = 'none';
        }

        if (
          type === 'GATEWAY' &&
          ['none', 'inclusive', 'event-based'].includes(subType)
        ) {
          cell._attributes.style = 'gateway-exclusive';
          cell._attributes.subType = 'exclusive';
        }

        if (type === 'START_EVENT') {
          if (!['none'].includes(subType)) {
            cell._attributes.style = 'start-event';
            cell._attributes.subType = 'none';
          }

          cell.mxGeometry._attributes.width = 32;
          cell.mxGeometry._attributes.height = 32;
        }

        if (type === 'END_EVENT') {
          cell._attributes.style = 'end-event-terminate';
          cell._attributes.subType = 'none';
          cell.mxGeometry._attributes.width = 32;
          cell.mxGeometry._attributes.height = 32;
        }

        if (type === 'INTERMEDIATE_EVENT') {
          cell._attributes.value = `${normalizeValue}${style}${breakLine}não suportado`;
          cell._attributes.subType = 'none';
          cell._attributes.style = 'task';
          cell.mxGeometry._attributes.width = 125;
          cell.mxGeometry._attributes.height = 82;
        }

        if (['DATA_STORE', 'WORKFLOW_INTERFACE'].includes(type)) {
          cell._attributes.value = `${normalizeValue}${style}${breakLine}não suportado`;
          cell._attributes.subType = 'none';
          cell._attributes.style = 'task';
          cell.mxGeometry._attributes.width = 125;
          cell.mxGeometry._attributes.height = 82;
        }

        return cell;
      });
  }

  return mxCells;
}
