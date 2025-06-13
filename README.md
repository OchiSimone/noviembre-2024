# noviembre-2024

This repository contains a collection of Google Apps Script files used with a Google Sheets document. The scripts automate tasks such as generating documents, marking payments, or validating data.

## Deploying the Apps Script project

1. Create a new Apps Script project or link this repo to an existing one using [clasp](https://github.com/google/clasp):
   ```bash
   npm install -g @google/clasp
   clasp login
   clasp create --type sheets --title "noviembre-2024"    # or `clasp clone <script-id>` to link
   ```
2. Copy all `.gs` files and the `appsscript.json` manifest from this repository into the project.
3. Run `clasp push` to upload the code, or paste the contents manually into the Apps Script editor.

## Enabling triggers

1. Open the Apps Script editor in your browser.
2. Click the **Triggers** icon or navigate to **Triggers** from the left-hand menu.
3. Add triggers for the desired functions (for example `onOpen` or `onEdit`).
   Choose the event source (such as "From spreadsheet") and the event type (e.g. "On open" or "On edit").

## Running scripts and tests

- Functions can be run from the **Run** menu in the Apps Script editor.
- To verify that core functions are present, run the `testVerificarFunciones` function. The results will appear in the execution logs.
- There are no Node‑based tests for this repository; testing takes place entirely within Apps Script.
