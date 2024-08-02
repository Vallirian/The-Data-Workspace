# ---------------------------------------------------------------------- #
# Provide functions for descriptive analytics to ground AI API in data
# called from AI API helper functions
# 
# functions are prefixed with 'arc_' to avoid conflict with python built-in functions
# and other libraries
# ---------------------------------------------------------------------- #

import pandas as pd

# data aggregation
def arc_describe(df: pd.DataFrame):
    """
    Generate descriptive statistics that summarize the central tendency, dispersion, and shape of a dataset's distribution, excluding NaN values.

    Args:
        df (pd.DataFrame): DataFrame to describe.

    Returns:
        list[dict]: Descriptive statistics for the DataFrame.
    """
    # all return values must be serialized to JSON
    return [df.describe().to_dict()] if not df.empty else []

def arc_count(df: pd.DataFrame):
    """
    Count the number of rows in the DataFrame.
    """
    return df.shape[0]

def arc_sum(df: pd.DataFrame, column: str):
    """
    Sum the values in the column of the DataFrame.
    """
    return df[column].sum()
    

def arc_average(df: pd.DataFrame, column: str):
    """
    Calculate the average of the values in the column of the DataFrame.
    """
    return df[column].mean()

def arc_group_by_sum(df: pd.DataFrame, group_by_column: str, aggregated_column: str):
    """
    Group the DataFrame by the group_by column and calculate the sum of the column values.
    """
    return [df.groupby(group_by_column)[aggregated_column].sum().to_dict()]

def arc_group_by_average(df: pd.DataFrame, group_by: str, column: str):
    """
    Group the DataFrame by the group_by column and calculate the average of the column values.
    """
    return [df.groupby(group_by)[column].mean().to_dict()]

def arc_group_by_count(df: pd.DataFrame, group_by: str):
    """
    Group the DataFrame by the group_by column and count the number of rows in each group.
    """
    return df.groupby(group_by).size()

# data mining
def arc_correlation(df: pd.DataFrame, column1: str, column2: str):
    """
    Calculate the correlation between two columns in the DataFrame.
    """
    return df[column1].corr(df[column2])

def arc_outliers(df: pd.DataFrame, column: str):
    """
    Identify outliers in the column of the DataFrame using the IQR method.
    """
    Q1 = df[column].quantile(0.05)
    Q3 = df[column].quantile(0.95)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    outliers = df[(df[column] < lower_bound) | (df[column] > upper_bound)]
    return outliers

