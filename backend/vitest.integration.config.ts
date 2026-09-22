// backend/vitest.integration.config.ts
//
// Config separada dos testes de unidade (vitest.config.ts): roda apenas o que
// está em test/integration/, com timeouts maiores (chamadas SOAP/REST reais
// contra a SEFAZ em homologação podem demorar vários segundos) e execução
// sequencial (evita abrir várias conexões mTLS simultâneas com o mesmo
// certificado contra o mesmo autorizador).
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/integration/**/*.test.ts'],
    globals: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
    fileParallelism: false,
  },
});
