// Enums
import { FileError } from './mxgraph.enums';

// Utils
import { convertXmlToJson, convertJsonToXml } from '../utils/adapter.utils';
import * as FileUtils from '../utils/file.utils';

// Mappers
import { mapCells } from './mxgraph.mapper';

export async function importMxGraphFile({ consumer }) {
  const modelerContent = await FileUtils.openFile();
  const jsonContent = convertXmlToJson(modelerContent);

  if (!jsonContent) {
    throw new Error(FileError.EMPTY_FILE);
  }

  const { metadata, mxGraphModel } = jsonContent.modeler || {};

  const validMetadata =
    metadata?.app && metadata?.diagramType && metadata?.version;

  const validMxGraphModel = mxGraphModel?.root;

  if (!validMetadata || !validMxGraphModel) {
    throw new Error(FileError.INVALID_FILE);
  }

  const containCells = Object.keys(mxGraphModel.root.mxCell || {}).length;

  if (!containCells) {
    throw new Error(FileError.CONTAIN_NO_CELLS);
  }

  mxGraphModel.root.mxCell = mapCells({
    mxCells: mxGraphModel.root.mxCell,
    metadata,
    consumer,
  });

  return convertJsonToXml({ mxGraphModel });
}
