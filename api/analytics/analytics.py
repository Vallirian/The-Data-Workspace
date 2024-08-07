from analytics.data_wrangling import Filtering, Grouping
from analytics.statistics import CentralTendency, Summary, Dispersion, Position, Tabular, Time


def descriptive_analytics(data, filter:dict=None, group:dict=None, column:str=None, operation:str=None):
    """
    filter = {
        'column': 'column_name',
        'condition': '>',
        'value': 10
    },
    group = {
        'column': 'column_name',
        'aggregation': 'sum'
    },
    column = 'column_name',
    operation = 'mean'
    """
    data = data
    filter = filter
    group = group
    column = column
    operation = operation
    compute()

    def filter_data():
        if filter:
            data = Filtering.filter_by_condition(
                data, 
                column=filter['column'], 
                condition=filter['condition'], 
                value=filter['value']
            )

    def group_data():
        if group:
            data = Grouping.group_by_column(
                data, 
                column=group['column'], 
                aggregation=group['aggregation']
            )

    def compute():
        try:
            filter_data()
            group_data()

            if operation == 'mean':
                return compute_mean(column)
            elif operation == 'median':
                return compute_median(column)
            elif operation == 'mode':
                return compute_mode(column)
            elif operation == 'sum':
                return compute_sum(column)
            elif operation == 'count':
                return compute_count(column)
            elif operation == 'range':
                return compute_range(column)
            elif operation == 'frequency_distribution':
                return compute_frequency_distribution(column)
            elif operation == 'relative_frequency_distribution':
                return compute_relative_frequency_distribution(column)
            else:
                raise ValueError(f"Invalid operation '{operation}'.")
            
        except Exception as e:
            return e

    # Central Tendency Methods
    def compute_mean(column):
        return CentralTendency.mean(data, column)

    def compute_median(column):
        return CentralTendency.median(data, column)

    def compute_mode(column):
        return CentralTendency.mode(data, column)

    # Summary Methods
    def compute_sum(column):
        return Summary.sum(data, column)

    def compute_count(column):
        return Summary.count(data, column)

    # Dispersion Methods
    def compute_range(column):
        return Dispersion.range(data, column)

    # Tabular Methods
    def compute_frequency_distribution(column):
        return Tabular.frequency_distribution(data, column)

    def compute_relative_frequency_distribution(column):
        return Tabular.relative_frequency_distribution(data, column)

def proportion_analytics(data, column:str, value:str, period:str=None, operation:str=None):
    """
    column = 'column_name',
    value = 'value_name',
    period = 'day'
    """
    data = data
    column = column
    value = value
    period = period
    operation = operation
    compute()

    def compute():
        try:
            if operation == 'percentage':
                return compute_percentage()
            else:
                raise ValueError(f"Invalid operation '{operation}'.")
        except Exception as e:
            return e
        
    def compute_percentage():
        return Position.percentage(data, column, value, period)

def time_series_analytics(data, date_column:str, period:str, operation:str=None):
    data = data
    column = date_column
    period = period
    operation = operation
    compute()

    def compute():
        try:
            if operation == 'rate_of_change':
                return rate_of_change()
            else:
                raise ValueError(f"Invalid operation '{operation}'.")
        except Exception as e:
            return e

    def rate_of_change():
        return Time.rate_of_change(data, column, period)