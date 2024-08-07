import pandas as pd

class CentralTendency:
    @staticmethod
    def mean(data, column):
        """
        Calculates the mean of a specified column in the DataFrame.

        :param data: pandas DataFrame containing the data
        :param column: Column name for which the mean is to be calculated
        :return: Mean value of the specified column
        """
        # Ensure the column exists in the DataFrame
        if column not in data.columns:
            raise ValueError(f"Column '{column}' does not exist in the DataFrame.")
        
        # Calculate and return the mean
        return data[column].mean()

    @staticmethod
    def median(data, column):
        """
        Calculates the median of a specified column in the DataFrame.

        :param data: pandas DataFrame containing the data
        :param column: Column name for which the median is to be calculated
        :return: Median value of the specified column
        """
        # Ensure the column exists in the DataFrame
        if column not in data.columns:
            raise ValueError(f"Column '{column}' does not exist in the DataFrame.")
        
        # Calculate and return the median
        return data[column].median()

    @staticmethod
    def mode(data, column):
        """
        Calculates the mode of a specified column in the DataFrame.

        :param data: pandas DataFrame containing the data
        :param column: Column name for which the mode is to be calculated
        :return: Mode value(s) of the specified column
        """
        # Ensure the column exists in the DataFrame
        if column not in data.columns:
            raise ValueError(f"Column '{column}' does not exist in the DataFrame.")
        
        # Calculate and return the mode
        return data[column].mode()


class Summary:
    @staticmethod
    def sum(data, column):
        """
        Calculates the sum of a specified column in the DataFrame.

        :param data: pandas DataFrame containing the data
        :param column: Column name for which the sum is to be calculated
        :return: Sum value of the specified column
        """
        # Ensure the column exists in the DataFrame
        if column not in data.columns:
            raise ValueError(f"Column '{column}' does not exist in the DataFrame.")
        
        # Calculate and return the sum
        return data[column].sum()

    @staticmethod
    def count(data, column):
        """
        Calculates the count of non-NA/null values of a specified column in the DataFrame.

        :param data: pandas DataFrame containing the data
        :param column: Column name for which the count is to be calculated
        :return: Count value of the specified column
        """
        # Ensure the column exists in the DataFrame
        if column not in data.columns:
            raise ValueError(f"Column '{column}' does not exist in the DataFrame.")
        
        # Calculate and return the count
        return data[column].count()


class Dispersion:
    @staticmethod
    def range(data, column):
        """
        Calculates the range (difference between max and min) of a specified column in the DataFrame.

        :param data: pandas DataFrame containing the data
        :param column: Column name for which the range is to be calculated
        :return: Range value of the specified column
        """
        # Ensure the column exists in the DataFrame
        if column not in data.columns:
            raise ValueError(f"Column '{column}' does not exist in the DataFrame.")
        
        # Calculate the range
        min_value = data[column].min()
        max_value = data[column].max()
        range_value = max_value - min_value
        
        return range_value


class Position:
    @staticmethod
    def percentage(data, column, operation, value, period):
        """
        Calculates the percentage of values in the specified column that meet a certain condition.

        :param data: pandas DataFrame containing the data
        :param column: Column name for which the percentage is to be calculated
        :param operation: Operation to apply ('>', '>=', '<', '<=', '=', 'contains', 'is')
        :param value: Value to compare against or check for containment
        :return: Percentage of values that meet the condition
        """
        # Ensure the column exists in the DataFrame
        if column not in data.columns:
            raise ValueError(f"Column '{column}' does not exist in the DataFrame.")
        
        # Determine the data type of the column
        col_type = data[column].dtype
        
        # Check if the column type and operation are supported
        if pd.api.types.is_numeric_dtype(col_type) or pd.api.types.is_datetime64_any_dtype(col_type):
            if operation not in ['>', '>=', '<', '<=', '=']:
                raise ValueError("Unsupported operation for numeric data. Use '>', '>=', '<', '<=', '='.")
        elif pd.api.types.is_string_dtype(col_type):
            if operation not in ['contains', 'is']:
                raise ValueError("Unsupported operation for string data. Use 'contains' or 'is'.")
        elif pd.api.types.is_bool_dtype(col_type):
            if operation != '=':
                raise ValueError("Unsupported operation for boolean data. Use '='.")
        elif pd.api.types.is_datetime64_any_dtype(col_type):
            if period not in ['day', 'day of week', 'week', 'month', 'year']:
                raise ValueError("Unsupported period for datetime data. Use 'day', 'day of week', 'week', 'month', 'year'.")
        else:
            raise ValueError("Unsupported data type.")

        # Apply the condition based on the column type and operation
        if pd.api.types.is_numeric_dtype(col_type):
            if operation == '>':
                condition = data[column] > value
            elif operation == '>=':
                condition = data[column] >= value
            elif operation == '<':
                condition = data[column] < value
            elif operation == '<=':
                condition = data[column] <= value
            elif operation == '=':
                condition = data[column] == value
        elif pd.api.types.is_string_dtype(col_type):
            if operation == 'contains':
                condition = data[column].str.contains(value, na=False)
            elif operation == 'is':
                condition = data[column] == value
        elif pd.api.types.is_datetime64_any_dtype(col_type):
            value_map = {
                'day': data[column].dt.day,
                'day of week': data[column].dt.dayofweek,
                'week': data[column].dt.week,
                'month': data[column].dt.month,
                'year': data[column].dt.year
            }
            if operation == '>':
                condition = value_map[period] > value
            elif operation == '>=':
                condition = value_map[period] >= value
            elif operation == '<':
                condition = value_map[period] < value
            elif operation == '<=':
                condition = value_map[period] <= value
            elif operation == '=':
                condition = value_map[period] == value
            
        elif pd.api.types.is_bool_dtype(col_type):
            condition = data[column] == value

        # Calculate the percentage
        total_count = len(data)
        matching_count = data[condition].count()[column]
        percentage_matching = (matching_count / total_count) * 100

        return percentage_matching

