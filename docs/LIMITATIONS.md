# UdaanSetu — Known Limitations & Future Roadmap

---

## 1. Explicit Current Limitations

1. **Government Gateways in Sandbox Mode**:
   - Production access to production Aadhaar/DigiLocker/IP India APIs requires official government credentials, IP whitelisting, and compliance auditing. Currently, integration adapters operate in prototype/sandbox simulation mode.
2. **Local Embedding Memory Footprint**:
   - While the scikit-learn TF-IDF engine operates with sub-10ms latency and minimal memory, full deep Sentence-Transformer (`all-MiniLM-L6-v2`) models require ~120MB memory and are lazy-loaded on demand.
3. **Database Concurrency in SQLite**:
   - SQLite is used only for local development and unit tests. For multi-user concurrency and high-throughput pilots, PostgreSQL is required and configured in `render.yaml` and `docker-compose.prod.yml`.
4. **Email / SMS Dispatch**:
   - Notifications are fully rendered and stored in-app with unread badge counters. External SMTP/SMS gateways require provisioned Twilio/SendGrid credentials.

---

## 2. Production Roadmap

- **Phase 2.1**: Direct GeM (Government e-Marketplace) API integration for automated purchase order forwarding.
- **Phase 2.2**: Multi-region PostgreSQL read-replica deployment for statewide scalability across all 36 Maharashtra districts.
- **Phase 2.3**: Webhook subscription system for automated patent grant updates from the Indian Patent Office.
- **Phase 2.4**: Integration of fine-tuned Indic LLMs for vernacular regional language support (Marathi, Hindi, Gujarati).
