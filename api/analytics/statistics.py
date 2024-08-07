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
    def percentage(data, column, operation, value):
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
        if pd.api.types.is_numeric_dtype(col_type):
            if operation not in ['>', '>=', '<', '<=', '=']:
                raise ValueError("Unsupported operation for numeric data. Use '>', '>=', '<', '<=', '='.")
        elif pd.api.types.is_string_dtype(col_type):
            if operation not in ['contains', 'is']:
                raise ValueError("Unsupported operation for string data. Use 'contains' or 'is'.")
        elif pd.api.types.is_datetime64_any_dtype(col_type):
            if operation not in ['day', 'day of week', 'week', 'month', 'year']:
                raise ValueError("Unsupported operation for datetime data. Use 'day', 'day of week', 'week', 'month', 'year'.")
        elif pd.api.types.is_bool_dtype(col_type):
            if operation != '=':
                raise ValueError("Unsupported operation for boolean data. Use '='.")
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
            if operation == 'day':
                condition = data[column].dt.day == value
            elif operation == 'day of week':
                condition = data[column].dt.dayofweek == value
            elif operation == 'week':
                condition = data[column].dt.isocalendar().week == value
            elif operation == 'month':
                condition = data[column].dt.month == value
            elif operation == 'year':
                condition = data[column].dt.year == value
        elif pd.api.types.is_bool_dtype(col_type):
            condition = data[column] == value

        # Calculate the percentage
        total_count = len(data)
        matching_count = data[condition].count()[column]
        percentage_matching = (matching_count / total_count) * 100

        return percentage_matching

    @staticmethod
    def quartile(data, column):
        """
        Calculates the quartiles of a specified column in the DataFrame.

        :param data: pandas DataFrame containing the data
        :param column: Column name for which the quartiles are to be calculated
        :return: A dictionary with the quartile values
        """
        # Ensure the column exists in the DataFrame
        if column not in data.columns:
            raise ValueError(f"Column '{column}' does not exist in the DataFrame.")
        
        # Calculate the quartiles
        quartiles = data[column].quantile([0.25, 0.5, 0.75]).to_dict()
        quartiles['min'] = data[column].min()
        quartiles['max'] = data[column].max()
        
        return quartiles

    @staticmethod
    def ratio(data, numerator, denominator):
        """
        Calculates the ratio of the sum of two specified columns in the DataFrame.

        :param data: pandas DataFrame containing the data
        :param numerator: Column name to be used as the numerator
        :param denominator: Column name to be used as the denominator
        :return: Ratio of the sum of the numerator column to the sum of the denominator column
        """
        # Ensure the columns exist in the DataFrame
        if numerator not in data.columns:
            raise ValueError(f"Column '{numerator}' does not exist in the DataFrame.")
        if denominator not in data.columns:
            raise ValueError(f"Column '{denominator}' does not exist in the DataFrame.")
        
        # Calculate the ratio
        numerator_sum = data[numerator].sum()
        denominator_sum = data[denominator].sum()
        
        if denominator_sum == 0:
            raise ValueError("Denominator sum is zero, cannot calculate ratio.")
        
        ratio_value = numerator_sum / denominator_sum
        
        return ratio_value


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
    def rate_of_change(data, column, time_period):
        """
        Calculates the rate of change for a specified column over a given time period.

        :param data: pandas DataFrame containing the data
        :param column: Column name for which the rate of change is to be calculated
        :param time_period: Time period over which to calculate the rate of change (e.g., 'D' for daily, 'W' for weekly, 'M' for monthly)
        :return: pandas Series representing the rate of change
        """
        # Ensure the column exists in the DataFrame
        if column not in data.columns:
            raise ValueError(f"Column '{column}' does not exist in the DataFrame.")
        
        # Ensure the column is of numeric type
        if not pd.api.types.is_numeric_dtype(data[column]):
            raise ValueError(f"Column '{column}' must be of numeric type.")
        
        # Ensure the DataFrame has a datetime index
        if not pd.api.types.is_datetime64_any_dtype(data.index):
            raise ValueError("DataFrame index must be of datetime type.")
        
        # Validate the time_period parameter
        valid_time_periods = ['D', 'W', 'M', 'Q', 'A']  # Daily, Weekly, Monthly, Quarterly, Annually
        if time_period not in valid_time_periods:
            raise ValueError(f"Invalid time_period '{time_period}'. Valid options are {valid_time_periods}.")
        
        # Calculate the rate of change
        resampled_data = data[column].resample(time_period).mean()
        rate_of_change = resampled_data.pct_change() * 100
        
        return rate_of_change