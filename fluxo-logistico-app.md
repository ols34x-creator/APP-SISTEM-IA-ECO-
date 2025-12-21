P

## 1. ARQUITETURA GERAL

### Camadas Técnicas
- **Frontend**: 
  - App Mobile (React Native/Flutter) - motorista offline-first
  - Portal Web (React/Next.js) - cliente/admin
  - PWA opcional

- **Backend**:
  - API REST/GraphQL central
  - Autenticação JWT + refresh tokens
  - Filas (RabbitMQ/Kafka) para processamento assíncrono
  - Cache Redis para status em tempo real

- **Dados**:
  - PostgreSQL (transações ACID + audit trail)
  - S3/MinIO (fotos, documentos, assinaturas)
  - ELK Stack/CloudWatch (logs centralizados)

- **Integrações**:
  - SEFAZ/Provedor CT-e (emissão fiscal)
  - GPS/Rastreadores (webhooks)
  - Mapas (Google/OSRM) - roteirização
  - SMS/WhatsApp/E-mail (notificações)

## 2. MÁQUINA DE ESTADOS - PEDIDO

```
RASCUNHO → EM_ANALISE → ORCADO → CONFIRMADO → ORDEM_COLETA_EMITIDA → AGENDADO → COLETADO → NO_TERMINAL → EM_TRANSITO → SAINDO_PARA_ENTREGA → ENTREGUE → FATURADO → FINALIZADO
```

**Estados de Exceção**: CANCELADO, DEVOLUCAO_PENDENTE, PERDA_DANOS, RETIDO_FISCAL

### Estado Ordem de Coleta/Viagem
```
CRIADA → ATRIBUIDA → CARREGANDO → LIBERADA → EM_ROTA → INCIDENTE → CONCLUÍDA
```

## 3. ENTIDADES DE DADOS - SCHEMA PRINCIPAL

```sql
-- Clientes
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  legal_name VARCHAR(255) NOT NULL,
  type ENUM('PJ', 'PF'),
  cnpj_cpf VARCHAR(14) UNIQUE,
  email VARCHAR(255),
  phone VARCHAR(20),
  default_address_id UUID,
  created_at TIMESTAMP
);

-- Pedidos
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL,
  order_type ENUM('EXPRESS', 'COMUM', 'REFRIGERADO', 'PERIGOSO'),
  weight_kg DECIMAL(10,2),
  volume_m3 DECIMAL(10,2),
  origin_address JSONB,
  destination_address JSONB,
  delivery_window_start TIMESTAMP,
  delivery_window_end TIMESTAMP,
  approved_tariff DECIMAL(10,2),
  status ENUM('RASCUNHO', 'EM_ANALISE', 'ORCADO', 'CONFIRMADO', ...),
  created_at TIMESTAMP,
  INDEX idx_customer_status (customer_id, status)
);

-- Coletas
CREATE TABLE pickups (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL,
  scheduled_at TIMESTAMP,
  driver_id UUID,
  vehicle_id UUID,
  status ENUM('CRIADA', 'ATRIBUIDA', 'CARREGANDO', 'LIBERADA', 'EM_ROTA', 'CONCLUÍDA'),
  created_at TIMESTAMP
);

-- Rastreamento
CREATE TABLE tracking_events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  shipment_id UUID NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  speed_kmh INT,
  event_type ENUM('GPS_FIX', 'GEOFENCE_ENTER', 'GEOFENCE_EXIT'),
  recorded_at TIMESTAMP,
  INDEX idx_shipment_time (shipment_id, recorded_at)
);

-- POD (Prova de Entrega)
CREATE TABLE pods (
  id UUID PRIMARY KEY,
  shipment_id UUID NOT NULL UNIQUE,
  receiver_name VARCHAR(255),
  signature_image_url VARCHAR(512),
  photos_urls JSONB,
  delivered_at TIMESTAMP
);
```

## 4. ENDPOINTS REST ESSENCIAIS

### Pedidos
- `POST /api/v1/orders` - Criar pedido
- `GET /api/v1/orders/{id}` - Consultar pedido + histórico
- `PUT /api/v1/orders/{id}` - Atualizar dados
- `DELETE /api/v1/orders/{id}` - Cancelar pedido

### Cotações
- `POST /api/v1/orders/{id}/quotes` - Gerar cotação
- `POST /api/v1/quotes/{id}/approve` - Aprovar cotação

### Coletas
- `POST /api/v1/pickups` - Agendar coleta
- `POST /api/v1/pickups/{id}/checkin` - Check-in motorista

### Rastreamento
- `POST /api/v1/tracking/events` - Webhook GPS
- `GET /api/v1/shipments/{id}/tracking` - Consultar tracking

### POD
- `POST /api/v1/shipments/{id}/pod` - Upload assinatura + fotos

### Webhooks
- `POST /webhook/tracking` - Eventos de rastreador
- `POST /webhook/cte-status` - Retorno fiscal
- `POST /webhook/payment` - Confirmação pagamento

## 5. APP MOTORISTA - FUNCIONALIDADES MVP

### Telas Principais
1. **Login**: CPF/e-mail + senha + biometria
2. **Dashboard**: Coletas do dia, horas trabalho, km a rodar
3. **Detalhe Ordem**: Endereço, cliente, documentos, botão check-in
4. **Check-in Coleta**: 
   - Foto local + placa caminhão
   - Assinatura embarcador
   - Observações
