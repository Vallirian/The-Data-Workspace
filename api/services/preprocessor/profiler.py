import uuid
import pandas as pd
import re

class Profiler:
    def __init__(self, data):
        self.data = pd.DataFrame(data)

    def profile_dtypes(self, current_db_dtypes: list['dict'] = None) -> list['dict']:
        """
        Profile the data types of the columns in the data.
        
        Returns:
        - a dictionary containing the data types of the columns
        """
        patterns = [
            {
                "name": "int_plain",
                "dtype": "int",
                "pattern": r"^[+-]?\d+$",
                "antipattern": r"^\s*([+-]?\d+)\s*$"
            },
            {
                "name": "int_parentheses",
                "dtype": "int",
                "pattern": r"^\(\s*\d+\s*\)$",
                "antipattern": r"^\(\s*(\d+)\s*\)$"
            },
            {
                "name": "int_currency",
                "dtype": "int",
                "pattern": r"^[+-]?[\$£€]\s*\d+(?:[,\s]\d{3})*$",
                "antipattern": r"^\s*([+-])?\s*[\$£€]\s*([\d,\s]+)\s*$"
            },
            {
                "name": "int_thousands",
                "dtype": "int",
                "pattern": r"^[+-]?\d{1,3}(?:[,\s]\d{3})*$",
                "antipattern": r"^\s*([+-])?\s*(\d{1,3}(?:[,\s]\d{3})*)\s*$"
            },
            {
                "name": "int_parentheses_currency",
                "dtype": "int",
                "pattern": r"^\(\s*[+-]?[\$£€]?\s*\d+(?:[,\s]\d{3})*\s*\)$",
                "antipattern": r"^\(\s*([+-])?\s*[\$£€]?\s*([\d,\s]+)\s*\)$"
            },

            {
                "name": "float_plain",
                "dtype": "float",
                "pattern": r"^[+-]?(\d+\.\d+|\.\d+)$",
                "antipattern": r"^\s*([+-]?(?:\d+\.\d+|\.\d+))\s*$"
            },
            {
                "name": "float_thousands",
                "dtype": "float",
                "pattern": r"^[+-]?\d{1,3}(?:,\d{3})+\.\d+$",
                "antipattern": r"^\s*([+-])?(\d{1,3}(?:,\d{3})+)\.(\d+)\s*$"
            },
            {
                "name": "float_currency",
                "dtype": "float",
                "pattern": r"^[+-]?[\$£€]\s*\d{1,3}(?:[,\.\s]\d{3})*(?:\.\d+)?$",
                "antipattern": r"^\s*([+-])?\s*[\$£€]\s*([\d,.\s]+)\s*$"
            },
            {
                "name": "float_parentheses",
                "dtype": "float",
                "pattern": r"^\(\s*[+-]?\d{1,3}(?:[,\.\s]\d{3})*(?:\.\d+)?\s*\)$",
                "antipattern": r"^\(\s*([+-])?\s*([\d,.\s]+)\s*\)$"
            },
            {
                "name": "float_parentheses_currency",
                "pattern": r"^\(\s*[+-]?[\$£€]\s*\d{1,3}(?:[,\s]\d{3})*(?:\.\d+)?\s*\)$",
                "antipattern": r"^\(\s*([+-])?\s*[\$£€]\s*([\d,.\s]+)\s*\)$"
            },
            {
                "name": "float_scientific",
                "dtype": "float",
                "pattern": r"^[+-]?\d+(\.\d+)?[eE][+-]?\d+$",
                "antipattern": r"^\s*([+-]?\d+(?:\.\d+)?[eE][+-]?\d+)\s*$"
            },

            {
                "name": "date_iso8601",
                "dtype": "date",
                "pattern": r"^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$",
                "antipattern": r"^\s*(\d{4})-(\d{2})-(\d{2})\s*$"
            },
            {
                "name": "date_ymd_nosep",
                "pattern": (
                    r"^(?:"
                    r"(?:[02468][048]|[13579][26])00(?:02)(?:29)"    # leap year + Feb29
                    r"|"
                    r"(?!0000)\d{4}"
                    r"(?:"
                        r"(?:0[13578]|1[02])(?:0[1-9]|[12]\d|3[01])" # months with 31 days
                        r"|"
                        r"(?:0[469]|11)(?:0[1-9]|[12]\d|30)"        # months with 30 days
                        r"|"
                        r"(?:02)(?:0[1-9]|1\d|2[0-8])"              # feb up to 28
                    r")"
                    r")$"
                ),
                "antipattern": r"^\s*(\d{4})(\d{2})(\d{2})\s*$"
            },
            {
                "name": "date_ydm_nosep",
                "dtype": "date",
                "pattern": (
                    r"^(?:"
                    r"(?:[02468][048]|[13579][26])00(?:29)(?:02)"    # leap year + 29Feb
                    r"|"
                    r"(?!0000)\d{4}"
                    r"(?:"
                        r"(?:0[1-9]|[12]\d|3[01])(?:0[13578]|1[02])" # day then month(31)
                        r"|"
                        r"(?:0[1-9]|[12]\d|30)(?:0[469]|11)"        # day(1-30) then month(30)
                        r"|"
                        r"(?:0[1-9]|1\d|2[0-8])(?:02)"              # day up to 28 then feb
                    r")"
                    r")$"
                ),
                "antipattern": r"^\s*(\d{4})(\d{2})(\d{2})\s*$"
            },
            {
                "name": "date_slash_mdy",
                "dtype": "date",
                "pattern": r"^(0[1-9]|1[0-2])[\\/](0[1-9]|[12]\d|3[01])[\\/]\d{4}$",
                "antipattern": r"^\s*((0[1-9]|1[0-2]))[\\/]((0[1-9]|[12]\d|3[01]))[\\/](\d{4})\s*$"
            },
            {
                "name": "date_slash_dmy",
                "dtype": "date",
                "pattern": r"^(0[1-9]|[12]\d|3[01])[\\/](0[1-9]|1[0-2])[\\/]\d{4}$",
                "antipattern": r"^\s*((0[1-9]|[12]\d|3[01]))[\\/]((0[1-9]|1[0-2]))[\\/](\d{4})\s*$"
            },
            {
                "name": "date_slash_ymd",
                "dtype": "date",
                "pattern": r"^\d{4}[\\/](0[1-9]|1[0-2])[\\/](0[1-9]|[12]\d|3[01])$",
                "antipattern": r"^\s*(\d{4})[\\/]((0[1-9]|1[0-2]))[\\/]((0[1-9]|[12]\d|3[01]))\s*$"
            },
            {
                "name": "date_slash_ydm",
                "dtype": "date",
                "pattern": r"^\d{4}[\\/](0[1-9]|[12]\d|3[01])[\\/](0[1-9]|1[0-2])$",
                "antipattern": r"^\s*(\d{4})[\\/]((0[1-9]|[12]\d|3[01]))[\\/]((0[1-9]|1[0-2]))\s*$"
            },
            {
                "name": "datetime_ymd_nosep",
                "dtype": "date",
                "pattern": r"^(\d{4})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])(\d{2})(\d{2})(\d{2})$",
                "antipattern": r"^\s*(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\s*$"
            },
            {
                "name": "datetime_iso8601",
                "dtype": "date",
                "pattern": r"^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:\d{2})?$",
                "antipattern": (
                    r"^\s*"
                    r"(\d{4})-(\d{2})-(\d{2})"     # YYYY-MM-DD
                    r"[T ]"
                    r"(\d{2}):(\d{2}):(\d{2})"     # hh:mm:ss
                    r"(\.\d+)?"                   # optional .fraction
                    r"(Z|[+\-]\d{2}:\d{2})?"      # optional timezone
                    r"\s*$"
                )
            },
        ]

        def match_dtypes(text: str):
            """
            Identify the data type of the text.
            """
            text = text.strip()
            for p in patterns:
                if re.match(p["pattern"], text):
                    return p

            # If no pattern matched at all, return None
            return {
                "name": "string",
                "dtype": "string",
                "pattern": None,
                "antipattern": None
            }

        columns_profile = {}
        for column in self.data.columns:
            columns_profile[column] = {elem: elem for elem in self.data[column].unique()}

            for k, v in columns_profile[column].items():
                matched_pattern = match_dtypes(v)
                columns_profile[column][k] = matched_pattern

            unique_types = set()
            all_dtypes = set()
            for col_val, col_profile in columns_profile[column].items():
                unique_types.add(col_profile['name'])
                all_dtypes.add(col_profile['dtype'])
            columns_profile[column]['unique_types'] = list(unique_types)
            columns_profile[column]['dtypes'] = list(all_dtypes)

        # create report in a standard format
        report = []
        for column, profile in columns_profile.items():
            # if there is only one unique data type and it matches the current db data type, mark as resolved
            assert column in current_db_dtypes, f"Column {column} not found in Database Data Types"

            if( len(profile['unique_types']) == 1) and (profile['dtypes'][0] ==  current_db_dtypes.get(column)):
                status = "resolved"
                description = f"Column has {len(profile['unique_types'])} unique data type{'s' if len(profile['unique_types']) > 1 else ''}: {', '.join(profile['dtypes'])}"
            else:
                status = "identified" 
                description = f"Column has {len(profile['unique_types'])} unique data type{'s' if len(profile['unique_types']) > 1 else ''}: {', '.join(profile['unique_types'])}"

            report.append({
                "id": str(uuid.uuid4()),
                "name": column,
                "profileType": "Data Type",
                "status": status,
                "description": description,
                "details": [
                    {
                        "Column Value": k,
                        "Stored As": current_db_dtypes.get(column),
                        "Identified Data Type": v['name'],
                    } for k, v in profile.items() if k not in ['unique_types', 'dtypes']
                ]
            })


        return report

