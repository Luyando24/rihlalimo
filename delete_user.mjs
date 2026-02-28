import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bktpjyjkaovzhvzlernq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdHBqeWprYW92emh2emxlcm5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjM5NzAyNCwiZXhwIjoyMDgxOTczMDI0fQ.7iN9G0pOZ3WITD-Dn0k6NvberstWHH-67QicJJhDSU8';

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
    const email = 'cluyando2@gmail.com';
    console.log(`Searching for user with email ${email}...`);

    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error fetching users:', error);
        process.exit(1);
    }

    const users = data.users;
    const targetUser = users.find(u => u.email === email);

    if (!targetUser) {
        console.log(`User with email ${email} not found.`);
        process.exit(0);
    }

    console.log(`Found user: ID ${targetUser.id}`);

    const { error: deleteError } = await supabase.auth.admin.deleteUser(targetUser.id);

    if (deleteError) {
        console.error('Error deleting user:', deleteError);
        process.exit(1);
    }

    console.log(`Successfully deleted user with email: ${email}`);
}

run();
