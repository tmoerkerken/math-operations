import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    'extension.mathOperations',
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const { selection } = editor;
        const selectedText = editor.document.getText(selection);

        const options: string[] = [
          'Multiply',
          'Normalize',
        ];

        vscode.window.showQuickPick(options).then((selectedOption) => {
          if (selectedOption) {
            switch (selectedOption) {
              case 'Multiply':
                multiplySelection(editor, selection, selectedText);
                break;
              case 'Normalize':
                normalizeSelection(editor, selection, selectedText);
                break;
            }
          }
        });
      }
    }
  );

  context.subscriptions.push(disposable);
}
	function multiplySelection(
		editor: vscode.TextEditor,
		selection: vscode.Selection,
		selectedText: string
	) {
		vscode.window
			.showInputBox({
				prompt: 'Enter the multiplication factor:',
				validateInput: (input) => {
					if (!input.match(/^-?\d*\.?\d*$/)) {
						return 'Please enter a valid numerical value.';
					}
					return null;
				},
			})
			.then((input) => {
				const multiplier = parseFloat(input || '');

				if (!isNaN(multiplier)) {
					const multipliedText = selectedText.replace(/-?\d+(\.\d+)?/g, (match) => {
						const number = parseFloat(match);
						const multiplied = isNaN(number) ? match : number * multiplier;
						return multiplied.toString();
					});

					editor.edit((editBuilder) => {
						editBuilder.replace(selection, multipliedText);
					});
				}
			});
	}

	function normalizeSelection(
		editor: vscode.TextEditor,
		selection: vscode.Selection,
		selectedText: string
	) {
		const numberRegex = /-?\d+(\.\d+)?/g; // Regular expression to match numbers

		const numbers = selectedText.match(numberRegex)?.map(Number) ?? [];

		const sum = numbers.reduce((acc, curr) => acc + curr, 0);

		vscode.window
			.showInputBox({
				prompt: 'Enter the number of decimal places:',
				value: '2', // Default value
			})
			.then((input) => {
				const decimalPlaces = parseInt(input || '2', 10);

				if (!isNaN(decimalPlaces)) {
					const factor = Math.pow(10, decimalPlaces);

					const normalizedNumbers = numbers.map((number) => {
						const normalized = number / sum;
						return Math.round(normalized * factor) / factor;
					});

					const normalizedText = selectedText.replace(numberRegex, () => {
						const normalized = normalizedNumbers.shift();
						return normalized !== undefined ? normalized.toFixed(decimalPlaces) : '';
					});

					editor.edit((editBuilder) => {
						editBuilder.replace(selection, normalizedText);
					});
				}
			});
	}

export function deactivate() {}