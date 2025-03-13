# SQL execution
DEFAULT_SCHEMA = 'public' # Default schema for PostgreSQL execution

PGSQL_TYPE_MAPPING = {
    # String types
    "character varying": "string",
    "varchar": "string",
    "character": "string",
    "char": "string",
    "text": "string",
    "uuid": "string",
    "json": "string",
    "jsonb": "string",
    "xml": "string",
    "inet": "string",
    "cidr": "string",
    "macaddr": "string",
    "macaddr8": "string",
    "bit": "string",
    "bit varying": "string",
    "tsvector": "string",
    "tsquery": "string",
    
    # Integer types
    "smallint": "int",
    "integer": "int",
    "bigint": "int",
    "serial": "int",
    "bigserial": "int",
    "smallserial": "int",

    # Floating-point types
    "real": "float",
    "double precision": "float",
    "numeric": "float",
    "decimal": "float",
    "money": "float",

    # Date & Time types
    "date": "date",
    "timestamp": "date",
    "timestamp without time zone": "date",
    "timestamp with time zone": "date",
    "time": "date",
    "time without time zone": "date",
    "time with time zone": "date",
    "interval": "date",

    # Boolean type
    "boolean": "int",  # Can be mapped to Int (0/1) or kept as Boolean if needed

    # Other types (categorize as needed)
    "bytea": "string",  # Binary data stored as a string
    "oid": "int",  # Object Identifier
    "point": "float",
    "line": "float",
    "lseg": "float",
    "box": "float",
    "path": "float",
    "polygon": "float",
    "circle": "float",
}


# Random
RANDOM_NAME_ADJECTIVES = [
    "Brave", "Swift", "Mysterious", "Gentle", "Fierce",
    "Radiant", "Daring", "Silent", "Majestic", "Witty",
    "Bold", "Serene", "Mystic", "Glorious", "Vivid"
]
RANDOM_NAME_NOUNS = [
    "Falcon", "Shadow", "Star", "River", "Phoenix",
    "Moon", "Blade", "Thorn", "Echo", "Ember",
    "Pearl", "Wolf", "Whisper", "Flame", "Horizon"
]

