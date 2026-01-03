const vscode = require('vscode');
const cp = require('child_process');
const path = require('path');

function activate(context) {
    const exe = path.join(__dirname, 'set_opacity.exe');
    let config = vscode.workspace.getConfiguration('opacityControl');

    const apply = v => {
		statusBarItem.text = `透明度: ${v}`
		cp.execFile(exe, [String(v)], { windowsHide: true })
	};
    const set = v => config.update('opacity', v, vscode.ConfigurationTarget.Global);
	const get = v => config.inspect(v).globalValue;

    const change = async d => {
        let v = get('opacity') ?? 255, s = get('step') ?? 5;
        v = Math.max(0, Math.min(255, v + d * s));
        await set(v); apply(v);
    };

    vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('opacityControl.opacity')) {
			config = vscode.workspace.getConfiguration('opacityControl');
			apply(config.get('opacity'));
		}
    });

	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.text = `透明度: ${get('opacity') ?? 255}`;
	statusBarItem.tooltip = '点击设置透明度';
	statusBarItem.command = 'opacityControl.set';
	statusBarItem.show();

    apply(get('opacity') ?? 255);

    context.subscriptions.push(
        vscode.commands.registerCommand('opacityControl.decrease', () => change(-1)),
        vscode.commands.registerCommand('opacityControl.increase', () => change(1)),
        vscode.commands.registerCommand('opacityControl.set', async () => {
            const v = parseInt(await vscode.window.showInputBox({ prompt: '输入透明度 (0-255)' }));
            if (!isNaN(v) && v >= 0 && v <= 255) await set(v), apply(v);
            else vscode.window.showErrorMessage('输入无效');
        })
    );
}

exports.activate = activate;
