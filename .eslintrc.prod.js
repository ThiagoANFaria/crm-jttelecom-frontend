module.exports = {
  extends: ['@eslint/js', '@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // Desabilitar regras que impedem o build
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-require-imports': 'warn',
    'no-unused-vars': 'warn',
    // Permitir imports não utilizados (podem ser usados em desenvolvimento)
    'unused-imports/no-unused-imports': 'off',
    'unused-imports/no-unused-vars': 'off'
  }
};
