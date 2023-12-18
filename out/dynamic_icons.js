"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.findPackMcmetaInFolders = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const util_1 = __importDefault(require("util"));
const vscode_1 = require("vscode");
async function namespaceIcon() {
    const enableNamespaceIcons = vscode_1.workspace.getConfiguration().get('mc-dp-icons.enableLoadTickAutoChange');
    if (enableNamespaceIcons) {
        const themePath = path.join(__dirname, '..', 'fileicons', 'mc-dp-icon-theme.json');
        let namespaceNames = getNamespaceNames() || [];
        const themeContent = fs.readFileSync(themePath, "utf-8");
        const themeObject = JSON.parse(themeContent);
        namespaceNames.forEach((namespace) => {
            themeObject.folderNames[namespace] = "namespace";
            themeObject.folderNamesExpanded[namespace] = "namespace_open";
        });
        const updatedThemeContent = JSON.stringify(themeObject, null, 2);
        fs.writeFileSync(themePath, updatedThemeContent, 'utf-8');
    }
}
async function loadTickChange() {
    const enableLoadTickChange = vscode_1.workspace.getConfiguration().get('mc-dp-icons.enableLoadTickAutoChange');
    if (enableLoadTickChange) {
        const themePath = path.join(__dirname, '..', 'fileicons', 'mc-dp-icon-theme.json');
        let [loadValues, tickValues] = await findReference() || [];
        const themeContent = fs.readFileSync(themePath, 'utf8');
        const themeObject = JSON.parse(themeContent);
        tickValues.forEach((function_name) => {
            themeObject.fileNames[function_name] = "mcf_tick";
        });
        loadValues.forEach((function_name) => {
            themeObject.fileNames[function_name] = "mcf_load";
        });
        // Convert the JavaScript object back into a JSON string and write it back into file 
        const updatedThemeContent = JSON.stringify(themeObject, null, 2);
        fs.writeFileSync(themePath, updatedThemeContent, 'utf8');
    }
}
// Convert fs.readFile and fs.writeFile into Promise version to use with async/await
const readFile = util_1.default.promisify(fs.readFile);
function removeFirstPart(input) { return input.split(':')[1]; }
async function findReference() {
    const tickReference = await vscode.workspace.findFiles('**/tick.json', '**/node_modules/**');
    const loadReference = await vscode.workspace.findFiles('**/load.json', '**/node_modules/**');
    if (tickReference.length > 0 && loadReference.length > 0) {
        for (let [i, tickFile] of tickReference.entries()) {
            let loadFile = loadReference[i];
            let tickValues = await processFile(tickFile);
            let loadValues = await processFile(loadFile);
            return [loadValues, tickValues];
        }
    }
    else {
        console.log('tick.json or load.json not found');
    }
}
async function deleteTempIconDefinitions() {
    // Get the absolute path to mc-dp-icon-theme.json
    const themePath = path.join(__dirname, '..', 'fileicons', 'mc-dp-icon-theme.json');
    // Parse content of mc-dp-icon-theme.json
    const themeContent = fs.readFileSync(themePath, 'utf8');
    const themeObject = JSON.parse(themeContent);
    for (let key in themeObject.fileNames) {
        if (themeObject.fileNames[key] === "mcf_tick" || themeObject.fileNames[key] === "mcf_load") {
            delete themeObject.fileNames[key];
        }
    }
    for (let key in themeObject.folderNames) {
        if (themeObject.folderNames[key] === "namespace") {
            delete themeObject.folderNames[key];
            delete themeObject.folderNamesExpanded[key];
        }
    }
    // folderNames && folderNamesExpanded put namespace thingy in there. "foldername" : "namespace | namespace_open"
    // Convert the JavaScript object back into a JSON string and write it back into file 
    const updatedThemeContent = JSON.stringify(themeObject, null, 2);
    fs.writeFileSync(themePath, updatedThemeContent, 'utf8');
}
async function processFile(file) {
    const tickJsonPath = file.fsPath;
    try {
        const data = await readFile(tickJsonPath, 'utf8');
        const tickJson = JSON.parse(data);
        if (tickJson.values && tickJson.values.length > 0) {
            let values = tickJson.values;
            values = values.map(removeFirstPart);
            values = values.map((value) => value += ".mcfunction");
            return values;
        }
        else {
            console.log('No values found');
            return [];
        }
    }
    catch (err) {
        console.error(`Failed to read file: ${err}`);
        return [];
    }
}
function getNamespaceNames() {
    // const workspaceFolders = vscode.workspace.workspaceFolders;
    let packMcmetaPaths = findPackMcmetaInFolders();
    packMcmetaPaths = packMcmetaPaths.map((packPath) => {
        packPath = packPath.replace("pack.mcmeta", "");
        return packPath;
    });
    const folderNames = [];
    if (packMcmetaPaths) {
        packMcmetaPaths.forEach((packPath) => {
            ;
            const dataFolderPath = packPath + "data";
            const assetsFolderPath = packPath + "assets";
            const dataFolderExist = fs.existsSync(dataFolderPath);
            const assetsFolderExist = fs.existsSync(assetsFolderPath);
            try {
                if (dataFolderExist) {
                    const dataFiles = fs.readdirSync(dataFolderPath);
                    dataFiles.forEach((file) => {
                        const filePath = `${dataFolderPath}/${file}`;
                        const isDirectory = fs.statSync(filePath).isDirectory();
                        if (isDirectory) {
                            folderNames.push(file);
                        }
                    });
                }
                if (assetsFolderExist) {
                    const assetsFiles = fs.readdirSync(assetsFolderPath);
                    assetsFiles.forEach((file) => {
                        const filePath = `${assetsFolderPath}/${file}`;
                        const isDirectory = fs.statSync(filePath).isDirectory();
                        if (isDirectory) {
                            folderNames.push(file);
                        }
                    });
                }
            }
            catch (error) {
                console.error(`Error reading folder: ${dataFolderPath}`, error);
            }
        });
    }
    return folderNames;
}
function findPackMcmetaInFolders() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const packMcmetaPaths = [];
    if (workspaceFolders) {
        workspaceFolders.forEach((folder) => {
            const folderPath = folder.uri.fsPath;
            const packMcmetaPath = findPackMcmeta(folderPath);
            if (packMcmetaPath) {
                packMcmetaPaths.push(packMcmetaPath);
            }
        });
    }
    return packMcmetaPaths;
}
exports.findPackMcmetaInFolders = findPackMcmetaInFolders;
function findPackMcmeta(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const filePath = `${directory}/${file}`;
        const isDirectory = fs.statSync(filePath).isDirectory();
        if (isDirectory) {
            const packMcmetaPath = findPackMcmeta(filePath);
            if (packMcmetaPath) {
                return packMcmetaPath;
            }
        }
        else {
            if (file === 'pack.mcmeta') {
                return filePath;
            }
        }
    }
    return undefined;
}
function update() {
    deleteTempIconDefinitions();
    loadTickChange();
    namespaceIcon();
}
exports.update = update;
//# sourceMappingURL=dynamic_icons.js.map