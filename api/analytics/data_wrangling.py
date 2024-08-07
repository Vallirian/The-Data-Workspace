import pandas as pd

class Filtering:
    @staticmethod
    def value_based(data, column, value):
        """
        Filters the DataFrame rows where the specified column matches the given value.

        :param data: pandas DataFrame to be filtered
        :param column: Column name on which the filtering is to be applied
        :param value: Value to filter by
        :return: Filtered pandas DataFrame
        """
        # Ensure the column exists in the DataFrame
        if column not in data.columns:
            raise ValueError(f"Column '{column}' does not exist in the DataFrame.")
        
        # Perform the filtering
        filtered_data = data[data[column] == value]
        
        return filtered_data

    @staticmethod
    def range_based(data, column, start, end):
        """
        Filters the DataFrame rows where the specified column values fall within the given range.

        :param data: pandas DataFrame to be filtered
        :param column: Column name on which the filtering is to be applied
        :param start: Start of the range (inclusive)
        :param end: End of the range (inclusive)
        :return: Filtered pandas DataFrame
        """
        # Ensure the column exists in the DataFrame
        if column not in data.columns:
            raise ValueError(f"Column '{column}' does not exist in the DataFrame.")
        
        # Perform the filtering
        filtered_data = data[(data[column] >= start) & (data[column] <= end)]
        
        return filtered_data

    @staticmethod
    def condition_based(data, column, condition, value=None):
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
        if pd.api.types.is_numeric_dtype(col_type):
            return Filtering._filter_numeric(data, column, condition, value)
        elif pd.api.types.is_string_dtype(col_type):
            return Filtering._filter_string(data, column, condition, value)
        elif pd.api.types.is_datetime64_any_dtype(col_type):
            return Filtering._filter_date(data, column, condition, value)
        elif pd.api.types.is_bool_dtype(col_type):
            return Filtering._filter_boolean(data, column, condition, value)
        else:
            raise ValueError("Unsupported data type.")

    @staticmethod
    def _filter_numeric(data, column, condition, value):
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
            return data[data[column] == value]
        else:
            raise ValueError("Unsupported string condition.")
    
    @staticmethod
    def _filter_date(data, column, condition, value):
        if condition == 'day':
            return data[data[column].dt.day == value]
        elif condition == 'day of week':
            return data[data[column].dt.dayofweek == value]
        elif condition == 'week':
            return data[data[column].dt.isocalendar().week == value]
        elif condition == 'month':
            return data[data[column].dt.month == value]
        elif condition == 'year':
            return data[data[column].dt.year == value]
        else:
            raise ValueError("Unsupported date condition.")
    
    @staticmethod
    def _filter_boolean(data, column, condition, value):
        if condition == '=':
            return data[data[column] == value]
        else:
            raise ValueError("Unsupported boolean condition.")

class Grouping:
    @staticmethod
    def categorical(data, column, agg_func=None):
        """
        Groups the DataFrame rows based on the unique values in the specified column and
        performs sum, average, or count aggregation if specified.

        :param data: pandas DataFrame to be grouped
        :param column: Column name on which the grouping is to be applied
        :param agg_func: Aggregation function ('sum', 'average', 'count') to apply on the grouped data
        :return: Grouped DataFrame or aggregated DataFrame if agg_func is provided
        """
        # Ensure the column exists in the DataFrame
        if column not in data.columns:
            raise ValueError(f"Column '{column}' does not exist in the DataFrame.")
        
        # Group the data by the specified column
        grouped_data = data.groupby(column)
        
        # Apply aggregation function if provided
        if agg_func:
            if agg_func == 'sum':
                return grouped_data.sum()
            elif agg_func == 'average':
                return grouped_data.mean()
            elif agg_func == 'count':
                return grouped_data.count()
            else:
                raise ValueError("Unsupported aggregation function. Use 'sum', 'average', or 'count'.")
        else:
            return grouped_data
        

    @staticmethod
    def temporal(data, column, period, agg_func=None):
        """
        Groups the DataFrame rows based on a specified temporal period and
        performs sum, average, or count aggregation if specified.

        :param data: pandas DataFrame to be grouped
        :param column: Column name (datetime type) on which the grouping is to be applied
        :param period: Temporal period to group by ('day', 'day of week', 'week', 'month', 'year')
        :param agg_func: Aggregation function ('sum', 'average', 'count') to apply on the grouped data
        :return: Grouped DataFrame or aggregated DataFrame if agg_func is provided
        """
        # Ensure the column exists in the DataFrame
        if column not in data.columns:
            raise ValueError(f"Column '{column}' does not exist in the DataFrame.")
        
        # Ensure the column is of datetime type
        if not pd.api.types.is_datetime64_any_dtype(data[column]):
            raise ValueError(f"Column '{column}' must be of datetime type.")
        
        # Group by the specified temporal period
        if period == 'day':
            grouped_data = data.groupby(data[column].dt.day)
        elif period == 'day of week':
            grouped_data = data.groupby(data[column].dt.dayofweek)
        elif period == 'week':
            grouped_data = data.groupby(data[column].dt.isocalendar().week)
        elif period == 'month':
            grouped_data = data.groupby(data[column].dt.month)
        elif period == 'year':
            grouped_data = data.groupby(data[column].dt.year)
        else:
            raise ValueError("Unsupported period. Use 'day', 'day of week', 'week', 'month', or 'year'.")
        
        # Apply aggregation function if provided
        if agg_func:
            if agg_func == 'sum':
                return grouped_data.sum()
            elif agg_func == 'average':
                return grouped_data.mean()
            elif agg_func == 'count':
                return grouped_data.count()
            else:
                raise ValueError("Unsupported aggregation function. Use 'sum', 'average', or 'count'.")
        else:
            return grouped_data
