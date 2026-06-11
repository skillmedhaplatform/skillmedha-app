const fs = require('fs');
const path = require('path');

const directories = [
    'd:/dev-migrate/skillmedha/apps/web/redux/slices/testportal_admin/slice',
    'd:/dev-migrate/skillmedha/apps/web/app/testportal_admin',
    'd:/dev-migrate/skillmedha/apps/web/modules/testportal_admin'
];

function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Replacements
            const replacements = [
                { from: /skillmedhagqlUrl as gqlUrl/g, to: 'gqlUrl' },
                { from: /skillmedhaRestUrl as restUrl/g, to: 'restUrl' },
                { from: /skillmedhaRestUrl/g, to: 'restUrl as skillmedhaRestUrl' },
                { from: /skillmedhaStudentUrl/g, to: 'studentUrl as skillmedhaStudentUrl' },
                { from: /StudentUrl/g, to: 'studentUrl as StudentUrl' },
                { from: /skillmedhaRestAssessmentUrl/g, to: 'testUrl as skillmedhaRestAssessmentUrl' }
            ];

            replacements.forEach(({ from, to }) => {
                if (from.test(content)) {
                    content = content.replace(from, to);
                    modified = true;
                }
            });

            // Cleanup redundant aliases like "gqlUrl as gqlUrl"
            if (content.includes('gqlUrl as gqlUrl')) {
                content = content.replace(/gqlUrl as gqlUrl/g, 'gqlUrl');
                modified = true;
            }
            if (content.includes('studentUrl as skillmedhaStudentUrl as StudentUrl')) {
                // regex might have messed up if both existed
                // Let's just fix the import specifically for studentSlice.js where multiple might exist
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    });
}

directories.forEach(dir => processDirectory(dir));
console.log('Done!');
