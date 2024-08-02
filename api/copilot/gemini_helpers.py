import os
from helpers import arc_utils as autils, arc_vars as avars, arc_sql as asql, descriptive_analytics, arc_statements as astmts

import google.generativeai as genai

# gemini chat
def enhance_analysis_user_message(message: str, tenant_id: str, current_table_name) -> str:
    base_enhacement_message = avars.ANALYSIS_COPILOT_USER_MESSAGE_ENHANCEMENT
    if current_table_name:
        base_enhacement_message += f"The current table the user is looking at has the table_name: {current_table_name}\n"
    base_enhacement_message += f"The tenant_id of the user is: {tenant_id}\n"

    final_message = base_enhacement_message + '\n' + message
    return final_message

def send_analysis_message(history: list['str'], message: str, tenant_id: str, table_name) -> str:
    genai.configure(api_key=os.environ.get("GOOGLE_AI_API_KEY"))
    # generation_config = genai.GenerationConfig(
    #     temperature=0.7
    # )
    print('table_name', table_name)
    try:
        model = genai.GenerativeModel(
            os.environ.get("GEMINI_AI_MODEL"),
            tools=[
                get_info_about_all_available_tables, 
                get_info_about_all_columns_for_table, 
                # get_data_in_table_for_all_columns, 
                # get_data_in_table_for_specific_columns, 
                get_descriptive_statistics_for_table, 
                get_total_count_of_rows_in_table, 
                get_sum_for_column_grouped_by_another_column,
                get_average_for_column_grouped_by_another_column,
                get_sum_for_column_in_table, 
                get_average_for_column_in_table, 
            ],
            system_instruction=avars.ANALYSIS_COPILOT_SYSTEM_INSTRUCTIONS,
        )
        
        gemini_chat = model.start_chat(
            history=history, 
            enable_automatic_function_calling=True
        )

        final_message = enhance_analysis_user_message(message, tenant_id, table_name)
        print('final_message', final_message)
        model_response = gemini_chat.send_message(final_message)
        print('model_response', model_response)
        return model_response.text
    except Exception as e:
        print('error', e)
        return 'Unable to resolve response'


# database
def get_info_about_all_available_tables(tenant_id: str) -> list['str']:
    # function name map: get_info_about_all_available_tables
    """
    Get a list of all available tables in the database.
    When to Use:
        Use this function when you want to see all the tables available in the database.
   

    Args:
        tenant_id (str): The tenant ID. Used to ensure data isolation.

    Returns:
        A list of all available tables in the database.
    """
    print('tenant_id in get_info_about_all_available_tables', tenant_id)
    response_data = asql.execute_raw_query(tenant=tenant_id, queries=[("SHOW TABLES;", [])])
    tables = []
    for response_data_item in response_data:
        tables += [v for k, v in response_data_item.items() if v not in avars.INTERNAL_TABLES]
    print('tables', tables)
    return tables

def get_info_about_all_columns_for_table(tenant_id: str, table_name: str) -> list['dict']:
    # function name map: get_info_about_all_columns_for_table
    """
    Get a list of column informations for a specific table.
    When to Use:
        Use this function when you want to see all the columns available in a specific table.

    Args:
        tenant_id (str): The tenant ID. Used to ensure data isolation.
        table_name (str): The name of the table.

    Returns:
        A list of column informations for the specified table. Each column information is a dictionary
        containing the following keys: id, Type, Null, Key, Default, Extra. If there is "__id" in the column name,
        that column holds the id of the related table. The realted table name is the part before the "__id".
    """
    print('table_name in get_info_about_all_columns_for_table', table_name)
    response_data = asql.execute_raw_query(tenant=tenant_id, queries=[(f"DESCRIBE `{table_name}`;", [])])
    columns = []
    for response_data_item in response_data:
        columns += [response_data_item]
    print('columns', columns)
    return columns

# def get_data_in_table_for_all_columns(tenant_id: str, table_name: str) -> list['dict']:
#     # function name map: get_data_in_table_for_all_columns
#     """
#     Get all data in a table.
#     When to Use:
#         Use this function when you want to see all the data available in a specific table.

#     Args:
#         tenant_id (str): The tenant ID. Used to ensure data isolation.
#         table_name (str): The name of the table.

#     Returns:
#         A list of dictionaries where each dictionary represents a row in the table.
#     """
#     print('table_name in get_data_in_table_for_all_columns', table_name)
#     try:
#         response_data = asql.execute_raw_query(tenant=tenant_id, queries=[(f"SELECT * FROM `{table_name}`;", [])])
#         response_data_type_converted = autils.cast_datatype_to_python(response_data)
#         print('response_data', response_data_type_converted)
#         return response_data_type_converted
#     except Exception as e:
#         return str(e)

