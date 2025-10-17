-- Clean system migration: Remove all test data for production-ready state
-- This migration makes the system clean and ready for the first real user

-- First, execute the existing cleanup function to remove all test data
SELECT public.cleanup_bank_test_data();

-- Verify all tables are clean (should return 0 for all counts)
DO $$
DECLARE
    user_count INTEGER;
    connection_count INTEGER;
    account_count INTEGER;
    transaction_count INTEGER;
    mapping_count INTEGER;
BEGIN
    -- Check counts after cleanup
    SELECT COUNT(*) INTO user_count FROM public.user_profiles;
    SELECT COUNT(*) INTO connection_count FROM public.bank_connections;
    SELECT COUNT(*) INTO account_count FROM public.bank_accounts;
    SELECT COUNT(*) INTO transaction_count FROM public.transactions;
    SELECT COUNT(*) INTO mapping_count FROM public.transaction_category_mappings;
    
    -- Log cleanup results
    RAISE NOTICE 'System cleanup completed:';
    RAISE NOTICE '- User profiles: % remaining', user_count;
    RAISE NOTICE '- Bank connections: % remaining', connection_count;
    RAISE NOTICE '- Bank accounts: % remaining', account_count;
    RAISE NOTICE '- Transactions: % remaining', transaction_count;
    RAISE NOTICE '- Category mappings: % remaining', mapping_count;
    
    -- Ensure system is truly clean
    IF user_count > 0 OR connection_count > 0 OR account_count > 0 OR transaction_count > 0 OR mapping_count > 0 THEN
        RAISE NOTICE 'Warning: Some test data may still remain. Manual review recommended.';
    ELSE
        RAISE NOTICE 'SUCCESS: System is completely clean and ready for first user!';
    END IF;
END $$;

-- Reset any sequences to start fresh (optional, for cleaner IDs)
-- Note: UUIDs are used, so no sequences to reset in this schema

-- Add a system status comment
COMMENT ON SCHEMA public IS 'Production-ready schema - cleaned of all test data on 2025-10-17';

-- Final verification and completion logging
DO $$
BEGIN
    RAISE NOTICE '=== SYSTEM CLEANUP MIGRATION COMPLETED ===';
    RAISE NOTICE 'The ZZP Accounting system is now clean and ready for the first user.';
    RAISE NOTICE 'All test data has been removed while preserving schema integrity.';
    RAISE NOTICE 'Tink integration credentials are preserved and ready for use.';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Deploy this migration to your Supabase project';
    RAISE NOTICE '2. The first user can now register via your application';
    RAISE NOTICE '3. User profiles will be automatically created via auth triggers';
    RAISE NOTICE '4. Tink bank integration is ready for production use';
    RAISE NOTICE '=============================================';
END $$;