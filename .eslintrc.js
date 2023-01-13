module.exports = {
  parser: 'typescript-eslint-parser',
  parserOptions: {
    // Specify the version of ECMAScript syntax want to use
    ecmaVersion: 6,
    // Support ECMAScript modules
    sourceType: 'module',
  },
  env: {
    // Note.js global variables and Node.js scoping
    node: true,
    // Adds all of Mocha testing global variables
    mocha: true,
  },
  extends: [
    'plugin:prettier/recommended'
  ],
  plugins: ['prettier'],
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    'import/extensions': ['error', 'ignorePackages', {
      'ts': 'never',
      '': 'never'
    }],
    'max-len': ['error', { code: 120 }],
    'typescript/member-delimiter-style': 'off',
    'typescript/member-ordering': 'off',
  },
}
