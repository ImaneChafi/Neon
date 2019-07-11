/** @module Validation */

 const schemaPromise = import('./validation/mei-all.rng');

import Worker from './Worker.js';
var worker, schema, statusField, blankButton;

/**
 * Add the validation information to the display and create the WebWorker
 * for validation MEI.
 */
export async function init () {
  let displayContents = document.getElementById('displayContents');
  if (displayContents !== null) {
    let panelBlock = document.createElement('div');
    panelBlock.classList.add('panel-block');
    let pNotif = document.createElement('p');
    pNotif.textContent = 'MEI Status: ';
    let span = document.createElement('span');
    span.id = 'validation_status';
    span.textContent = 'unknown';
    pNotif.appendChild(span);
    panelBlock.appendChild(pNotif);
    displayContents.appendChild(panelBlock);
    statusField = document.getElementById('validation_status');

    blankButton = document.createElement('button');
    blankButton.classList.add('button');
    blankButton.style.marginLeft = '1em';
    blankButton.textContent = 'Add Blank MEI File';
    blankButton.style.display = 'none';
    panelBlock.appendChild(blankButton);

    worker = new Worker();
    worker.onmessage = updateUI;
  }
}

/**
 * Send the contents of an MEI file to the WebWorker for validation.
 * @param {string} meiData
 */
export async function sendForValidation (meiData) {
  if (statusField === undefined) {
    return;
  }
  if (schema === undefined) {
    schema = await schemaPromise;
  }
  blankButton.style.display = 'none';
  statusField.textContent = 'checking...';
  statusField.style = 'color:gray';
  worker.postMessage({
    mei: meiData,
    schema: schema.default
  });
}

/**
 * Update the UI with the validation results. Called when the WebWorker finishes validating.
 * @param {object} message - The message sent by the WebWorker.
 * @param {object} message.data - The errors object produced by XML.js
 */
function updateUI (message) {
  blankButton.style.display = 'none';
  let errors = message.data;
  if (errors === null) {
    statusField.textContent = 'VALID';
    statusField.style = 'color:green';
    for (let child of statusField.children) {
      statusField.deleteChild(child);
    }
  } else {
    let log = '';
    errors.forEach(line => {
      log += line + '\n';
    });
    statusField.textContent = '';
    statusField.style = 'color:red';
    let link = document.createElement('a');
    link.setAttribute('href', 'data:text/plain;charset=utf-8,' +
      encodeURIComponent(log));
    link.setAttribute('download', 'validation.log');
    link.textContent = 'INVALID';
    statusField.appendChild(link);
  }
}

/**
 * Update the message on a blank page when there is no MEI.
 */
export function blankPage (cb) {
  for (let child of statusField.children) {
    statusField.deleteChild(child);
  }
  statusField.textContent = 'No MEI'
  statusField.style = 'color:gray';

  blankButton.style.display = '';
  blankButton.onclick = cb;
}
