const fs = require('node:fs');
const path = require('node:path');

const files = [
  'app/onboarding/page.tsx',
  'app/home/settings/page.tsx',
  'app/home/page.tsx',
  'app/home/new-entry/page.tsx',
  'app/home/components/CalendarModal.tsx',
  'app/home/canvas/[clusterId]/page.tsx',
  'app/home/account/page.tsx',
];

for (const file of files) {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');

    // Remove Loader2 from lucide-react import
    content = content.replace(/,\s*Loader2/, '');
    content = content.replace(/Loader2,\s*/, '');
    content = content.replace(/import { Loader2 } from ['"]lucide-react['"];?\n?/, '');

    // If we removed Loader2 but it's still using other lucide icons, make sure we didn't leave empty braces
    content = content.replace(/import {\s*} from ['"]lucide-react['"];?\n?/, '');

    // Add RoseLoader import if it's not already there and if there's any Loader2 usage
    if (content.includes('<Loader2') && !content.includes('RoseLoader')) {
      // insert after the last import
      const importRegex = /import .* from .*\n/g;
      let lastMatch;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        lastMatch = match;
      }
      if (lastMatch) {
        const insertPos = lastMatch.index + lastMatch[0].length;
        content = `${content.slice(0, insertPos)}import { RoseLoader } from "@/app/components/RoseLoader";\n${content.slice(insertPos)}`;
      }
    }

    // Replace <Loader2 ... /> with <RoseLoader size={16} ... />
    // First, find sizes like w-3 h-3 (12px), w-4 h-4 (16px), w-5 h-5 (20px), w-8 h-8 (32px)
    content = content.replace(/<Loader2[^>]*w-3 h-3[^>]*\/>/g, '<RoseLoader size={12} />');
    content = content.replace(/<Loader2[^>]*h-3 w-3[^>]*\/>/g, '<RoseLoader size={12} />');
    content = content.replace(/<Loader2[^>]*h-4 w-4[^>]*\/>/g, '<RoseLoader size={16} />');
    content = content.replace(/<Loader2[^>]*w-4 h-4[^>]*\/>/g, '<RoseLoader size={16} />');
    content = content.replace(/<Loader2[^>]*h-5 w-5[^>]*\/>/g, '<RoseLoader size={20} />');
    content = content.replace(/<Loader2[^>]*w-5 h-5[^>]*\/>/g, '<RoseLoader size={20} />');
    content = content.replace(/<Loader2[^>]*h-8 w-8[^>]*\/>/g, '<RoseLoader size={32} />');
    content = content.replace(/<Loader2[^>]*w-8 h-8[^>]*\/>/g, '<RoseLoader size={32} />');
    content = content.replace(/<Loader2[^>]*size=\{14\}[^>]*\/>/g, '<RoseLoader size={14} />');
    content = content.replace(/<Loader2[^>]*size=\{16\}[^>]*\/>/g, '<RoseLoader size={16} />');

    // Fallback for any remaining Loader2
    content = content.replace(/<Loader2[^>]*\/>/g, '<RoseLoader size={16} />');

    fs.writeFileSync(fullPath, content);
  }
}
