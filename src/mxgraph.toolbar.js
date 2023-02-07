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
    exportTitle: 'Exportar diagrama da plataforma Governance',
    importTitle: 'Importar diagrama da plataforma Governance',
    importTitleDisabled:
      'Não é possível importar o diagrama da plataforma Governance, pois o diagrama já foi iniciado',
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
    messages = {},
  }) {
    // com app é possível identificar se é STUDIO ou GOVERNANCE
    this.app = app;
    this.version = version;
    this.diagramType = diagramType;
    this.graph = graph;
    this.notification = notification;
    this.renderGraph = renderGraph;
    this.initialCellsNumber = Object.keys(this.graph.model.cells).length;

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
    });
  }

  canImportFile() {
    const currentCellsNumber = Object.keys(this.graph.model.cells).length;

    // A estrutura do studio inicia com 2 células
    if (this.app === STUDIO) {
      return this.initialCellsNumber === 2 && currentCellsNumber === 2;
    }

    // A estrutura do Governance inicia com 5 células
    return this.initialCellsNumber <= 5 && currentCellsNumber <= 5;
  }

  createToolbar({ customClass }) {
    this.toolbar = document.createElement('div');
    this.toolbar.classList.add('mxgraph-import-export-toolbar');

    if (customClass) {
      this.toolbar.classList.add(customClass);
    }

    const shouldImportFile = this.canImportFile();

    if (this.app === STUDIO) {
      this.importButton = document.createElement('button');
      this.importButton.classList.add('import-button', 'btn');
      // this.importButton.disabled = !shouldImportFile;
      this.importButton.title = shouldImportFile
        ? this.messages.importTitle
        : this.messages.importTitleDisabled;

      this.importButton.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M29.06 14.3607L31.56 12M31.56 12L34.06 14.3607M31.56 12L31.56 21" stroke="black" stroke-width="1.5"/>
          <path d="M11.86 19.14H10.04V17.48C10.04 17.24 10 17.0867 9.92 17.02C9.84 16.94 9.68 16.9 9.44 16.9H8.42C8.18 16.9 8.02 16.94 7.94 17.02C7.86 17.0867 7.82 17.24 7.82 17.48V26.02C7.82 26.26 7.86 26.42 7.94 26.5C8.02 26.5667 8.18 26.6 8.42 26.6H9.44C9.68 26.6 9.84 26.5667 9.92 26.5C10 26.42 10.04 26.26 10.04 26.02V22.96H9.04V21.56H11.86V26.24C11.86 27.4267 11.24 28.02 10 28.02H7.86C6.62 28.02 6 27.4267 6 26.24V17.24C6 16.0667 6.62 15.48 7.86 15.48H10C11.24 15.48 11.86 16.0667 11.86 17.24V19.14Z" fill="black"/>
          <path d="M15.5167 15.48H17.7367C18.9767 15.48 19.5967 16.0667 19.5967 17.24V26.24C19.5967 27.4133 18.9767 28 17.7367 28H15.5167C14.2634 28 13.6367 27.4133 13.6367 26.24V17.24C13.6367 16.0667 14.2634 15.48 15.5167 15.48ZM17.7967 25.96V17.52C17.7967 17.28 17.7567 17.1267 17.6767 17.06C17.5967 16.98 17.4367 16.94 17.1967 16.94H16.0367C15.7967 16.94 15.6367 16.98 15.5567 17.06C15.4901 17.1267 15.4567 17.28 15.4567 17.52V25.96C15.4567 26.2 15.4901 26.36 15.5567 26.44C15.6367 26.5067 15.7967 26.54 16.0367 26.54H17.1967C17.4367 26.54 17.5967 26.5067 17.6767 26.44C17.7567 26.36 17.7967 26.2 17.7967 25.96Z" fill="black"/>
          <path d="M25.8683 15.48H27.7283L25.4683 28H22.9083L20.6483 15.48H22.5083L24.1683 26.34L25.8683 15.48Z" fill="black"/>
        </svg>      
      `;

      this.toolbar.appendChild(this.importButton);

      this.importButton.addEventListener(
        'click',
        this.onClickImportButton.bind(this)
      );
    }

    if (this.app === GOVERNANCE) {
      this.exportButton = document.createElement('button');
      this.exportButton.classList.add('export-button', 'btn');
      this.exportButton.title = this.messages.exportTitle;

      this.exportButton.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M34.06 18.6393L31.56 21M31.56 21L29.06 18.6393M31.56 21L31.56 12" stroke="black" stroke-width="1.5"/>
          <path d="M11.86 19.14H10.04V17.48C10.04 17.24 10 17.0867 9.92 17.02C9.84 16.94 9.68 16.9 9.44 16.9H8.42C8.18 16.9 8.02 16.94 7.94 17.02C7.86 17.0867 7.82 17.24 7.82 17.48V26.02C7.82 26.26 7.86 26.42 7.94 26.5C8.02 26.5667 8.18 26.6 8.42 26.6H9.44C9.68 26.6 9.84 26.5667 9.92 26.5C10 26.42 10.04 26.26 10.04 26.02V22.96H9.04V21.56H11.86V26.24C11.86 27.4267 11.24 28.02 10 28.02H7.86C6.62 28.02 6 27.4267 6 26.24V17.24C6 16.0667 6.62 15.48 7.86 15.48H10C11.24 15.48 11.86 16.0667 11.86 17.24V19.14Z" fill="black"/>
          <path d="M15.5167 15.48H17.7367C18.9767 15.48 19.5967 16.0667 19.5967 17.24V26.24C19.5967 27.4133 18.9767 28 17.7367 28H15.5167C14.2634 28 13.6367 27.4133 13.6367 26.24V17.24C13.6367 16.0667 14.2634 15.48 15.5167 15.48ZM17.7967 25.96V17.52C17.7967 17.28 17.7567 17.1267 17.6767 17.06C17.5967 16.98 17.4367 16.94 17.1967 16.94H16.0367C15.7967 16.94 15.6367 16.98 15.5567 17.06C15.4901 17.1267 15.4567 17.28 15.4567 17.52V25.96C15.4567 26.2 15.4901 26.36 15.5567 26.44C15.6367 26.5067 15.7967 26.54 16.0367 26.54H17.1967C17.4367 26.54 17.5967 26.5067 17.6767 26.44C17.7567 26.36 17.7967 26.2 17.7967 25.96Z" fill="black"/>
          <path d="M25.8683 15.48H27.7283L25.4683 28H22.9083L20.6483 15.48H22.5083L24.1683 26.34L25.8683 15.48Z" fill="black"/>
        </svg>
      `;

      this.toolbar.appendChild(this.exportButton);

      this.exportButton.addEventListener(
        'click',
        this.onClickExportButton.bind(this)
      );
    }

    document.body.appendChild(this.toolbar);
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
