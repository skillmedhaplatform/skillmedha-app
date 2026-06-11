const fs = require('fs');
const path = require('path');

const directories = [
    'd:/dev-migrate/skillmedha/apps/web/app/testportal_admin/(protected)/question-bank',
    'd:/dev-migrate/skillmedha/apps/web/app/testportal_admin/(protected)/results-database',
    'd:/dev-migrate/skillmedha/apps/web/app/testportal_admin/(protected)/users'
];

function fixDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            fixDirectory(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // 1. Replace relative redux imports
            const reduxRegex = /from\s+["'](\.\.\/)+redux\/slice\/(.*)["']/g;
            if (reduxRegex.test(content)) {
                content = content.replace(reduxRegex, 'from "@/redux/slices/testportal_admin/slice/$2"');
                modified = true;
            }
            
            // 2. Replace relative reusable-comps imports
            const compsRegex = /from\s+["'](\.\.\/)+reusable-comps\/(.*)["']/g;
            if (compsRegex.test(content)) {
                content = content.replace(compsRegex, 'from "@/modules/testportal_admin/components/reusable-comps/$2"');
                modified = true;
            }

            // 3. Replace Home wrapper import
            const homeRegex = /import\s+Home\s+from\s+["'](\.\.\/)+page["'];?/g;
            if (homeRegex.test(content)) {
                content = content.replace(homeRegex, 'const Home = React.Fragment;');
                modified = true;
            }

            // 4. Replace useRouter import
            const routerRegex = /from\s+["']next\/router["']/g;
            if (routerRegex.test(content)) {
                content = content.replace(routerRegex, 'from "@bprogress/next"');
                modified = true;
            }

            // 5. Replace relative styles imports if any
            const stylesRegex = /from\s+["'](\.\.\/)+styles\/(.*)["']/g;
            if (stylesRegex.test(content)) {
                content = content.replace(stylesRegex, 'from "@/modules/testportal_admin/components/styles/$2"');
                modified = true;
            }
            
            // 6. Replace relative graphql_quries imports if any
            const gqlRegex = /from\s+["'](\.\.\/)+graphql_quries\/(.*)["']/g;
            if (gqlRegex.test(content)) {
                content = content.replace(gqlRegex, 'from "@/modules/testportal_admin/graphql_quries/$2"');
                modified = true;
            }
            
            // 7. Replace relative utils imports if any
            const utilsRegex = /from\s+["'](\.\.\/)+utils\/(.*)["']/g;
            if (utilsRegex.test(content)) {
                content = content.replace(utilsRegex, 'from "@/utils/universalUtils/$2"');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Rewrote imports in ${fullPath}`);
            }
        }
    });
}

directories.forEach(dir => fixDirectory(dir));
console.log('Done!');
