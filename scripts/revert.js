import { execSync } from 'child_process';

try {
  console.log('Reverting src/App.tsx via git...');
  const output = execSync('git checkout src/App.tsx', { encoding: 'utf8' });
  console.log('Revert completed successfully:', output);
} catch (error) {
  console.error('Failed to revert src/App.tsx:', error);
}
