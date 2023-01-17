"use strict";
const vscode = require('vscode');
const extensionShortName = 'indentWhitespace';

function activate(context) {
  const whiteSpace = new WhiteSpace();
  vscode.workspace.onDidChangeConfiguration( configevent => {
    if (configevent.affectsConfiguration(extensionShortName)  || configevent.affectsConfiguration('workbench')) { whiteSpace.updateConfigurations(); }
  }, null, context.subscriptions);
  vscode.window.onDidChangeTextEditorSelection( changeEvent => { whiteSpace.updateEditor(changeEvent.textEditor); }, null, context.subscriptions);
}

class WhiteSpace {

  constructor() {
    this.spaceDecoration = undefined;
    this.updateConfigurations();
  }

  updateConfigurations() {
    this.clearDecorations();
    let configurations = vscode.workspace.getConfiguration(extensionShortName);
    const enlargementCount = configurations.get("space.enlargement");
    this.spaceDecoration = undefined;
    if (enlargementCount > 0) {
      const positionSpaceDecorator = configurations.get("space.positionDecorator");
      let workbenchConfig = vscode.workspace.getConfiguration("workbench");
      let themeName = workbenchConfig.get("colorTheme");

      let enlargement = "";
      for (let i = 0; i < enlargementCount; ++i) { enlargement += " "; }

      let decorator = { };
      if (themeName.indexOf('Contrast') >= 0) {
        decorator[positionSpaceDecorator] = { contentText: enlargement, textDecoration: "none; border: 4px double currentcolor; border-style: none none double none;", color:new vscode.ThemeColor("indentWhitespace.space.enlargement") };
      } else {
        decorator[positionSpaceDecorator] = { contentText: enlargement, backgroundColor:new vscode.ThemeColor("indentWhitespace.space.enlargement")};
      }

      this.spaceDecoration = vscode.window.createTextEditorDecorationType(decorator);
    }
    this.updateDecorations();
  }

  clearDecorations() {
    if (!this.spaceDecoration) { return; }
    vscode.window.visibleTextEditors.forEach(this.clearEditor, this);
  }

  /** @param {vscode.TextEditor} editor */
  clearEditor(editor) {
    if (!this.spaceDecoration) { return; }
    editor.setDecorations(this.spaceDecoration, []);
  }

  updateDecorations() {
    if (!this.spaceDecoration) { return; }
    vscode.window.visibleTextEditors.forEach(this.updateEditor, this);
  }

  /** @param {vscode.TextEditor} editor */
  updateEditor(editor) {
    if (!this.spaceDecoration) { return; }

    let whitespaceRanges = [];
    const lineCount = editor.document.lineCount;
    for (let currentLineNum = 0; currentLineNum < lineCount; ++currentLineNum) {
      const line = editor.document.lineAt(currentLineNum).text;

      let charNum = 0;
      let lineLength = line.length;

      for (; charNum < lineLength; ++charNum) {
        const ch = line[charNum];
        if (ch === ' ') {
          whitespaceRanges.push(new vscode.Range(currentLineNum, charNum, currentLineNum, charNum+1));
        } else {
          break;
        }
      }
    }

    editor.setDecorations(this.spaceDecoration, whitespaceRanges);
  }
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}
