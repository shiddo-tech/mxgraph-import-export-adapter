// Enums
import { FileExtension, FileError } from './mxgraph.enums';

// Utils
import {
  convertXmlToJson,
  convertJsonToXml,
  downloadFile,
} from '../utils/adapter.utils';

export function exportMxGraphFile({ xml = '', metadata }) {
  let jsonContent = convertXmlToJson(xml);

  if (!jsonContent) {
    throw new Errorr(FileError.EMPTY_FILE);
  }

  const modelerContent = {
    modeler: Object.assign({ metadata }, jsonContent),
  };

  const xmlContent = convertJsonToXml(modelerContent);

  downloadFile({
    filename: 'workflow',
    content: xmlContent,
    extension: FileExtension.MODELER,
  });
}
