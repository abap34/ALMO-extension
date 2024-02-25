const vscode = require('vscode');
const exec = require('child_process')


/**
 * @param {vscode.ExtensionContext} context
 */





function activate(context) {
	console.log('ALMO is now active!');
	let preview = vscode.commands.registerCommand('almo.preview', function () {
		let first = true;
		let editor = vscode.window.activeTextEditor;
		if (!editor) {
			return; // No open text editor
		}


		// read config
		let config = vscode.workspace.getConfiguration('almo');
		// if css is not set, use default css
		let css = config.get('css');

		if (css != '') {
			css = ' -c ' + css;
		} else {
			css = '';
		}

		let command = 'almo ' + editor.document.fileName 

		command += css;

		let panel = vscode.window.createWebviewPanel(
			'almoPreview',
			'Preview of ' + editor.document.fileName,
			vscode.ViewColumn.Two,
			{
				enableScripts: true
			}
		);

		if (first) {
			exec.exec(command, (err, stdout, stderr) => {
				if (err) {
					console.log(err);
					return;
				}
				console.log('stderr:', stderr);
				panel.webview.html = stdout;
			}
			)
			first = false;
			var latest_updated_at = Date.now();
		}


		vscode.workspace.onDidSaveTextDocument(() => {
			// limit update frequency
			if (Date.now() - latest_updated_at < 1000) {
				return;
			}
			exec.exec(command, (err, stdout, stderr) => {
				if (err) {
					console.log(err);
					return;
				}
				console.log('stderr:', stderr);
				panel.webview.html = stdout;
			}
			)
			latest_updated_at = Date.now();
		}
		);
	});
	context.subscriptions.push(preview);
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
