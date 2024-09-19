from services.pql import helpers as hlp

class PQLValidtor:
    def __init__(self, pql: dict) -> None:
        self.pql = pql
        self.errors = []
    
    def validate(self) -> bool:
        self._validate_keys()
        self._validate_values()
        self._validate_blocks()
        return not self.errors
    
    def _validate_keys(self) -> None:
        _keys = hlp.extract_full_keys(self.pql)

        # Validate keys
        for key in _keys:
            if key['key'] not in hlp.KEY_WORDS:
                self.errors.append(f"Invalid key: {key['key']} at {key['path']}")

        # Validate required keys
        for key in hlp.REQUIRED_KEYS:
            if key not in [k['key'] for k in _keys]:
                self.errors.append(f"Missing key: {key}")

    def _validate_values(self) -> None:
        _keys = hlp.extract_full_keys(self.pql)

        for key in _keys:
            # Validate OPERATOR values
            if key['key'] == 'OPERATOR':
                value = hlp.get_value_from_path(self.pql, key['path'])
                if value not in hlp.OPERATORS:
                    self.errors.append(f"Invalid value: {value} at {key['path']}")

            # Validate COMPARISON_OPERATOR values
            if key['key'] == 'COMPARISON_OPERATOR':
                value = hlp.get_value_from_path(self.pql, key['path'])
                if value not in hlp.COMPARISON_OPERATORS:
                    self.errors.append(f"Invalid comparison operator: {value} for COMPARISON_OPERATOR at {key['path']}")

            #  Validate COLUMN values
            if key['key'] == 'COLUMNS':
                value = hlp.get_value_from_path(self.pql, key['path'])
                if not isinstance(value, list):
                    self.errors.append(f"Invalid value: {value} for COLUMN at {key['path']}. COLUMNS should be a list")

    def _validate_blocks(self) -> None:
        blocks = self.pql['BLOCKS']

        for block in blocks:
            # Validate key
            block_identifier = list(block.keys())
            if len(block_identifier) > 1:
                self.errors.append(f"Block should only have one key but found multiple keys: {block_identifier}")

            if block_identifier[0] not in hlp.BLOCK_KEYS:
                self.errors.append(f"Invalid block key: {block_identifier[0]}")




        