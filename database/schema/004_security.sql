INSERT INTO app_roles (id, role_name, description) VALUES (seq_app_roles.NEXTVAL, 'Administrator', 'Full platform administration');
INSERT INTO app_roles (id, role_name, description) VALUES (seq_app_roles.NEXTVAL, 'Operations', 'Merchant and transaction operations');
INSERT INTO app_roles (id, role_name, description) VALUES (seq_app_roles.NEXTVAL, 'Finance', 'Revenue analytics and reporting');
INSERT INTO app_roles (id, role_name, description) VALUES (seq_app_roles.NEXTVAL, 'Fraud Analyst', 'Fraud and alert investigation');
INSERT INTO app_roles (id, role_name, description) VALUES (seq_app_roles.NEXTVAL, 'Regional Manager', 'Regional performance analysis');
INSERT INTO app_roles (id, role_name, description) VALUES (seq_app_roles.NEXTVAL, 'Read Only', 'Read-only platform access');

INSERT INTO app_permissions (id, permission_key, description) VALUES (seq_app_permissions.NEXTVAL, 'merchants:read', 'View merchant records');
INSERT INTO app_permissions (id, permission_key, description) VALUES (seq_app_permissions.NEXTVAL, 'transactions:read', 'View transaction records');
INSERT INTO app_permissions (id, permission_key, description) VALUES (seq_app_permissions.NEXTVAL, 'analytics:read', 'View analytics');
INSERT INTO app_permissions (id, permission_key, description) VALUES (seq_app_permissions.NEXTVAL, 'reports:read', 'View and generate reports');
INSERT INTO app_permissions (id, permission_key, description) VALUES (seq_app_permissions.NEXTVAL, 'alerts:read', 'View and manage alerts');
INSERT INTO app_permissions (id, permission_key, description) VALUES (seq_app_permissions.NEXTVAL, 'fraud:read', 'View fraud review data');
INSERT INTO app_permissions (id, permission_key, description) VALUES (seq_app_permissions.NEXTVAL, 'users:manage', 'Manage platform users and roles');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM app_roles r CROSS JOIN app_permissions p WHERE r.role_name = 'Administrator';
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM app_roles r JOIN app_permissions p ON p.permission_key IN ('merchants:read', 'transactions:read', 'alerts:read') WHERE r.role_name = 'Operations';
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM app_roles r JOIN app_permissions p ON p.permission_key IN ('analytics:read', 'reports:read', 'transactions:read') WHERE r.role_name = 'Finance';
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM app_roles r JOIN app_permissions p ON p.permission_key IN ('fraud:read', 'alerts:read', 'transactions:read') WHERE r.role_name = 'Fraud Analyst';
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM app_roles r JOIN app_permissions p ON p.permission_key IN ('analytics:read', 'merchants:read', 'transactions:read') WHERE r.role_name = 'Regional Manager';
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM app_roles r JOIN app_permissions p ON p.permission_key IN ('analytics:read', 'merchants:read', 'transactions:read') WHERE r.role_name = 'Read Only';

COMMIT;
