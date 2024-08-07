from analytics.data_wrangling import Filtering, Grouping
from analytics.statistics import CentralTendency, Summary, Dispersion, Position, Tabular, Time

class Analysis:
    def __init__(self, data, filters:list['dict']=None, groups:list['dict']=None, computation:list['str']=None):
        """
        filters = [
            {
                "method": "value_based",
                "args": ["column_name", "condition", "value"]
            },
            {
                "method": "range_based",
                "args": ["column_name", "start", "end"]
            },
            {
                "method": "condition_based",
                "args": ["column_name", "condition", "value]
            }
        ]
        """
        self.data = data
        self.filters = filters

    def filter_data(self):
        for filter_ in self.filters:
            method = filter_['method']
            

    def group_data(self, method, *args):
        if method == 'categorical':
            return Grouping.categorical(self.data, *args)
        elif method == 'temporal':
            return Grouping.temporal(self.data, *args)
        else:
            raise ValueError("Unknown grouping method")

    # Central Tendency Methods
    def compute_mean(self, column):
        return CentralTendency.mean(self.data, column)

    def compute_median(self, column):
        return CentralTendency.median(self.data, column)

    def compute_mode(self, column):
        return CentralTendency.mode(self.data, column)

    # Summary Methods
    def compute_sum(self, column):
        return Summary.sum(self.data, column)

    def compute_count(self, column):
        return Summary.count(self.data, column)

    # Dispersion Methods
    def compute_range(self, column):
        return Dispersion.range(self.data, column)

    # Position Methods
    def compute_percentage(self, column, threshold):
        return Position.percentage(self.data, column, threshold)

    def compute_quartile(self, column):
        return Position.quartile(self.data, column)

    def compute_ratio(self, numerator, denominator):
        return Position.ratio(numerator, denominator)

    # Tabular Methods
    def compute_frequency_distribution(self, column):
        return Tabular.frequency_distribution(self.data, column)

    def compute_relative_frequency_distribution(self, column):
        return Tabular.relative_frequency_distribution(self.data, column)

    # Time Methods
    def compute_rate_of_change(self, column, time_period):
        return Time.rate_of_change(self.data, column, time_period)
