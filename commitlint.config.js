module.exports = {
  extends: ['@commitlint/config-angular', '@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test']],
  },
}
