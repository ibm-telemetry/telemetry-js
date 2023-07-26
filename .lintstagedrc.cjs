// Note: any groups with two or more linters should end with a non-fix version of each linter to
// ensure no thrashing occurred between the linters/formatters

module.exports = {
  '**/*.(js|cjs|mjs|jsx|ts|tsx)': [
    'prettier --write',
    // 'eslint --fix',
    'prettier --check'
    // 'eslint --max-warnings=0'
  ],
  '**/package.json': ['scripts/format-package-json.js']
}
