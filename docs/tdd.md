# Technical Design Document

The platform is a modular monolith split into independently containerized UI and API. The API's dependency factory selects a Dummy or Oracle repository at startup, and injects it into services. JWT bearer authentication protects API routes; route validation rejects malformed query/body input before services run. Central error middleware normalizes responses and request IDs.

Analytics are computed from the selected data provider. Oracle installations may additionally use the supplied views/materialized view/package for aggregation. Alert and risk scores are explainable rule outputs, not automated decisions. The SPA uses a single Axios client and auth context; route protection is client-side UX only, while authorization is enforced by API middleware.
