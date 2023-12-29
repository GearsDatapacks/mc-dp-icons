import * as vscode from 'vscode';
import * as ThemeChange from './theme_change';
import * as DynamicIcons from './dynamic_icons';
const path = require('path');

export function activate(context: vscode.ExtensionContext) {
	// console.log('Extension "mc-dp-icons" is now active!');

	// Register the event listeners
	context.subscriptions.push(
		vscode.workspace.onDidChangeWorkspaceFolders(()=>{DynamicIcons.update(); ThemeChange.checkPackMcmeta();}),
		vscode.workspace.onDidRenameFiles(()=>{DynamicIcons.update(); ThemeChange.checkPackMcmeta();}),
		vscode.workspace.onDidDeleteFiles(()=>{DynamicIcons.update(); ThemeChange.checkPackMcmeta();}),
		vscode.workspace.onDidCreateFiles(()=>{DynamicIcons.update(); ThemeChange.checkPackMcmeta();}),
		vscode.workspace.onDidSaveTextDocument((textDocument) => {
			const fileName = path.basename(textDocument.fileName);
			if (fileName === 'tick.json' || fileName === 'load.json') {
				DynamicIcons.update();
				vscode.window.showInformationMessage('AAA');
			}
		}),
		vscode.workspace.onDidChangeConfiguration(()=>{DynamicIcons.update(); ThemeChange.getDefaultIconTheme();})
	);

	// Calling these functions on startup
	ThemeChange.getDefaultIconTheme();
	ThemeChange.checkPackMcmeta();
	DynamicIcons.update();

	let DpIconsOpenSettings = vscode.commands.registerCommand('mc-dp-icons.DpIconsOpenSettings', () => {
		vscode.commands.executeCommand('workbench.action.openSettings', '@ext:superant.mc-dp-icons');
	});

	context.subscriptions.push(DpIconsOpenSettings);
}
