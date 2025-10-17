-- Location: supabase/migrations/20241017071300_bank_integration_with_auth.sql
-- Schema Analysis: Fresh project - no existing schema
-- Integration Type: New module - Bank Integration with Authentication
-- Dependencies: Creating auth infrastructure and bank management system

-- 1. Types and Enums
CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'user');
CREATE TYPE public.account_type AS ENUM ('checking', 'savings', 'business', 'credit');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE public.transaction_category AS ENUM ('income', 'expense', 'transfer', 'fee', 'interest', 'refund', 'payment', 'withdrawal', 'deposit', 'other');
CREATE TYPE public.connection_status AS ENUM ('connected', 'disconnected', 'pending', 'error', 'expired');

-- 2. Core User Management (PostgREST compatibility)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role public.user_role DEFAULT 'user'::public.user_role,
    company_name TEXT,
    kvk_number TEXT,
    btw_number TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bank Connections (Tink API integration)
CREATE TABLE public.bank_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    provider_name TEXT NOT NULL, -- ING, Rabobank, ABN AMRO, etc.
    provider_id TEXT NOT NULL, -- Tink provider identifier
    connection_id TEXT UNIQUE, -- Tink connection ID
    access_token_encrypted TEXT, -- Encrypted Tink access token
    refresh_token_encrypted TEXT, -- Encrypted Tink refresh token
    consent_id TEXT, -- PSD2 consent identifier
    status public.connection_status DEFAULT 'pending'::public.connection_status,
    last_sync_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB DEFAULT '{}', -- Additional Tink metadata
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bank Accounts
CREATE TABLE public.bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    connection_id UUID REFERENCES public.bank_connections(id) ON DELETE CASCADE,
    external_account_id TEXT NOT NULL, -- Tink account ID
    account_number TEXT NOT NULL, -- IBAN or account number
    account_name TEXT NOT NULL,
    account_type public.account_type DEFAULT 'checking'::public.account_type,
    currency TEXT DEFAULT 'EUR',
    balance DECIMAL(15,2) DEFAULT 0.00,
    available_balance DECIMAL(15,2) DEFAULT 0.00,
    bank_name TEXT NOT NULL,
    bic_code TEXT,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Transactions
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
    external_transaction_id TEXT NOT NULL, -- Tink transaction ID
    amount DECIMAL(15,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    description TEXT NOT NULL,
    counterpart_name TEXT,
    counterpart_account TEXT,
    reference TEXT,
    category public.transaction_category DEFAULT 'other'::public.transaction_category,
    status public.transaction_status DEFAULT 'completed'::public.transaction_status,
    transaction_date TIMESTAMPTZ NOT NULL,
    value_date TIMESTAMPTZ,
    booking_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_reconciled BOOLEAN DEFAULT false,
    reconciled_with TEXT, -- Invoice number, expense ID, etc.
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Transaction Categories Mapping (for AI categorization)
CREATE TABLE public.transaction_category_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    description_pattern TEXT NOT NULL,
    category public.transaction_category NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.85,
    is_manual BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Indexes for Performance
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_bank_connections_user_id ON public.bank_connections(user_id);
CREATE INDEX idx_bank_connections_status ON public.bank_connections(status);
CREATE INDEX idx_bank_accounts_user_id ON public.bank_accounts(user_id);
CREATE INDEX idx_bank_accounts_connection_id ON public.bank_accounts(connection_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX idx_transactions_category ON public.transactions(category);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transaction_category_mappings_user_id ON public.transaction_category_mappings(user_id);

-- 8. Functions (MUST be before RLS policies)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $func$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')::public.user_role
    );
    RETURN NEW;
END;
$func$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $func$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$func$;

-- Tink API helper functions
CREATE OR REPLACE FUNCTION public.encrypt_token(token TEXT)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $func$
SELECT encode(digest(token, 'sha256'), 'hex');
$func$;

-- 9. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_category_mappings ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies (Using correct patterns from instruction)

-- Pattern 1: Core user table (user_profiles) - Simple only, no functions
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pattern 2: Simple user ownership for other tables
CREATE POLICY "users_manage_own_bank_connections"
ON public.bank_connections
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_bank_accounts"
ON public.bank_accounts
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_transactions"
ON public.transactions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_category_mappings"
ON public.transaction_category_mappings
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 11. Triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bank_connections_updated_at
    BEFORE UPDATE ON public.bank_connections
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bank_accounts_updated_at
    BEFORE UPDATE ON public.bank_accounts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 12. Mock Data for Development
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    user_uuid UUID := gen_random_uuid();
    connection1_id UUID := gen_random_uuid();
    connection2_id UUID := gen_random_uuid();
    account1_id UUID := gen_random_uuid();
    account2_id UUID := gen_random_uuid();
BEGIN
    -- Create auth users with complete field structure
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@zzpaccounting.nl', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Admin ZZP", "role": "admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (user_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'user@zzpaccounting.nl', crypt('user123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Jan Janssen", "role": "user"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create bank connections
    INSERT INTO public.bank_connections (id, user_id, provider_name, provider_id, connection_id, status, last_sync_at) VALUES
        (connection1_id, admin_uuid, 'ING Bank', 'ing-nl', 'conn_ing_' || admin_uuid, 'connected'::public.connection_status, now()),
        (connection2_id, admin_uuid, 'Rabobank', 'rabo-nl', 'conn_rabo_' || admin_uuid, 'connected'::public.connection_status, now());

    -- Create bank accounts
    INSERT INTO public.bank_accounts (id, user_id, connection_id, external_account_id, account_number, account_name, account_type, balance, available_balance, bank_name, bic_code) VALUES
        (account1_id, admin_uuid, connection1_id, 'acc_ing_001', 'NL91 INGB 0002 4455 88', 'ZZP Zakelijke Rekening', 'business'::public.account_type, 15420.75, 15420.75, 'ING Bank', 'INGBNL2A'),
        (account2_id, admin_uuid, connection2_id, 'acc_rabo_001', 'NL20 RABO 0123 4567 89', 'Spaarrekening', 'savings'::public.account_type, 8750.00, 8750.00, 'Rabobank', 'RABONL2U');

    -- Create sample transactions
    INSERT INTO public.transactions (user_id, account_id, external_transaction_id, amount, description, counterpart_name, counterpart_account, reference, category, transaction_date, value_date) VALUES
        (admin_uuid, account1_id, 'txn_001', 1250.00, 'Betaling factuur F2024-001 - Acme Corporation', 'Acme Corporation', 'NL12 INGB 0000 1234 56', 'F2024-001', 'income'::public.transaction_category, '2024-10-17 10:00:00+00', '2024-10-17 10:00:00+00'),
        (admin_uuid, account1_id, 'txn_002', -59.99, 'Adobe Creative Cloud abonnement', 'Adobe Systems', 'IE12 AIBK 9312 3456 78', 'ADOBE-CC-2024', 'expense'::public.transaction_category, '2024-10-16 14:30:00+00', '2024-10-16 14:30:00+00'),
        (admin_uuid, account1_id, 'txn_003', -127.50, 'Kantoorbenodigdheden - Office Depot', 'Office Depot', 'NL34 RABO 0123 4567 89', 'OD-INV-789456', 'expense'::public.transaction_category, '2024-10-16 16:45:00+00', '2024-10-16 16:45:00+00'),
        (admin_uuid, account1_id, 'txn_004', 850.00, 'Betaling factuur F2024-002 - Tech Solutions BV', 'Tech Solutions BV', 'NL56 ABN 0987 6543 21', 'F2024-002', 'income'::public.transaction_category, '2024-10-15 09:15:00+00', '2024-10-15 09:15:00+00'),
        (admin_uuid, account1_id, 'txn_005', -65.40, 'Tankstation Shell - Brandstof', 'Shell Nederland', 'NL78 ING 0456 7890 12', 'SHELL-12345', 'expense'::public.transaction_category, '2024-10-15 18:20:00+00', '2024-10-15 18:20:00+00'),
        (admin_uuid, account2_id, 'txn_006', 12.50, 'Rente spaarrekening Q3 2024', 'Rabobank', 'NL20 RABO 0123 4567 89', 'RENTE-Q3-2024', 'interest'::public.transaction_category, '2024-10-14 00:00:00+00', '2024-10-14 00:00:00+00');

    -- Create category mappings for AI categorization
    INSERT INTO public.transaction_category_mappings (user_id, description_pattern, category, is_manual) VALUES
        (admin_uuid, '%Adobe%', 'expense'::public.transaction_category, true),
        (admin_uuid, '%Shell%', 'expense'::public.transaction_category, true),
        (admin_uuid, '%Kantoor%', 'expense'::public.transaction_category, true),
        (admin_uuid, '%Factuur%', 'income'::public.transaction_category, true),
        (admin_uuid, '%Rente%', 'interest'::public.transaction_category, true);

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;

-- 13. Cleanup function for development
CREATE OR REPLACE FUNCTION public.cleanup_bank_test_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    auth_user_ids_to_delete UUID[];
BEGIN
    -- Get auth user IDs to delete
    SELECT ARRAY_AGG(id) INTO auth_user_ids_to_delete
    FROM auth.users
    WHERE email LIKE '%@zzpaccounting.nl';

    -- Delete in dependency order (children first)
    DELETE FROM public.transaction_category_mappings WHERE user_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.transactions WHERE user_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.bank_accounts WHERE user_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.bank_connections WHERE user_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.user_profiles WHERE id = ANY(auth_user_ids_to_delete);
    
    -- Delete auth.users last
    DELETE FROM auth.users WHERE id = ANY(auth_user_ids_to_delete);

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key constraint prevents deletion: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup failed: %', SQLERRM;
END;
$func$;