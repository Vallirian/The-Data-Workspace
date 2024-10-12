from services.pql import helpers as hlp

class PQLValidtor:
    def __init__(self, pql: dict) -> None:
        self.pql = pql
        self.errors = []
    
    def validate(self) -> bool:
        try:
            # top level keys validation
            self._validate_top_level()

            # general validation
            self._validate_keys()
            self._validate_values()

            # block level validation
            self._validate_blocks()
            return not self.errors
        except Exception as e:
            self.errors.append(f"Error validating PQL: {str(e)}")
            return False
    
    def _validate_keys(self) -> None:
        _keys = hlp.extract_full_keys(self.pql)

        # Validate keys
        for key in _keys:
            if key['key'] not in hlp.KEY_WORDS:
                self.errors.append(f"Invalid key: {key['key']} at {key['path']}, valid keys are: {hlp.KEY_WORDS}")

        # Validate required keys
        for key in hlp.REQUIRED_KEYS:
            if key not in [k['key'] for k in _keys]:
                self.errors.append(f"Missing key: {key}, required keys are: {hlp.REQUIRED_KEYS}")

    def _validate_values(self) -> None:
        _keys = hlp.extract_full_keys(self.pql)

        for key in _keys:
            # Validate OPERATOR values
            if key['key'] == 'OPERATOR':
                value = hlp.get_value_from_path(self.pql, key['path'])
                if value not in hlp.OPERATORS:
                    self.errors.append(f"Invalid value: {value} at {key['path']}, valid values are: {hlp.OPERATORS}")

            # Validate COMPARISON_OPERATOR values
            if key['key'] == 'COMPARISON_OPERATOR':
                value = hlp.get_value_from_path(self.pql, key['path'])
                if value not in hlp.COMPARISON_OPERATORS:
                    self.errors.append(f"Invalid comparison operator: {value} for COMPARISON_OPERATOR at {key['path']}, valid values are: {hlp.COMPARISON_OPERATORS}")

            #  Validate COLUMN values
            if key['key'] == 'COLUMNS':
                value = hlp.get_value_from_path(self.pql, key['path'])
                if not isinstance(value, list):
                    self.errors.append(f"Invalid value: {value} for COLUMN at {key['path']}. COLUMNS should be a list")

    def _validate_top_level(self) -> None:
        _top_level_keys = list(self.pql.keys())

        # key must exist
        for req_key in hlp.TOP_LEVEL_REQUIRED_KEYS:
            if req_key not in _top_level_keys:
                self.errors.append(f"Missing key: {req_key}, required keys are: {hlp.TOP_LEVEL_REQUIRED_KEYS}")

        # key must not exist
        for key in _top_level_keys:
            if key not in hlp.TOP_LEVEL_REQUIRED_KEYS:
                self.errors.append(f"Invalid key: {key}, valid keys are: {hlp.TOP_LEVEL_REQUIRED_KEYS}")

        # value must exist and value has limited options
        for _key in _top_level_keys:
            if _key == 'NAME':
                if not isinstance(self.pql[_key], str):
                    self.errors.append(f"Invalid value: {self.pql[_key]} for {_key}, value must be a string")
                if self.pql[_key].strip() == '':
                    self.errors.append(f"Invalid value: {self.pql[_key]} for {_key}, value must not be empty")
            elif _key == 'DESCRIPTION':
                if not isinstance(self.pql[_key], str):
                    self.errors.append(f"Invalid value: {self.pql[_key]} for {_key}, value must be a string")
                if self.pql[_key].strip() == '':
                    self.errors.append(f"Invalid value: {self.pql[_key]} for {_key}, value must not be empty")
            elif _key == 'TABLE':
                if not isinstance(self.pql[_key], str):
                    self.errors.append(f"Invalid value: {self.pql[_key]} for {_key}, value must be a string")
                if self.pql[_key].strip() == '':
                    self.errors.append(f"Invalid value: {self.pql[_key]} for {_key}, value must not be empty")
            elif _key == 'VERSION':
                if not isinstance(self.pql[_key], str):
                    self.errors.append(f"Invalid value: {self.pql[_key]} for {_key}, value must be a string")
                if self.pql[_key].strip() == '':
                    self.errors.append(f"Invalid value: {self.pql[_key]} for {_key}, value must not be empty")
                if self.pql[_key] not in hlp.VALID_PQL_VERSIONS:
                    self.errors.append(f"Invalid value: {self.pql[_key]} for {_key}, valid values are: {hlp.VALID_PQL_VERSIONS}")
            elif _key == 'BLOCKS':
                if not isinstance(self.pql[_key], list):
                    self.errors.append(f"Invalid value: {self.pql[_key]} for {_key}, value must be a list")
                if not self.pql[_key]:
                    self.errors.append(f"Invalid value: {self.pql[_key]} for {_key}, value must not be empty")
            else:
                self.errors.append(f"Invalid key: {_key}")

    def _validate_extension_block(self, extension_block: dict, index: int) -> None:
        # validate value
        if not isinstance(extension_block, dict):
            self.errors.append(f"Invalid value for block at index {index}: {extension_block} for EXTENSION_BLOCK, value must be a dictionary")

        # validate value keys
        _extension_keys = list(extension_block.keys())
        for req_key in hlp.EXTENSION_BLOCK_VALUES_REQUIRED_KEYS:
            # key must exist
            if req_key not in _extension_keys:
                self.errors.append(f"Missing key for block at index {index}: {req_key}, required keys are: {hlp.EXTENSION_BLOCK_VALUES_REQUIRED_KEYS}")
            
        # key must not exist
        for key in _extension_keys:
            if key not in hlp.EXTENSION_BLOCK_VALUES_REQUIRED_KEYS:
                self.errors.append(f"Invalid key for block at index {index}: {key}, valid keys are: {hlp.EXTENSION_BLOCK_VALUES_REQUIRED_KEYS}")

        # validate value values
        for _key in _extension_keys:
            if _key == 'COLUMNS':
                if not isinstance(extension_block['COLUMNS'], list):
                    self.errors.append(f"Invalid value for block at index {index}: {extension_block['COLUMNS']} for COLUMNS, value must be a list")
                if not extension_block['COLUMNS']:
                    self.errors.append(f"Invalid value for block at index {index}: {extension_block['COLUMNS']} for COLUMNS, value must not be empty")
            elif _key == 'OPERATOR':
                if not isinstance(extension_block['OPERATOR'], str):
                    self.errors.append(f"Invalid value for block at index {index}: {extension_block['OPERATOR']} for OPERATOR, value must be a string")
                if extension_block['OPERATOR'] not in hlp.EXTENSION_BLOCK_OPERATORS:
                    self.errors.append(f"Invalid value for block at index {index}: {extension_block['OPERATOR']} for OPERATOR, valid values are: {hlp.EXTENSION_BLOCK_OPERATORS} because this is an extension block")
            elif _key == 'AS':
                if not isinstance(extension_block['AS'], str):
                    self.errors.append(f"Invalid value for block at index {index}: {extension_block['AS']} for AS, value must be a string")
                if extension_block['AS'].strip() == '':
                    self.errors.append(f"Invalid value for block at index {index}: {extension_block['AS']} for AS, value must not be empty")
            else:
                self.errors.append(f"Invalid key for block at index {index}: {_key}")

    def _validate_grouping_block(self, grouping_block: dict, index: int) -> None:
        # ---------- LEVEL 0 ----------
        # validate value
        if not isinstance(grouping_block, dict):
            self.errors.append(f"Invalid value for block at index {index}: {grouping_block} for GROUPING_BLOCK, value must be a dictionary")

        # validate value level_0 keys
        _grouping_keys = list(grouping_block.keys())
        for req_key in hlp.GROUPING_BLOCK_VALUES_REQUIRED_KEYS_LEVEL0:
            # key must exist
            if req_key not in _grouping_keys:
                self.errors.append(f"Missing key for block at index {index}: {req_key}, required keys are: {hlp.GROUPING_BLOCK_VALUES_REQUIRED_KEYS_LEVEL0}")
            
        # key must not exist
        for key in _grouping_keys:
            if key not in hlp.GROUPING_BLOCK_VALUES_REQUIRED_KEYS_LEVEL0:
                self.errors.append(f"Invalid key for block at index {index}: {key}, valid keys are: {hlp.GROUPING_BLOCK_VALUES_REQUIRED_KEYS_LEVEL0}")

        # validate value 
        for _key in _grouping_keys:
            if _key == 'GROUP_BY':
                if not isinstance(grouping_block['GROUP_BY'], str):
                    self.errors.append(f"Invalid value for block at index {index}: {grouping_block['GROUP_BY']} for GROUP_BY, value must be a string")
                if grouping_block['GROUP_BY'].strip() == '':
                    self.errors.append(f"Invalid value for block at index {index}: {grouping_block['GROUP_BY']} for GROUP_BY, value must not be empty")
            elif _key == 'GROUPING_OPERATORS':
                if not isinstance(grouping_block['GROUPING_OPERATORS'], list):
                    self.errors.append(f"Invalid value for block at index {index}: {grouping_block['GROUPING_OPERATORS']} for GROUPING_OPERATORS, value must be a list")
                if not grouping_block['GROUPING_OPERATORS']:
                    self.errors.append(f"Invalid value for block at index {index}: {grouping_block['GROUPING_OPERATORS']} for GROUPING_OPERATORS, value must not be empty")

        # ---------- LEVEL 1 ----------
        _grouping_operators = grouping_block['GROUPING_OPERATORS']
        for grp_ops_idx, grp_ops in enumerate(_grouping_operators):
            # validate value
            if not isinstance(grp_ops, dict):
                self.errors.append(f"Invalid value for block at index {index}: {grp_ops} for GROUPING_OPERATORS at index {grp_ops_idx}, value must be a dictionary")

            grp_ops_keys = list(grp_ops.keys())
            for req_key in hlp.GROUPING_BLOCK_VALUES_REQUIRED_KEYS_LEVEL1:
                # key must exist
                if req_key not in grp_ops_keys:
                    self.errors.append(f"Missing key for block at index {index} for GROUPING_OPERATORS at index {grp_ops_idx}: {req_key}, required keys are: {hlp.GROUPING_BLOCK_VALUES_REQUIRED_KEYS_LEVEL1}")
            # key must not exist
            for key in grp_ops_keys:
                if key not in hlp.GROUPING_BLOCK_VALUES_REQUIRED_KEYS_LEVEL1:
                    self.errors.append(f"Invalid key for block at index {index} for GROUPING_OPERATORS at index {grp_ops_idx}: {key}, valid keys are: {hlp.GROUPING_BLOCK_VALUES_REQUIRED_KEYS_LEVEL1}")

            # validate value values
            for _key in grp_ops_keys:
                if _key == 'COLUMNS':
                    if not isinstance(grp_ops['COLUMNS'], list):
                        self.errors.append(f"Invalid value for block at index {index} for GROUPING_OPERATORS at index {grp_ops_idx}: {grp_ops['COLUMNS']} for COLUMNS, value must be a list")
                    if not grp_ops['COLUMNS']:
                        self.errors.append(f"Invalid value for block at index {index} for GROUPING_OPERATORS at index {grp_ops_idx}: {grp_ops['COLUMNS']} for COLUMNS, value must not be empty")
                elif _key == 'OPERATOR':
                    if not isinstance(grp_ops['OPERATOR'], str):
                        self.errors.append(f"Invalid value for block at index {index} for GROUPING_OPERATORS at index {grp_ops_idx}: {grp_ops['OPERATOR']} for OPERATOR, value must be a string")
                    if grp_ops['OPERATOR'] not in hlp.ROW_OPERATORS:
                        self.errors.append(f"Invalid value for block at index {index} for GROUPING_OPERATORS at index {grp_ops_idx}: {grp_ops['OPERATOR']} for OPERATOR, valid values are: {hlp.ROW_OPERATORS} because this is a grouping block")
                elif _key == 'AS':
                    if not isinstance(grp_ops['AS'], str):
                        self.errors.append(f"Invalid value for block at index {index} for GROUPING_OPERATORS at index {grp_ops_idx}: {grp_ops['AS']} for AS, value must be a string")
                    if grp_ops['AS'].strip() == '':
                        self.errors.append(f"Invalid value for block at index {index} for GROUPING_OPERATORS at index {grp_ops_idx}: {grp_ops['AS']} for AS, value must not be empty")
                else:
                    self.errors.append(f"Invalid key for block at index {index} for GROUPING_OPERATORS at index {grp_ops_idx}: {_key}")

    def _validate_filter_block(self, filter_block: dict, index: int) -> None:
        # validate value
        if not isinstance(filter_block, dict):
            self.errors.append(f"Invalid value for block at index {index}: {filter_block} for FILTER_BLOCK, value must be a dictionary")

        # validate value keys
        _filter_keys = list(filter_block.keys())
        for req_key in hlp.FILTER_BLOCK_VALUES_REQUIRED_KEYS:
            # key must exist
            if req_key not in _filter_keys:
                self.errors.append(f"Missing key for block at index {index}: {req_key}, required keys are: {hlp.FILTER_BLOCK_VALUES_REQUIRED_KEYS}")
            
        # key must not exist
        for key in _filter_keys:
            if key not in hlp.FILTER_BLOCK_VALUES_REQUIRED_KEYS:
                self.errors.append(f"Invalid key for block at index {index}: {key}, valid keys are: {hlp.FILTER_BLOCK_VALUES_REQUIRED_KEYS}")

        # validate value 
        for _key in _filter_keys:
            if _key == 'COLUMNS':
                if not isinstance(filter_block['COLUMNS'], list):
                    self.errors.append(f"Invalid value for block at index {index}: {filter_block['COLUMNS']} for COLUMNS, value must be a list")
                if not filter_block['COLUMNS']:
                    self.errors.append(f"Invalid value for block at index {index}: {filter_block['COLUMNS']} for COLUMNS, value must not be empty")
            elif _key == 'COMPARISON_OPERATOR':
                if not isinstance(filter_block['COMPARISON_OPERATOR'], str):
                    self.errors.append(f"Invalid value for block at index {index}: {filter_block['COMPARISON_OPERATOR']} for COMPARISON_OPERATOR, value must be a string")
                if filter_block['COMPARISON_OPERATOR'] not in hlp.COMPARISON_OPERATORS:
                    self.errors.append(f"Invalid value for block at index {index}: {filter_block['COMPARISON_OPERATOR']} for COMPARISON_OPERATOR, valid values are: {hlp.COMPARISON_OPERATORS} because this is a filter block")
            elif _key == 'VALUE':
                if str(filter_block['VALUE']).strip() == '':
                    self.errors.append(f"Invalid value for block at index {index}: {filter_block['VALUE']} for AS, value can not be empty")
                # must not by collection
                if isinstance(filter_block['VALUE'], list) or isinstance(filter_block['VALUE'], dict) or isinstance(filter_block['VALUE'], tuple) or isinstance(filter_block['VALUE'], set) or isinstance(filter_block['VALUE'], range):
                    self.errors.append(f"Invalid value for block at index {index}: {filter_block['VALUE']} for VALUE, value can not be a collection")
            else:
                self.errors.append(f"Invalid key for block at index {index}: {_key}")

    def _validate_scalar_block(self, scalar_block: dict, index: int) -> None:
        # validate value
        if not isinstance(scalar_block, dict):
            self.errors.append(f"Invalid value for block at index {index}: {scalar_block} for SCALAR_BLOCK, value must be a dictionary")

        # validate value keys
        _scalar_keys = list(scalar_block.keys())
        for req_key in hlp.SCALAR_BLOCK_VALUES_REQUIRED_KEYS:
            # key must exist
            if req_key not in _scalar_keys:
                self.errors.append(f"Missing key for block at index {index}: {req_key}, required keys are: {hlp.SCALAR_BLOCK_VALUES_REQUIRED_KEYS}")
            
        # key must not exist
        for key in _scalar_keys:
            if key not in hlp.SCALAR_BLOCK_VALUES_REQUIRED_KEYS:
                self.errors.append(f"Invalid key for block at index {index}: {key}, valid keys are: {hlp.SCALAR_BLOCK_VALUES_REQUIRED_KEYS}")

        # validate value 
        for _key in _scalar_keys:
            if _key == 'COLUMNS':
                if not isinstance(scalar_block['COLUMNS'], list):
                    self.errors.append(f"Invalid value for block at index {index}: {scalar_block['COLUMNS']} for COLUMNS, value must be a list")
                if not scalar_block['COLUMNS']:
                    self.errors.append(f"Invalid value for block at index {index}: {scalar_block['COLUMNS']} for COLUMNS, value must not be empty")
            elif _key == 'OPERATOR':
                if not isinstance(scalar_block['OPERATOR'], str):
                    self.errors.append(f"Invalid value for block at index {index}: {scalar_block['OPERATOR']} for OPERATOR, value must be a string")
                if scalar_block['OPERATOR'] not in hlp.OPERATORS:
                    self.errors.append(f"Invalid value for block at index {index}: {scalar_block['OPERATOR']} for OPERATOR, valid values are: {hlp.OPERATORS}")
            elif _key == 'AS':
                if not isinstance(scalar_block['AS'], str):
                    self.errors.append(f"Invalid value for block at index {index}: {scalar_block['AS']} for AS, value must be a string")
                if scalar_block['AS'].strip() == '':
                    self.errors.append(f"Invalid value for block at index {index}: {scalar_block['AS']} for AS, value must not be empty")
            else:
                self.errors.append(f"Invalid key for block at index {index}: {_key}")

    def _validate_blocks(self) -> None:
        blocks = self.pql['BLOCKS']

        for i, block in enumerate(blocks):
            # Validate key
            block_identifier = list(block.keys())
            if len(block_identifier) > 1:
                self.errors.append(f"Block should only have one key but found multiple keys: {block_identifier}")

            if block_identifier[0] not in hlp.BLOCK_KEYS:
                self.errors.append(f"Invalid block key: {block_identifier[0]}\n Valid block keys are: {hlp.BLOCK_KEYS}")

            # Validate block values
            if block_identifier[0] == 'EXTENSION_BLOCK':
                self._validate_extension_block(block['EXTENSION_BLOCK'], index=i)
            elif block_identifier[0] == 'GROUPING_BLOCK':
                self._validate_grouping_block(block['GROUPING_BLOCK'], index=i)
            elif block_identifier[0] == 'FILTER_BLOCK':
                self._validate_filter_block(block['FILTER_BLOCK'], index=i)
            elif block_identifier[0] == 'SCALAR_BLOCK':
                self._validate_scalar_block(block['SCALAR_BLOCK'], index=i)
            else:
                self.errors.append(f"Invalid block key: {block_identifier[0]}")

            




        