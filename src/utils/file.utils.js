import { FileExtension } from '../mxgraph/mxgraph.enums';

function removeElement(element) {
  return element.parentElement.removeChild(element);
}

function readFile(event) {
  return new Promise((resolve) => {
    const fileInput = event.target;
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      removeElement(fileInput);
      resolve(e.target.result);
    };
    reader.readAsText(file);
  });
}

export function openFile() {
  return new Promise((resolve) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    fileInput.accept = `.${FileExtension.MODELER}`;

    fileInput.onchange = async (event) => {
      const fileContent = await readFile(event);
      resolve(fileContent);
    };

    document.body.appendChild(fileInput);
    fileInput.click();
  });
}
