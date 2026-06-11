const fs = require('fs');
const path = require('path');

const directory = 'd:/dev-migrate/skillmedha/apps/web/redux/slices/testportal_admin/slice';

function fixImports(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            fixImports(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Fix corrupted multiple aliases
            const badPatterns = [
                /restUrl as restUrl as skillmedhaRestUrl/g,
                /restUrl as skillmedhaRestUrl/g,
                /studentUrl as studentUrl as skillmedhastudentUrl as StudentUrl as studentUrl as StudentUrl/g,
                /studentUrl as skillmedhastudentUrl as StudentUrl/g,
                /studentUrl as skillmedhaStudentUrl/g,
                /studentUrl as StudentUrl/g,
                /testUrl as skillmedhaRestAssessmentUrl as testsUrl/g,
                /testUrl as skillmedhaRestAssessmentUrl/g,
            ];

            badPatterns.forEach(pattern => {
                if (pattern.test(content)) {
                    content = content.replace(pattern, (match) => {
                        if (match.includes('testsUrl')) return 'testUrl as testsUrl';
                        if (match.includes('restUrl')) return 'restUrl';
                        if (match.includes('studentUrl')) return 'studentUrl';
                        if (match.includes('testUrl')) return 'testUrl';
                        return match;
                    });
                    modified = true;
                }
            });

            // Also fix the async thunk usage
            if (content.includes('restUrl +')) {
                // already fine
            }
            if (content.includes('skillmedhaRestUrl')) {
                content = content.replace(/skillmedhaRestUrl/g, 'restUrl');
                modified = true;
            }
            if (content.includes('skillmedhastudentUrl') || content.includes('skillmedhaStudentUrl')) {
                content = content.replace(/skillmedhastudentUrl/g, 'studentUrl');
                content = content.replace(/skillmedhaStudentUrl/g, 'studentUrl');
                modified = true;
            }
            if (content.includes('StudentUrl')) {
                content = content.replace(/StudentUrl/g, 'studentUrl');
                modified = true;
            }
            if (content.includes('skillmedhaRestAssessmentUrl')) {
                content = content.replace(/skillmedhaRestAssessmentUrl/g, 'testUrl');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Cleaned up ${fullPath}`);
            }
        }
    });
}

fixImports(directory);
console.log('Cleanup Done!');
