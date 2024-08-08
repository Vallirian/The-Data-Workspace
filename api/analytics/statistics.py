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
        print('in average rate of change')
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

        if time_period not in ['day', 'week', 'month', 'day of week', 'year']:
            raise ValueError(f"Invalid time_period '{time_period}'. Valid options are 'day', 'week', 'month', 'day of week', 'year'.")
        
        print('in average rate of change', data[time_column].dt.date)

        value_map = {
            'day': data[time_column].dt.day,
            'day of week': data[time_column].dt.dayofweek,
            'week': data[time_column].dt.isocalendar().week,
            'month': data[time_column].dt.month,
            'year': data[time_column].dt.year
        }

        # Group by the selected time period and calculate the mean for each group
        grouped_data = data.groupby(value_map[time_period]).mean(numeric_only=True)

        # Calculate the percentage change for the specified number column
        rate_of_change = grouped_data[number_column].pct_change() * 100
        rate_of_change.index = rate_of_change.index.astype(str) # Convert the index to string to convert to dict later
        print('rate_of_change:', rate_of_change)

        return rate_of_change