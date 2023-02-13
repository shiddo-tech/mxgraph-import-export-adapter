let messages = {
  exportTitle: 'Exportar diagrama da plataforma Governance',
  importTitle: 'Importar diagrama da plataforma Governance',
  importTitleDisabled:
    'Não é possível importar o diagrama da plataforma Governance, pois o diagrama já foi iniciado',
  emptyFile: 'Arquivo em branco',
  invalidFile: 'Arquivo inválido',
  containNoCells: 'Não foram encontradas células para serem importadas',
  errorImportingFile: 'Erro ao importar arquivo',
  errorExportingFile: 'Erro ao exportar arquivo',
  modalSuccessMessage:
    'O diagrama foi importado da plataforma Governance com sucesso e sem nenhuma incompatibilidade detectada.',
  modalErrorMessage: 'O diagrama foi importado da plataforma Governance com incompatibilidades. Clique em "Ok" para baixar o relatório',
  modalSuccessButtonOk: 'Ok',
  modalErrorButtonOk: 'Ok',
};

export function setMessages(customMessages) {
  messages = { ...messages, ...customMessages };
}

export function getMessages() {
  return messages;
}
