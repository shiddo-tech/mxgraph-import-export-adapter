import { Application, DiagramType, FileError } from './mxgraph/mxgraph.enums';
import { getXmlTextGraph } from './utils/adapter.utils';
import { importMxGraphFile, exportMxGraphFile } from './mxgraph';

const { GOVERNANCE, STUDIO } = Application;
const { bpmn } = DiagramType;

class MxGraphToolbar {
  app = null;
  version = null;
  diagramType = null;
  graph = null;
  renderGraph = null;
  toolbar = null;
  importButton = null;
  exportButton = null;
  notification = null;
  messages = {
    exportTitle: 'Exportar diagrama',
    importTitle: 'Importar diagrama',
    importTitleDisabled: 'Não foi possível importar o arquivo, pois o diagrama já foi iniciado',
    emptyFile: 'Arquivo em branco',
    invalidFile: 'Arquivo inválido',
    containNoCells: 'Não foram encontradas células para serem importadas',
    errorImportingFile: 'Erro ao importar arquivo',
    errorExportingFile: 'Erro ao exportar arquivo',
  };

  init({
    app,
    version,
    diagramType,
    graph,
    renderGraph,
    notification,
    customClass = '',
    exportIcon = 'browser_updated',
    importIcon = 'drive_folder_upload',
    messages = {},
  }) {
    // com app é possível identificar se é STUDIO ou GOVERNANCE
    this.app = app;
    this.version = version;
    this.diagramType = diagramType;
    this.graph = graph;
    this.notification = notification;
    this.renderGraph = renderGraph;

    this.messages = {
      ...this.messages,
      ...messages,
    };

    if (!this.graph) {
      throw new Error('Graph not found');
    }

    if (!this.app) {
      throw new Error('App not found');
    }

    if (!this.renderGraph) {
      throw new Error('Render graph not found');
    }

    if (!this.notification) {
      throw new Error('Notification system not found');
    }

    if (this.diagramType !== bpmn) {
      console.warn(`Unsupported ${this.diagramType}`);
      return;
    }

    this.createToolbar({
      customClass,
      exportIcon,
      importIcon,
    });
  }

  canImportFile() {
    const cellsNumber = Object.keys(this.graph.model.cells).length;

    // A estrutura do studio inicia com 2 células e o governance com 4
    // não devemos permitir importar diagramas em diagramas iniciados/salvos
    return (
      (this.app === STUDIO && cellsNumber === 2) ||
      (this.app === GOVERNANCE && cellsNumber === 4)
    );
  }

  createToolbar({ customClass, exportIcon, importIcon }) {
    this.toolbar = document.createElement('div');
    this.toolbar.classList.add('mxgraph-import-export-toolbar');

    if (customClass) {
      this.toolbar.classList.add(customClass);
    }

    const shouldImportFile = this.canImportFile();

    this.importButton = this.createButton({
      title: shouldImportFile
        ? this.messages.importTitle
        : this.messages.importTitleDisabled,
      icon: importIcon,
      className: 'import-button',
      disabled: !shouldImportFile,
    });

    this.toolbar.appendChild(this.importButton);

    this.importButton.addEventListener(
      'click',
      this.onClickImportButton.bind(this)
    );

    if (this.app !== STUDIO) {
      this.exportButton = this.createButton({
        title: this.messages.exportTitle,
        icon: exportIcon,
        className: 'export-button',
      });

      this.toolbar.appendChild(this.exportButton);

      this.exportButton.addEventListener(
        'click',
        this.onClickExportButton.bind(this)
      );
    }

    document.body.appendChild(this.toolbar);
  }

  createButton({ title, icon, disabled = false }) {
    const button = document.createElement('button');
    button.title = title;
    button.classList.add('btn');
    button.innerHTML = `<i class="material-icons">${icon}</i>`;
    button.disabled = disabled;

    return button;
  }

  async onClickImportButton() {
    try {
      if (!this.canImportFile()) {
        this.showError(this.messages.importTitleDisabled);
        return;
      }

      const modelerXml = await importMxGraphFile({
        consumer: this.app,
      });

      this.renderGraph(modelerXml);
    } catch (error) {
      let message = this.messages.errorImportingFile;

      if (error.message === FileError.EMPTY_FILE) {
        message = this.messages.emptyFile || message;
      }

      if (error.message === FileError.INVALID_FILE) {
        message = this.messages.invalidFile || message;
      }

      if (error.message === FileError.CONTAIN_NO_CELLS) {
        message = this.messages.containNoCells || message;
      }

      this.showError(message);
    }
  }

  showError(message) {
    this.notification.error({
      position: 'topRight',
      timeout: 1000 * 4,
      progressBar: true,
      message,
    });
  }

  onClickExportButton() {
    try {
      const xml = getXmlTextGraph(this.graph);
      const metadata = {
        app: this.app,
        version: this.version,
        diagramType: this.diagramType,
      };

      exportMxGraphFile({ xml, metadata });
    } catch (error) {
      this.notification.error({
        position: 'topRight',
        timeout: 1000 * 4,
        progressBar: true,
        message: this.messages.errorExportingFile,
      });
    }
  }
}

export default new MxGraphToolbar();
