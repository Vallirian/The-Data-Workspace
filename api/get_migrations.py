import os
import subprocess

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "api.settings")

# List of all apps, including Django built-in apps
apps = [
    'auth',
    'admin',
    'contenttypes',
    'sessions',

    'services',
    'user',
    'workbook',
    'shared'
]

output_file = 'all_migrations.sql'
with open(output_file, 'w') as outfile:
    for app in apps:
        try:
            # Use management command `showmigrations` to list all migrations for the app
            command_show = ['python', 'manage.py', 'showmigrations', app]
            output_show = subprocess.check_output(command_show, text=True)
            
            # Extract migration names
            migrations = []
            for line in output_show.splitlines():
                # Assuming the format is like:  [ ] 0001_initial or [X] 0001_initial
                if '[ ]' in line or '[X]' in line:
                    migrations.append(line.split()[-1])
            
            # Process migrations in their natural order
            for migration_name in migrations:
                # Generate SQL for each migration
                command_sql = ['python', 'manage.py', 'sqlmigrate', app, migration_name]
                sql_output = subprocess.check_output(command_sql, text=True)
                
                # Write the SQL to file
                outfile.write(f"-- SQL for {app}, migration {migration_name}\n")
                outfile.write(sql_output + "\n")
        
        except subprocess.CalledProcessError as e:
            print(f"Error generating SQL for {app}: {e}")

print(f"All migration SQL has been written to {output_file}")