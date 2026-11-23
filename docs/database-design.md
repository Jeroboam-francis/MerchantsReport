# Database Design

The Oracle schema uses surrogate numeric IDs for core entities and uniqueness constraints on natural identifiers where practical. Transactions and transfer details reference merchants; monthly subscriber rows reference merchant profiles. Date-based indexes support time-window analytics. Aggregate views provide daily and monthly rollups; the materialized view is created with `BUILD IMMEDIATE` and can be refreshed by the supplied package.

Run DDL using an application schema owner with explicit tablespace/quota and required privileges. Validate partitioning, retention, NLS/date settings, and materialized-view refresh strategy against target Oracle version and expected volume before production.
