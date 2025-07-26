// .lintstagedrc.js
module.exports = {
  // This function will be called with an array of all staged file paths
  '*.{js,jsx,ts,tsx}': (filenames) => [
    // Construct the `next lint` command with the --file flag for each file
    `next lint --fix --file ${filenames.join(' --file ')}`,
    // Run `tsc` on the whole project to catch any cross-file type errors
    'tsc --noEmit',
  ],
};