# def get_data_in_table_for_specific_columns(tenant_id: str, table_name: str, columns: list['str']) -> list['dict']:
#     # function name map: get_data_in_table_for_specific_columns
#     """
#     Get data in a table for specific columns.
#     When to Use:
#         Use this function when you want to see data for specific columns in a specific table
    
#     Args:
#         tenant_id (str): The tenant ID. Used to ensure data isolation.
#         table_name (str): The name of the table.
#         columns (list[str]): The columns to retrieve data for.

#     Returns:
#         A list of dictionaries where each dictionary represents a row in the table. Each dictionary contains
#         only the specified columns.
#     """
#     print('table_name in get_data_in_table_for_specific_columns', table_name)
#     print('columns in get_data_in_table_for_specific_columns', columns)
#     columns_str = ', '.join(columns)
#     try:
#         response_data = asql.execute_raw_query(tenant=tenant_id, queries=[(f"SELECT {columns_str} FROM `{table_name}`;", [])])
#         response_data_type_converted = autils.cast_datatype_to_python(response_data)

#         print('response_data', response_data_type_converted)
#         return response_data_type_converted
#     except Exception as e:
#         return str(e)


# descriptive analytics
def get_descriptive_statistics_for_table(tenant_id: str, table_name: str) -> dict:
    # function name map: get_descriptive_statistics_for_table
    """
    Get descriptive statistics for a table.
    When to Use:
        Use this function when you want to see the descriptive statistics for a specific table.
        Use this function to understand the overview of fast statistics for a table for numerical columns and time columns.

    Args:
        tenant_id (str): The tenant ID. Used to ensure data isolation.
        table_name (str): The name of the table.

    Returns:
        A dictionary containing the descriptive statistics for the table.
    """
    print('table_name in get_descriptive_statistics_for_table', table_name)
    try:
        response_data = asql.execute_raw_query(tenant=tenant_id, queries=[(f"SELECT * FROM `{table_name}`;", [])])
        df = autils.get_pd_df_from_query_result(response_data)
        descriptive_statistics = descriptive_analytics.arc_describe(df)
        descriptive_statistics = autils.cast_datatype_to_python(descriptive_statistics)

        return descriptive_statistics
    except Exception as e:
        return str(e)

def get_total_count_of_rows_in_table(tenant_id: str, table_name: str) -> int:
    # function name map: get_total_count_of_rows_in_table
    """
    Get the total count of rows in a table.
    When to Use:
        Use this function when you want to see the total count of rows in a specific table

    Args:
        tenant_id (str): The tenant ID. Used to ensure data isolation.
        table_name (str): The name of the table.

    Returns:
        The total count of rows in the table.
    """
    print('table_name in get_total_count_of_rows_in_table', table_name)
    try:
        response_data = asql.execute_raw_query(tenant=tenant_id, queries=[(f"SELECT * FROM `{table_name}`;", [])])
        df = autils.get_pd_df_from_query_result(response_data)
        count = descriptive_analytics.arc_count(df)
        return count    
    except Exception as e:
        return str(e)


def get_sum_for_column_in_table(tenant_id: str, table_name: str, column_name: str) -> float:
    # function name map: get_sum_for_column_in_table
    """
    Get the sum of values in a column of a table.
    When to Use:
        Use this function when you want to see the sum of values in a specific column in a specific table.

    Args:
        tenant_id (str): The tenant ID. Used to ensure data isolation.
        table_name (str): The name of the table.
        column_name (str): The name of the column.

    Returns:
        The sum of values in the column.
    """
    print('table_name in get_sum_for_column_in_table', table_name, column_name)
    try:
        response_data = asql.execute_raw_query(tenant=tenant_id, queries=[(f"SELECT `{column_name}` FROM `{table_name}`;", [])])
        print('response_data', response_data)
        df = autils.get_pd_df_from_query_result(response_data)
        sum_value = descriptive_analytics.arc_sum(df, column_name)
        print('sum_value', sum_value)

        return sum_value
    except Exception as e:
        return str(e)

def get_average_for_column_in_table(tenant_id: str, table_name: str, column_name: str) -> float:
    # function name map: get_average_for_column_in_table
    """
    Get the average of values in a column of a table.
    When to Use:
        Use this function when you want to see the average of values in a specific column in a specific table.

    Args:
        tenant_id (str): The tenant ID. Used to ensure data isolation.
        table_name (str): The name of the table.
        column_name (str): The name of the column.

    Returns:
        The average of values in the column.
    """
    print('table_name in get_average_for_column_in_table', table_name, column_name)
    try:
        response_data = asql.execute_raw_query(tenant=tenant_id, queries=[(f"SELECT `{column_name}` FROM `{table_name}`;", [])])
        df = autils.get_pd_df_from_query_result(response_data)
        average_value = descriptive_analytics.arc_average(df, column_name)
    except Exception as e:
        return str(e)

    return average_value

