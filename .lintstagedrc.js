// .lintstagedrc.js
module.exports = {
  // This function will be called with an array of all staged file paths
  '*.{js,jsx,ts,tsx}': (filenames) => [
    // Construct the `next lint` command with the --file flag for each file
    `next lint --fix --file ${filenames.join(' --file ')}`,
    // Run `tsc` on the whole project, explicitly excluding the .next directory
    // to avoid the false-positive errors that `next build` already handles correctly.
    'tsc --noEmit --project tsconfig.json',
  ],
};