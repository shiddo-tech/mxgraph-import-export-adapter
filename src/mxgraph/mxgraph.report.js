import { getMessages } from './mxgraph.messages';
import { generateCsvReport } from '../utils/file.utils';

export function handleImportedCells({ hasUnsupported, importedCellsReport }) {
  const messages = getMessages();

  if (hasUnsupported) {
    createModal({
      content: messages.modalErrorMessage,
      okButtonText: messages.modalErrorButtonOk,
      onOk: () => {
        generateCsvReport({
          rows: importedCellsReport,
          fileName: 'governance-imported-cells',
        });
      },
    });

    return;
  }

  createModal({
    content: messages.modalSuccessMessage,
    okButtonText: messages.modalSuccessButtonOk,
  });
}

function createModal({ content, okButtonText, onOk }) {
  const modal = document.createElement('div');

  modal.classList = 'mxgraph-import-export-adapter-modal';
  modal.innerHTML = `
    <div class="card-modal">
        ${content}
        <div class="card-modal__actions">
            <button class="confirm-button">${okButtonText}</button>
        </div>
    </div>
    `;

  document.body.appendChild(modal);

  const confirmButton = document.querySelector(
    '.mxgraph-import-export-adapter-modal .card-modal .confirm-button'
  );

  confirmButton.addEventListener('click', () => {
    onOk?.();
    document.body.removeChild(modal);
  });
}
