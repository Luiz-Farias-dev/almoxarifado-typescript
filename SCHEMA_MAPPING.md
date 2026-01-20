# Schema mapping: Python (SQLAlchemy) ↔ TypeScript (Sequelize)

This file documents the column-name alignment performed to match the canonical SQLAlchemy models in
`temp/backend-almoxarifado-cortez/configs/models.py`.

Key changes (canonical names are the SQLAlchemy column names — TypeScript model attributes were renamed to match):

- Work / Obras
  - `id` → `id`
  - `initials` → `initials`
  - `name` → `name`
  - tableName: `Obras`

- Centro_de_Custo
  - `Centro_Negocio_Cod` (PK, CHAR(50)) → `Centro_Negocio_Cod`
  - `Centro_Nome` → `Centro_Nome`
  - `work_id` (FK -> Obras.id) → `work_id`
  - tableName: `Centro_de_Custo`

- SubInsumo
  - `id` → `id`
  - `Insumo_Cod`, `SubInsumo_Cod`, `Unid_Cod`, `SubInsumo_Especificacao`
  - version/audit fields: `Audit_Insert_Date`, `Audit_LastChange`
  - `INSUMO_ITEMOBSOLETO` (exact casing)
  - tableName: `SubInsumo`

- ListaEspera
  - `id`, `codigo_pedido`, `Insumo_Cod`, `SubInsumo_Cod`, `SubInsumo_Especificacao`, `quantidade`
  - `almoxarife_nome` (was `almoxarifeNome`)
  - `centro_custo` (JSONB)
  - `Unid_Cod`
  - `destino`
  - version field: `data_att` (was mapped from generic created/updated timestamps)
  - tableName: `lista_espera`

- TabelaFinal / MateriaisSaida_Itens (partial)
  - `Centro_Negocio_Cod`, `Insumo_e_SubInsumo_Cod`, `Observacao`, `Num_Doc`, `Tipo_Doc`, `Tipo_Movimentacao`, `quantidade`, `destino`
  - added `data_att`
  - tableName: `tabela_final`

- informacoes_pessoais (User)
  - `nome`, `cpf`
  - `tipo_funcionario` (was `tipoFuncionario`)
  - `senha_hash` (was `senha`)
  - `obra_id` (was `obraId`)
  - tableName: `informacoes_pessoais`

- funcionario_centro_custo (association)
  - `funcionario_id` (FK -> informacoes_pessoais.id)
  - `centro_custo_cod` (FK -> Centro_de_Custo.Centro_Negocio_Cod)
  - `obra_id`
  - tableName: `funcionario_centro_custo`

Notes and next steps:
- I updated the TS Sequelize model attribute names and tableName options to match the SQLAlchemy canonical names.
- I updated code in controllers, app.ts, and some schemas to use the new attribute names where necessary (not exhaustive — additional application areas may need updates depending on runtime behavior).
- Recommend running integration tests / manual smoke tests with the real DB to confirm no remaining mismatch for other endpoints.

