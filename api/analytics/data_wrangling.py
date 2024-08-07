import pandas as pd

class Filtering:
    @staticmethod
    def filter_by_condition(data, column, condition, value):
        """
        Filters the DataFrame rows based on a predefined condition.

        :param data: pandas DataFrame to be filtered
        :param column: Column name on which the condition is to be applied
        :param condition: A string representing the condition to filter by
        :param value: The value to use in the condition (if applicable)
        :return: Filtered pandas DataFrame
        """
        # Ensure the column exists in the DataFrame
        if column not in data.columns:
            raise ValueError(f"Column '{column}' does not exist in the DataFrame.")
        
        # Check the data type of the column
        col_type = data[column].dtype

        # Define filtering logic based on column type and condition
        if pd.api.types.is_numeric_dtype(col_type) or pd.api.types.is_datetime64_any_dtype(col_type):
            return Filtering._filter_numeric_or_date(data, column, condition, value)
        elif pd.api.types.is_string_dtype(col_type):
            return Filtering._filter_string(data, column, condition, value)
        elif pd.api.types.is_bool_dtype(col_type):
            return Filtering._filter_boolean(data, column, condition, value)
        else:
            raise ValueError("Unsupported data type.")

    @staticmethod
    def _filter_numeric_or_date(data, column, condition, value):
        if condition == '>':
            return data[data[column] > value]
        elif condition == '>=':
            return data[data[column] >= value]
        elif condition == '<':
            return data[data[column] < value]
        elif condition == '<=':
            return data[data[column] <= value]
        elif condition == '=':
            return data[data[column] == value]
        else:
            raise ValueError("Unsupported numeric condition.")
    
    @staticmethod
    def _filter_string(data, column, condition, value):
        if condition == 'contains':
            return data[data[column].str.contains(value, na=False)]
        elif condition == 'is':
            value = value.lower()
            value = value.strip()
            return data[data[column] == value]
        else:
            raise ValueError("Unsupported string condition.")
        
    @staticmethod
    def _filter_boolean(data, column, condition, value):
        if condition == '=':
            return data[data[column] == value]
        else:
            raise ValueError("Unsupported boolean condition.")

class Grouping:
    @staticmethod
    def group_by_column(data, column, aggregation):
        """
        Groups the DataFrame rows based on the unique values in the specified column and
        performs sum, average, or count aggregation if specified.

        :param data: pandas DataFrame to be grouped
        :param column: Column name on which the grouping is to be applied
        :param aggregation: Aggregation function ('sum', 'average', 'count') to apply on the grouped data
        :return: Grouped DataFrame or aggregated DataFrame if aggregation is provided
        """
        # Ensure the column exists in the DataFrame
        if column not in data.columns:
            raise ValueError(f"Column '{column}' does not exist in the DataFrame.")
        
        # Group the data by the specified column
        grouped_data = data.groupby(column)
        
        # Apply aggregation function if provided
        if aggregation:
            if aggregation == 'sum':
                return grouped_data.sum()
            elif aggregation == 'average':
                return grouped_data.mean()
            elif aggregation == 'count':
                return grouped_data.count()
            else:
                raise ValueError("Unsupported aggregation function. Use 'sum', 'average', or 'count'.")
        else:
            return grouped_data