class Tabular:
    @staticmethod
    def frequency_distribution(data, column):
        """
        Calculates the frequency distribution of a specified column in the DataFrame.

        :param data: pandas DataFrame containing the data
        :param column: Column name for which the frequency distribution is to be calculated
        :return: A pandas Series representing the frequency distribution
        """
        # Ensure the column exists in the DataFrame
        if column not in data.columns:
            raise ValueError(f"Column '{column}' does not exist in the DataFrame.")
        
        # Calculate and return the frequency distribution
        return data[column].value_counts()

    @staticmethod
    def relative_frequency_distribution(data, column):
        """
        Calculates the relative frequency distribution of a specified column in the DataFrame.

        :param data: pandas DataFrame containing the data
        :param column: Column name for which the relative frequency distribution is to be calculated
        :return: A pandas Series representing the relative frequency distribution
        """
        # Ensure the column exists in the DataFrame
        if column not in data.columns:
            raise ValueError(f"Column '{column}' does not exist in the DataFrame.")
        
        # Calculate and return the relative frequency distribution
        return data[column].value_counts(normalize=True) * 100


class Time:
    @staticmethod
    def average_rate_of_change(data, number_column, time_column, time_period):
        """
        Calculates the rate of change for a specified column over a given time period.

        :param data: pandas DataFrame containing the data
        :param column: Column name for which the rate of change is to be calculated
        :param time_period: Time period over which to calculate the rate of change (e.g., 'D' for daily, 'W' for weekly, 'M' for monthly)
        :return: pandas Series representing the rate of change
        """
        # Ensure the column exists in the DataFrame
        if number_column not in data.columns:
            raise ValueError(f"Column '{number_column}' does not exist in the DataFrame.")
        
        # Ensure the column is of numeric type
        if not pd.api.types.is_numeric_dtype(data[number_column]):
            raise ValueError(f"Column '{number_column}' must be of numeric type.")
        
        if time_column not in data.columns:
            raise ValueError(f"Column '{time_column}' does not exist in the DataFrame.")
        
        if not pd.api.types.is_datetime64_any_dtype(data[time_column]):
            raise ValueError(f"Column '{time_column}' must be of datetime type.")
        
        # Ensure the DataFrame has a datetime index
        if not pd.api.types.is_datetime64_any_dtype(data.index):
            raise ValueError("DataFrame index must be of datetime type.")

        if time_period not in ['day', 'week', 'month', 'day of week', 'year']:
            raise ValueError(f"Invalid time_period '{time_period}'. Valid options are 'day', 'week', 'month', 'day of week', 'year'.")
        
        value_map = {
            'day': data[time_column].dt.day,
            'day of week': data[time_column].dt.dayofweek,
            'week': data[time_column].dt.week,
            'month': data[time_column].dt.month,
            'year': data[time_column].dt.year
        }

        data = data.groupby(value_map[time_period]).mean()
        rate_of_change = data[number_column].pct_change() * 100
        
        return rate_of_change