def get_sum_for_column_grouped_by_another_column(tenant_id: str, table_name: str, group_by_column: str, aggregated_column: str) -> dict:
    # function name map: get_sum_for_column_grouped_by_another_column
    """
    Get the sum of values in a column of a table grouped by another column.
    When to Use:
        Use this function when you want to see the sum of values in a specific column grouped by another column.

    Args:
        tenant_id (str): The tenant ID. Used to ensure data isolation.
        table_name (str): The name of the table.
        group_by_column (str): The column to group by.
        aggregated_column (str): The column to sum.

    Returns:
        A dictionary containing the sum of values in the aggregated_column grouped by the group_by column.
    """
    print('table_name in get_sum_for_column_grouped_by_another_column', table_name, group_by_column, aggregated_column)
    try:
        response_data = asql.execute_raw_query(tenant=tenant_id, queries=[(f"SELECT `{group_by_column}`, `{aggregated_column}` FROM `{table_name}`;", [])])
        df = autils.get_pd_df_from_query_result(response_data)
        print('df', df)
        sum_grouped = descriptive_analytics.arc_group_by_sum(df, group_by_column, aggregated_column)
        print('sum_grouped', sum_grouped)

        return sum_grouped
    except Exception as e:
        return str(e)

def get_average_for_column_grouped_by_another_column(tenant_id: str, table_name: str, group_by_column: str, aggregated_column: str) -> dict:
    # function name map: get_average_for_column_grouped_by_another_column
    """
    Get the average of values in a column of a table grouped by another column.
    When to Use:
        Use this function when you want to see the average of values in a specific column grouped by another column.
    
    Args:
        tenant_id (str): The tenant ID. Used to ensure data isolation.
        table_name (str): The name of the table.
        group_by_column (str): The column to group by.
        aggregated_column (str): The column to average.

    Returns:
        A dictionary containing the average of values in the aggregated_column grouped by the group_by column.
    """
    print('table_name in get_average_for_column_grouped_by_another_column', table_name, group_by_column, aggregated_column)
    try:
        response_data = asql.execute_raw_query(tenant=tenant_id, queries=[(f"SELECT `{group_by_column}`, `{aggregated_column}` FROM `{table_name}`;", [])])
        df = autils.get_pd_df_from_query_result(response_data)
        average_grouped = descriptive_analytics.arc_group_by_average(df, group_by_column, aggregated_column)

        return average_grouped
    except Exception as e:
        return str(e)
    






def get_descriptive_analytics_for_table(
        tenant_id: str, table_name: str, filter_column: str=None, filter_value: str | float=None, filter_operator: str=None, group_by_column: str=None, arithmetic_operator: str=None, aggregated_column: str=None
    ):
    """
    Get descriptive analytics for a table.

    Args:
        tenant_id (str): The tenant ID. Used to ensure data isolation.
        table_name (str): The name of the table.
        filter_column (str) (optional): The column to filter.
        filter_value (str | float) (optional): The value to filter.
        filter_operator (str) (optional): The filter operator. Can be one of the following: "greater than", "less than", "equal to", "contains".
        group_by_column (str) (optional): The column to group by.
        arithmetic_operator (str) (optional): The arithmetic operator. Can be one of the following: "sum", "average", "count", "ratio".
        aggregated_column (str) (optional): The column to aggregate.

    Returns:
        Descriptive analytics for the selected inputs - varies based on the inputs.
    """

    # get data
    response_data = asql.execute_raw_query(tenant=tenant_id, queries=astmts.get_complete_table_query(tenant_id, table_name))
    df = autils.get_pd_df_from_query_result(response_data)

    # filter data
    if filter_column and filter_value:
        if filter_operator == 'greater than':
            df = df[df[filter_column] > filter_value]
        elif filter_operator == 'less than':
            df = df[df[filter_column] < filter_value]
        elif filter_operator == 'equal to':
            df = df[df[filter_column] == filter_value]
        elif filter_operator == 'contains':
            df = df[df[filter_column].str.contains(filter_value)]
    
    # group by
    if group_by_column:
        df = df.groupby(group_by_column)

    # arithmetic operations
    if group_by_column:
        if arithmetic_operator == 'sum':
            return df.sum()
        elif arithmetic_operator == 'average':
            return df.mean()
        elif arithmetic_operator == 'count':
            return df.size().shape[0]
        elif arithmetic_operator == 'ratio':
            return df.size() / df.size().sum()
    else:











if __name__ == '__main__':
    pass