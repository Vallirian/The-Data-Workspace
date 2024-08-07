import pandas as pd

class VariableType:
    @staticmethod
    def is_string(data, column):
        """
        Checks if the specified column in the DataFrame is of string type.

        :param data: pandas DataFrame containing the data
        :param column: Column name to check
        :return: True if the column is of string type, False otherwise
        """
        if column not in data.columns:
            raise ValueError(f"Column '{column}' does not exist in the DataFrame.")
        return pd.api.types.is_string_dtype(data[column])

    @staticmethod
    def is_number(data, column):
        """
        Checks if the specified column in the DataFrame is of numeric type.

        :param data: pandas DataFrame containing the data
        :param column: Column name to check
        :return: True if the column is of numeric type, False otherwise
        """
        if column not in data.columns:
            raise ValueError(f"Column '{column}' does not exist in the DataFrame.")
        return pd.api.types.is_numeric_dtype(data[column])

    @staticmethod
    def is_date(data, column):
        """
        Checks if the specified column in the DataFrame is of datetime type.

        :param data: pandas DataFrame containing the data
        :param column: Column name to check
        :return: True if the column is of datetime type, False otherwise
        """
        if column not in data.columns:
            raise ValueError(f"Column '{column}' does not exist in the DataFrame.")
        return pd.api.types.is_datetime64_any_dtype(data[column])

    @staticmethod
    def is_boolean(data, column):
        """
        Checks if the specified column in the DataFrame is of boolean type.

        :param data: pandas DataFrame containing the data
        :param column: Column name to check
        :return: True if the column is of boolean type, False otherwise
        """
        if column not in data.columns:
            raise ValueError(f"Column '{column}' does not exist in the DataFrame.")
        return pd.api.types.is_bool_dtype(data[column])
    
    @staticmethod
    def to_string(data, column):
        """
        Converts the specified column in the DataFrame to string type.

        :param data: pandas DataFrame containing the data
        :param column: Column name to convert
        :return: DataFrame with the specified column converted to string type
        """
        if column not in data.columns:
            raise ValueError(f"Column '{column}' does not exist in the DataFrame.")
        data[column] = data[column].astype(str)
        return data

    @staticmethod
    def to_number(data, column):
        """
        Converts the specified column in the DataFrame to numeric type.

        :param data: pandas DataFrame containing the data
        :param column: Column name to convert
        :return: DataFrame with the specified column converted to numeric type
        """
        if column not in data.columns:
            raise ValueError(f"Column '{column}' does not exist in the DataFrame.")
        data[column] = pd.to_numeric(data[column], errors='coerce')
        return data

    @staticmethod
    def to_date(data, column):
        """
        Converts the specified column in the DataFrame to datetime type.

        :param data: pandas DataFrame containing the data
        :param column: Column name to convert
        :return: DataFrame with the specified column converted to datetime type
        """
        if column not in data.columns:
            raise ValueError(f"Column '{column}' does not exist in the DataFrame.")
        data[column] = pd.to_datetime(data[column], errors='coerce')
        return data

    @staticmethod
    def to_boolean(data, column):
        """
        Converts the specified column in the DataFrame to boolean type.

        :param data: pandas DataFrame containing the data
        :param column: Column name to convert
        :return: DataFrame with the specified column converted to boolean type
        """
        if column not in data.columns:
            raise ValueError(f"Column '{column}' does not exist in the DataFrame.")
        data[column] = data[column].astype(bool)
        return data