5. **Mapa + Navegação**: Rota otimizada, integração Google Maps
6. **POD Entrega**:
   - Assinatura digital recebedor
   - Fotos local + carga
   - Checklist avarias

### Funcionalidades Críticas
- Sincronização offline-first
- GPS em background (30 segundos)
- Upload fotos assíncrono
- Cache local (SQLite/AsyncStorage)

## 6. REGRAS DE NEGÓCIO CRÍTICAS

| Regra | Quando Valida? | Ação |
|-------|----------------|------|
| Capacidade Veículo | Ao confirmar coleta | Bloquear se peso/volume > capacidade |
| Documentos Obrigatórios | Antes de gerar CT-e | NF-e anexada + validação CNPJ |
| Janela Entrega | Ao agendar coleta | Data/hora dentro da janela permitida |
| Carga Perigosa | Ao criar pedido | Certificado + motorista ADR |
| Checklist Carregamento | Antes de liberar veículo | 100% itens confirmados |
| Incidente SLA | Ao reportar incidente | Notificar supervisor em < 2min |

## 7. ROADMAP MVP REALISTA

### Fase 1: MVP Core (8 semanas)
**Semana 1-2**: Setup Infrastructure
- Repositórios, PostgreSQL, CI/CD, Docker

**Semana 3-4**: Backend Auth & Core
- Autenticação JWT, CRUD orders/pickups, cotação básica

**Semana 5-6**: App Motorista - Login & Agenda
- Login + biometria, lista coletas, sincronização offline

**Semana 7-8**: Check-in & POD
- Câmera check-in, POD, sincronização

### Fase 2: Expansão & Qualidade (6 semanas)
- Roteirização automática
- WMS leve
- Notificações SMS/WhatsApp
- Dashboard admin KPIs

### Fase 3: Produção & Escalabilidade
- Multi-terminal
- Contratos & tarifação dinâmica
- Analytics avançado
- Kubernetes, Redis, Kafka

## 8. FLUXO PASSO-A-PASSO MVP

### 1. Cliente Cria Pedido
```
Form → INSERT orders (RASCUNHO) → Upload NF S3
```

### 2. Cotação Automática
```
tarifa = (distância_km × $0.50) + (peso_kg × $0.02)
→ INSERT quotes → Order ORCADO → E-mail cliente
```

### 3. Cliente Aprova
```
Order CONFIRMADO → INSERT pickups (CRIADA)
→ Notificar operacional
```

### 4. Operacional Agenda
```
UPDATE pickups (ATRIBUIDA) → Notificar motorista
```

### 5. Motorista Check-in
```
Foto + assinatura → UPDATE pickup COLETADO
→ Notificar cliente
```

### 6. Recebimento Terminal
```
Pesagem + foto → INSERT shipments (RECEBIDA)
→ UPDATE warehouse_slots
```

### 7. Embarque/Saída
```
CT-e gerado → Checklist 100% → shipment LIBERADA
→ Notificar cliente "Saiu para entrega"
```

### 8. Rastreamento
```
GPS a cada 5min → POST /webhook/tracking
→ Atualizar ETA cliente
```

### 9. Entrega/POD
```
Assinatura + fotos → shipment ENTREGUE
→ Disparar faturamento
```

### 10. Faturamento
```
Gerar invoice → E-mail PDF → Order FATURADO
```

## 9. CHECKLIST ACEITAÇÃO POR ETAPA

### Criação & Cotação
- [ ] Pedido com NF → RASCUNHO
- [ ] Cotação automática calculada
- [ ] Cliente aprova → CONFIRMADO

### Agendamento & Coleta  
- [ ] Operacional agenda → ATRIBUIDA
- [ ] Motorista recebe no app
- [ ] Check-in com foto → COLETADO

### Embarque & Saída
- [ ] CT-e gerado via SEFAZ
- [ ] Checklist 100% confirmado
- [ ] Veículo liberado → EM_TRANSITO

### Rastreamento & Entrega
- [ ] GPS envia eventos a cada 5min
- [ ] POD assinado + fotos → ENTREGUE
- [ ] Fatura gerada automaticamente

## 10. BOAS PRÁTICAS TÉCNICAS

### ✅ DO:
- Event Sourcing (audit_logs para todas transições)
- Idempotência (idempotency_key para retry)
- Versionamento API (/v1/, /v2/)
- Criptografia dados sensíveis
- Rate limiting (1000 req/min)
- Logs estruturados (JSON + context)
- Validação ambos lados (frontend + backend)

### ❌ DON'T:
- Guardar fotos no banco (usar S3)
- Síncrono para operações pesadas (usar filas)
- Confiar em cliente para validação crítica
- App motorista sem cache offline
- Update de ENTREGUE para outro status

## 11. MÉTRICAS & MONITORAMENTO

### KPIs Operacionais:
- Pedidos/dia: target 50+ (fase 1)
- Taxa entrega no prazo: 95%
- Tempo médio coleta: 15min
- Taxa avaria: < 1%

### Alertas Técnicos:
- API latência > 500ms
- Taxa erro > 1%
- GPS offline > 3min
- Pod falha sync > 5min

---

**Próximos Passos Imediatos**:
1. Setup repositórios e infraestrutura base
2. Implementar autenticação JWT
3. Desenvolver CRUD orders + pickups
4. Construir tela login motorista
5. Implementar check-in com câmera

Este guia cobre do conceito até produção, focando no caminho mais curto para MVP funcional: **Autenticação → CRUD básico → App motorista (check-in + POD) → Portal cliente → Integração GPS → Faturamento**.
