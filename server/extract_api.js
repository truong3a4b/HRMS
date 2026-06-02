const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src', 'routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

const indexContent = fs.readFileSync(path.join(routesDir, 'index.ts'), 'utf-8');
const routeMap = {};
const useRegex = /router\.use\(['"]\/([^'"]+)['"],\s*(\w+)Routes\);/g;
let matchUse;
while ((matchUse = useRegex.exec(indexContent)) !== null) {
    const prefix = matchUse[1];
    const camelCaseName = matchUse[2];
    
    // Guess the filename from camelCase. Actually, just look at imports
    routeMap[camelCaseName] = prefix;
}

const importRegex = /import (\w+)Routes from ["']\.\/([^"']+)["'];/g;
const fileToPrefix = {};
let matchImport;
while ((matchImport = importRegex.exec(indexContent)) !== null) {
    const camelCaseName = matchImport[1];
    const filename = matchImport[2] + '.ts';
    if (routeMap[camelCaseName]) {
        fileToPrefix[filename] = routeMap[camelCaseName];
    }
}

let markdown = '# Tài liệu API Hệ thống HRMS\n\n';
markdown += 'Đây là danh sách tổng hợp các API Endpoint trong hệ thống.\n\n';

const regex = /router\.(get|post|put|patch|delete)\(\s*['"]([^'"]+)['"]/g;

files.forEach(file => {
    const filePath = path.join(routesDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const prefix = fileToPrefix[file] || file.replace('.routes.ts', '');
    const moduleName = file.replace('.routes.ts', '').toUpperCase();
    
    let match;
    const endpoints = [];
    while ((match = regex.exec(content)) !== null) {
        const method = match[1].toUpperCase();
        let endpoint = match[2];
        if (endpoint === '/') endpoint = '';
        endpoints.push(`- **${method}** \`/api/${prefix}${endpoint}\``);
    }
    
    if (endpoints.length > 0) {
        markdown += `## Module: ${moduleName}\n`;
        endpoints.forEach(ep => {
            markdown += `${ep}\n`;
        });
        markdown += '\n';
    }
});

// Write to the user artifact directory
const artifactDir = path.join('C:\\Users\\NXTruongdk\\.gemini\\antigravity-cli\\brain\\e2818a19-6e99-41f2-acca-a30ac884bf4d');
fs.writeFileSync(path.join(artifactDir, 'api_docs.md'), markdown);
console.log('Artifact api_docs.md created in ' + artifactDir);
