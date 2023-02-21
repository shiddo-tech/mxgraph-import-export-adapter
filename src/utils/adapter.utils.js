import { xml2json, json2xml } from 'xml-js';

function sanitizeValue(value) {
  const breakLine = '&#xA;';

  return value.replaceAll('\n', breakLine);
}

export function convertXmlToJson(xml, options = { compact: true, spaces: 4 }) {
  if (!xml) {
    return;
  }

  return JSON.parse(
    xml2json(xml, {
      ...options,
      attributeValueFn: sanitizeValue,
    })
  );
}

export function convertJsonToXml(json, options = { compact: true, spaces: 4 }) {
  if (!json) {
    return;
  }

  return json2xml(json, options);
}

export function downloadFile({
  filename,
  content,
  extension = 'xml',
  type = 'application/xml',
}) {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);

  const linkElement = document.createElement('a');
  linkElement.href = url;
  linkElement.download = `${filename}.${extension}`;
  linkElement.click();
}

export function getXmlGraph(graph) {
  const codec = new window.mxCodec();
  const xmlModel = codec.encode(graph.getModel());
  const rootElement = xmlModel.getElementsByTagName('root')[0];

  rootElement.setAttribute('version', '1.1');

  return xmlModel;
}

export function getXmlTextGraph(graph) {
  const xmlGrapah = getXmlGraph(graph);
  return mxUtils.getXml(xmlGrapah);
}
