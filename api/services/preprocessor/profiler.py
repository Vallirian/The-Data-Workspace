import pandas as pd
import re
from datetime import date, datetime
import json

class Profiler:
    def __init__(self, data):
        self.data = pd.DataFrame(data)

    def profile_dtypes(self):
        """
        Profile the data types of the columns in the data.
        
        Returns:
        - a dictionary containing the data types of the columns
        """
        patterns = [
            {
                "name": "int_plain",
                "pattern": r"^[+-]?\d+$",
                "antipattern": r"^\s*([+-]?\d+)\s*$"
            },
            {
                "name": "int_parentheses",
                "pattern": r"^\(\s*\d+\s*\)$",
                "antipattern": r"^\(\s*(\d+)\s*\)$"
            },
            {
                "name": "int_currency",
                "pattern": r"^[+-]?[\$£€]\s*\d+(?:[,\s]\d{3})*$",
                "antipattern": r"^\s*([+-])?\s*[\$£€]\s*([\d,\s]+)\s*$"
            },
            {
                "name": "int_thousands",
                "pattern": r"^[+-]?\d{1,3}(?:[,\s]\d{3})*$",
                "antipattern": r"^\s*([+-])?\s*(\d{1,3}(?:[,\s]\d{3})*)\s*$"
            },
            {
                "name": "int_parentheses_currency",
                "pattern": r"^\(\s*[+-]?[\$£€]?\s*\d+(?:[,\s]\d{3})*\s*\)$",
                "antipattern": r"^\(\s*([+-])?\s*[\$£€]?\s*([\d,\s]+)\s*\)$"
            },

            {
                "name": "float_plain",
                "pattern": r"^[+-]?(\d+\.\d+|\.\d+)$",
                "antipattern": r"^\s*([+-]?(?:\d+\.\d+|\.\d+))\s*$"
            },
            {
                "name": "float_thousands",
                "pattern": r"^[+-]?\d{1,3}(?:,\d{3})+\.\d+$",
                "antipattern": r"^\s*([+-])?(\d{1,3}(?:,\d{3})+)\.(\d+)\s*$"
            },
            {
                "name": "float_currency",
                "pattern": r"^[+-]?[\$£€]\s*\d{1,3}(?:[,\.\s]\d{3})*(?:\.\d+)?$",
                "antipattern": r"^\s*([+-])?\s*[\$£€]\s*([\d,.\s]+)\s*$"
            },
            {
                "name": "float_parentheses",
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
                "pattern": r"^[+-]?\d+(\.\d+)?[eE][+-]?\d+$",
                "antipattern": r"^\s*([+-]?\d+(?:\.\d+)?[eE][+-]?\d+)\s*$"
            },

            {
                "name": "date_iso8601",
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
                "pattern": r"^(0[1-9]|1[0-2])[\\/](0[1-9]|[12]\d|3[01])[\\/]\d{4}$",
                "antipattern": r"^\s*((0[1-9]|1[0-2]))[\\/]((0[1-9]|[12]\d|3[01]))[\\/](\d{4})\s*$"
            },
            {
                "name": "date_slash_dmy",
                "pattern": r"^(0[1-9]|[12]\d|3[01])[\\/](0[1-9]|1[0-2])[\\/]\d{4}$",
                "antipattern": r"^\s*((0[1-9]|[12]\d|3[01]))[\\/]((0[1-9]|1[0-2]))[\\/](\d{4})\s*$"
            },
            {
                "name": "date_slash_ymd",
                "pattern": r"^\d{4}[\\/](0[1-9]|1[0-2])[\\/](0[1-9]|[12]\d|3[01])$",
                "antipattern": r"^\s*(\d{4})[\\/]((0[1-9]|1[0-2]))[\\/]((0[1-9]|[12]\d|3[01]))\s*$"
            },
            {
                "name": "date_slash_ydm",
                "pattern": r"^\d{4}[\\/](0[1-9]|[12]\d|3[01])[\\/](0[1-9]|1[0-2])$",
                "antipattern": r"^\s*(\d{4})[\\/]((0[1-9]|[12]\d|3[01]))[\\/]((0[1-9]|1[0-2]))\s*$"
            },
            {
                "name": "datetime_ymd_nosep",
                "pattern": r"^(\d{4})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])(\d{2})(\d{2})(\d{2})$",
                "antipattern": r"^\s*(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\s*$"
            },
            {
                "name": "datetime_iso8601",
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

        def extract_pure_value(text: str):
            """
            Try each (pattern, antipattern) in turn.
            Return a Python object representing the 'pure' value, or None if no match.
            """
            text = text.strip()
            for p in patterns:
                # 1) Check if the string fully matches the strict pattern:
                if re.match(p["pattern"], text):
                    # 2) Use the antipattern to capture the meaningful parts:
                    m = re.search(p["antipattern"], text)
                    if not m:
                        # Should not happen if the pattern matched, but just in case:
                        return 'string', text

                    name = p["name"]

                    # ---------------------------
                    # INTEGER-LIKE PATTERNS
                    # ---------------------------
                    if name.startswith("int_"):
                        if name == "int_plain":
                            # group(1) = signed digits
                            return 'int', int(m.group(1))

                        elif name == "int_parentheses":
                            # group(1) = digits inside parentheses => negative
                            digits = m.group(1)
                            return 'int', -int(digits)

                        elif name == "int_thousands":
                            # group(1) = optional sign, group(2) = digits with possible commas/spaces
                            sign = m.group(1)
                            raw_digits = m.group(2)
                            # Remove spaces/commas:
                            cleaned = re.sub(r"[,\s]+", "", raw_digits)
                            value = int(cleaned)
                            if sign == "-":
                                value = -value
                            return 'int', value

                        elif name == "int_currency":
                            # group(1) = optional sign, group(2) = digits (commas/spaces)
                            sign = m.group(1)
                            raw_digits = m.group(2)
                            cleaned = re.sub(r"[,\s]+", "", raw_digits)
                            value = int(cleaned)
                            if sign == "-":
                                value = -value
                            return 'int', value

                        elif name == "int_parentheses_currency":
                            # group(1) = optional sign, group(2) = digits
                            sign = m.group(1)
                            raw_digits = m.group(2)
                            cleaned = re.sub(r"[,\s]+", "", raw_digits)
                            value = int(cleaned)
                            # parentheses => negative
                            # if sign == '-' as well, it’s doubly negative, but we
                            # usually interpret parentheses alone as negative. So we do:
                            value = -value
                            return 'int', value

                    # ---------------------------
                    # FLOAT-LIKE PATTERNS
                    # ---------------------------
                    elif name.startswith("float_"):
                        if name == "float_plain":
                            # group(1) = entire decimal (e.g. 3.14, +.99, -.5)
                            return 'float', float(m.group(1))

                        elif name == "float_thousands":
                            # group(1)= sign, group(2)= integer part w/ commas, group(3)= fraction
                            sign = m.group(1)
                            int_part = re.sub(r",", "", m.group(2))
                            frac_part = m.group(3)
                            raw_num = int_part + "." + frac_part
                            value = float(raw_num)
                            if sign == "-":
                                value = -value
                            return 'float', value

                        elif name == "float_currency":
                            # group(1)= sign, group(2)= digits + optional decimal, plus possible commas
                            sign = m.group(1)
                            raw_digits = m.group(2)
                            # If there's a decimal, keep exactly one dot.
                            # But commas/spaces are thousands separators, remove them:
                            # A quick approach: remove commas/spaces, leaving only digits and maybe one dot.
                            cleaned = re.sub(r"[,\s]+", "", raw_digits)
                            value = float(cleaned)
                            if sign == "-":
                                value = -value
                            return 'float', value

                        elif name == "float_parentheses":
                            # group(1)= optional sign, group(2)= the numeric portion
                            sign = m.group(1)
                            raw_digits = m.group(2)
                            cleaned = re.sub(r"[,\s]+", "", raw_digits)
                            value = float(cleaned)
                            # parentheses => negative
                            return 'float', -value

                        elif name == "float_parentheses_currency":
                            # group(1)= optional sign, group(2)= digits
                            sign = m.group(1)
                            raw_digits = m.group(2)
                            cleaned = re.sub(r"[,\s]+", "", raw_digits)
                            value = float(cleaned)
                            # parentheses => negative
                            return 'float', -value

                        elif name == "float_scientific":
                            # group(1) = entire scientific notation
                            return 'float', float(m.group(1))

                    # ---------------------------
                    # DATE-LIKE PATTERNS
                    # ---------------------------
                    elif name.startswith("date_"):
                        # use datetime becase pandas doesn't have separate date and time types
                        # when this is written to teh db, it will be converted to a timestamp 
                        # with time for timestamp columns and with midnight for date columns

                        # For date patterns, we typically have 3 capturing groups: Year, Month, Day
                        # But note that 'date_ydm_nosep' means capturing year, day, month, etc.
                        # We'll parse them accordingly. 
                        if name == "date_iso8601":
                            # group(1)=YYYY, group(2)=MM, group(3)=DD
                            y = int(m.group(1))
                            mo = int(m.group(2))
                            d = int(m.group(3))
                            return 'datetime64[ns]', date(y, mo, d)

                        elif name == "date_ymd_nosep":
                            # group(1)=YYYY, group(2)=MM, group(3)=DD
                            y = int(m.group(1))
                            mo = int(m.group(2))
                            d = int(m.group(3))
                            return 'datetime64[ns]', date(y, mo, d)

                        elif name == "date_ydm_nosep":
                            # group(1)=YYYY, group(2)=DD, group(3)=MM
                            y = int(m.group(1))
                            d = int(m.group(2))
                            mo = int(m.group(3))
                            return 'datetime64[ns]', date(y, mo, d)

                        elif name == "date_slash_mdy":
                            # group(1)=MM, group(3)=DD, group(5)=YYYY
                            mo = int(m.group(1))
                            d = int(m.group(3))
                            y = int(m.group(5))
                            return 'datetime64[ns]', date(y, mo, d)

                        elif name == "date_slash_dmy":
                            # group(1)=DD, group(3)=MM, group(5)=YYYY
                            d = int(m.group(1))
                            mo = int(m.group(3))
                            y = int(m.group(5))
                            return 'datetime64[ns]', date(y, mo, d)

                        elif name == "date_slash_ymd":
                            # group(1)=YYYY, group(2)=MM, group(4)=DD
                            y = int(m.group(1))
                            mo = int(m.group(2))
                            d = int(m.group(4))
                            return 'datetime64[ns]', date(y, mo, d)

                        elif name == "date_slash_ydm":
                            # group(1)=YYYY, group(2)=DD, group(4)=MM
                            y = int(m.group(1))
                            d = int(m.group(2))
                            mo = int(m.group(4))
                            return 'datetime64[ns]', date(y, mo, d)

                    # ---------------------------
                    # DATETIME-LIKE PATTERNS
                    # ---------------------------
                    elif name.startswith("datetime_"):
                        # use datetime becase pandas doesn't have separate date and time types
                        # when this is written to teh db, it will be converted to a timestamp 
                        # with time for timestamp columns and with midnight for date columns
                        if name == "datetime_ymd_nosep":
                            # group(1)=YYYY, (2)=MM, (3)=DD, (4)=HH, (5)=MM, (6)=SS
                            y = int(m.group(1))
                            mo = int(m.group(2))
                            d = int(m.group(3))
                            hh = int(m.group(4))
                            mm = int(m.group(5))
                            ss = int(m.group(6))
                            return 'datetime64[ns]', datetime(y, mo, d, hh, mm, ss)

                        elif name == "datetime_iso8601":
                            # group(1)=YYYY, group(2)=MM, group(3)=DD
                            # group(4)=hh, group(5)=mm, group(6)=ss
                            # group(7)=.fraction (optional), group(8)=timezone (optional)
                            y  = int(m.group(1))
                            mo = int(m.group(2))
                            d  = int(m.group(3))
                            hh = int(m.group(4))
                            mm = int(m.group(5))
                            ss = int(m.group(6))

                            fraction_str = m.group(7)  # e.g. ".123"
                            tz_str = m.group(8)       # e.g. "Z" or "+02:00", etc.

                            microsec = 0
                            if fraction_str:
                                # remove the leading '.' and parse
                                frac_part = fraction_str[1:]
                                # convert to microseconds: e.g. ".123" => 123000 microseconds
                                # watch out for longer decimals
                                microsec = int((frac_part + "000000")[0:6])

                            # We'll ignore time zone offset for this example,
                            # or you could use dateutil, zoneinfo, etc.
                            return 'datetime64[ns]', datetime(y, mo, d, hh, mm, ss, microsec)

                    # If we reach here, we matched a pattern but haven't returned anything
                    # (e.g. an unhandled pattern).
                    return 'string', text

            # If no pattern matched at all, return None
            return 'string', text
        
        non_object_columns = list(self.data.select_dtypes(exclude=['object']).columns)
        object_columns = list(self.data.select_dtypes(include=['object']).columns)

        for column in object_columns:
            converted_map = {elem: elem for elem in try_data[column].unique()}

            for k, v in converted_map.items():
                matched_pattern = extract_pure_value(v)
                converted_map[k] = matched_pattern

            # Check the unique data types stored in the first element of each tuple in converted_map
            unique_types = {val[0] for val in converted_map.values()}

            if len(unique_types) == 1:
                for i in range(len(try_data)):
                    for col in [column]:
                        try_data.at[i, col] = converted_map[try_data.at[i, col]][1]
                # convert the column to the appropriate data type
                try_data[column] = try_data[column].astype(list(unique_types)[0])

        """
        types of match algorithms:
            [ ] first match (return the first match)
            [ ] all matches (return all matches)
        steps:
            [ ] check dtypes with pandas
            [ ] for each string columns
                [ ] check its pattern until it matches and create type profile
                [ ] if profile is not (string 1.0)
                    [ ] tell user what will happen
                    [ ] if the user allowes, remove any pattern that should not be there           
        """
