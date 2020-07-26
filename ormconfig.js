
module.exports = {
    'type': 'postgres',
    'host': 'postgres',
    'port': 5432,
    'username': 'sprachcenter',
    'password': 1234,
    'database': 'sprachcenter',
    'synchronize': true,
    'logging': 'all',
    'entities': ['src/models/**/*.ts'],
    'migrations': ['src/migrations/**/*.ts'],
    'subscribers': ['src/subscriber/**/*.ts'],
};
