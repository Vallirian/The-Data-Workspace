# Processly Query Language (PQL)
Version:
- v0.1.0

Change log:

- created documentation

## Overview and Philosophy of Processly Query Language (PQL)

### Section description

this section gives context to understanding the PQL’s definition, principles, and approach to problem-solving.

### Definition

Processly Query Language (PQL) is a proprietary programming language used in the Processly platform to perform database-side processing and get the processed information. The Processly platform is a platform for businesses to analyze their data with the help of Large Language Models (LLMs). In Processly platform, end users ask questions to the LLM in natural language, the LLM will return a valid PQL that the backend can execute to provide the answer to the end user.

### Why PQL

The main goal of a PQL is to serve as a translation of natural language business intelligence questions into executable query via an LLM. The following make PQL a preferred language for this.

1. PQL has a smaller scope in what it can do than other query or programming languages. This means there is a stronger definition of the language which makes the results of the LLM more reliable.
2. The unique definition of the PQL provides LLMs with a single source of knowledge for formulating response for user queries. This removes the inaccuracy that comes from the wide range of knowledge available with widely adopted languages like SQL, and the confusion created by multiple versions of such languages.

### Design Goals

PQL is a query language to gain insights from business data. And because of it’s purpose, PQL’s scope is limited to what is relevant for business users. While the language will grown and expand based on user demand, the current and latest version of PQL has the following design choices.

1. Operators chose and implemented are those that are relevant to business analysis use case only. This makes PQL a sub-set (in functionality) of larger languages like SQL.
2. While PQL supports the creation and manipulation of temporary tables, like similar to Common Table Expressions in SQL, the final output of PQL is a scalar value. This is often referred to as a KPI in business analysis.
3. To enable language flexibility, PQL does not have purely special function implementation. Instead, generic table manipulation and scalar operators should be combined to achieve desired outcomes.

### Core Principles

PQL has the following core principles which the language strictly adheres, except in special cases that require to deviate from these principles.

1. Do not Repeat Yourself: Do not have multiple operators that do virtually the same thing.

## Language Syntax and Semantics

### Section description

This section gives a detailed description of the language’s syntax and semantics.

### Syntax Overview

#### Format

PQL is written in JSON format and every PQL is a valid JSON. 

- each key in PQL JSON is a reserved keyword
- a full PQL is a valid JSON made up of sub components which are called blocks - these are also valid JSONs
- in PQL the order of blocks matters. That means, a block that comes earlier is executed first and only references to the original table or the results of a previous block are valid

Each PQL has the following format

- a required "VERSION" attribute that indicates the current version of the PQL being generated
- a required “TABLE” attribute with the name of the table that the query run on
- a required "NAME" attribute that represents the answer the PQL is providing
- a required "DESCRIPTION" attribute that describes the business logic of the query
- a required “BLOCKS” attribute with an ordered list of blocks to execute in sequence. In “BLOCKS” there are:
    - optional table blocks which can be “EXTENSION_BLOCK”, “GROUPING_BLOCK”, and “FILTER_BLOCK” to sequentially manipulate the table get a state which a scalar block can use to find the scalar value to answer the query
    - a required scalar block, which is “SCALAR_BLOCK”, to calculate a scalar value from the latest state of the table and return a scalar value to answer the query

```json
{
    "VERSION": "version of the pql - for this documentation the version is v0.1.0",
    "NAME": "name of the answer the PQL is providing - can be considered name of a KPI",
    "DESCRIPTION": "business logic description of the query",
	"TABLE": "name of the table that is used in the PQL",
	"BLOCKS": [
		{
			"__TABLE_BLOCK__": "one or more optional blocks to manipulate the original table. 
			The resulting manipulated table from each block is the only table that can be used 
			in later blocks and operators."
		},
		{
			"__SCALAR_BLOCK__": "a scalar block to get the final scalar value to answer the query."
		}
	]
}
```

#### Table Blocks

Table Blocks are sub-components of a PQL query. They can be used to extend a given table, aggregate a table by grouping, or reduce a table to relevant entries by filtering. There are three types of table blocks - extension block, grouping block, and filtering block.

##### Extension Blocks

Extension blocks create a new column from existing column in the current state of the table. When an extension block is executed, it extends the latest state of the table by adding the new column. This means, it has changed the latest state of the table. Any following blocks now have access to the new created column.

The following is the definition of extension block

```json
"EXTENSION_BLOCK": {
	"COLUMNS": 'a list of columns to operate on',
	"OPERATOR": 'an operator to create new column from the given columns',
	"AS": 'the name of the newly created column'
}
```

Example: the following is a PQL extension block to create a new column called `order_month` by extracting the month of another column `order_date`

```json
/*
This PQL translates to SQL as
SELECT *, MONTH(order_date) AS order_month FROM orders
*/
{   
    "VERSION": "v0.1.0",
    "NAME": "name of the final result",
    "DESCRIPTION": "description of the final result",
	"TABLE": "orders",
	"BLOCKS": [
		{
			"EXTENSION_BLOCK": {
				"COLUMNS": ["order_date"],
				"OPERATOR": "COLUMN_CONVERT_MONTH",
				"AS": "order_month"
			}
		}
	]
}
```

##### Grouping Block

Grouping blocks create a new column by aggregating on one column while grouping on other columns. When a grouping block is executed, it reduces the columns and rows of the latest table state so that only the grouping and aggregated columns are present in the new table. Any following tables now only have access to the new set of grouping and aggregated columns.

The following is the definition of grouping block

```json
{
	"GROUP_BY": 'the name of a column to group by',
	"GROUPING_OPERATOR": '__COLUMN_OPERATOR__'
}
```

Example: the following is a PQL grouping block to create new column called `order_value_by_city` 

```json
/*
This PQL translates to SQL as
SELECT 
	city, 
	SUM(order_value) AS order_value_by_city 
FROM 
	orders 
GROUP BY 
	city
*/
{
    "VERSION": "v0.1.0",
    "NAME": "name of the final result",
    "DESCRIPTION": "description of the final result",
	"TABLE": "orders",
	"BLOCKS": [
        {
            "GROUPING_BLOCK": {
                "GROUP_BY": "city",
                "GROUPING_OPERATORS": [
                    {
                        "COLUMNS": ["order_value"],
                        "OPERATOR": "COLUMN_SUM",
                        "AS": "order_value_by_city"
                    }
                ]
            }
        }
	]
}
```

Example: the following is a PQL grouping block to create two new column called `total_order_value_by_city` and `average_order_value_by_city`

```json
/*
This PQL translates to SQL as
SELECT 
    city,
    SUM(order_value) AS total_order_value_by_city,
    AVG(order_value) AS average_order_value_by_city
FROM 
    orders
GROUP BY 
    city;

*/
{
    "VERSION": "v0.1.0",
    "NAME": "name of the final result",
    "DESCRIPTION": "description of the final result",
	"TABLE": "orders",
	"BLOCKS": [
		{
            "GROUPING_BLOCK": {
                "GROUP_BY": "city",
                "GROUPING_OPERATORS":[
                    {
                        "COLUMNS": ["order_value"],
                        "OPERATOR": "COLUMN_SUM",
                        "AS": "total_order_value_by_city"
                    },
                    {
                        "COLUMNS": ["order_value"],
                        "OPERATOR": "COLUMN_AVERAGE",
                        "AS": "average_order_value_by_city"
                    }
                ]
            }
        }
	]
}
```

##### Filter Block

Filter blocks filter the latest table state by removing rows that do not meet the filtering criteria. When a filter block is executed, all the columns in the latest table state will be returned without the rows that do not meet the criteria. Any following tables now only have access to the rows that fulfill the filtering criteria.

The following is the definition of filer block

```json
{
	"COLUMNS": 'a list of columns to compare value agains using a comparison operator. This is the left side of the comparison',
	"COMPARISON_OPERATOR": 'a comparison operator (allowed operators are =, ≠, >, <, >=, <=, IS NULL, IS NOT NULL)',
	"VALUE": 'the value to compare to each column in COLUMNS. This is the right side of the comparison'
}
```

Example: the following is a PQL filter block to remove rows from the latest table state where order value is under 5 dollars

```json
/*
This PQL translates to SQL as
SELECT *
FROM orders 
WHERE order_value > 5
*/
{
    "VERSION": "v0.1.0",
    "NAME": "name of the final result",
    "DESCRIPTION": "description of the final result",
	"TABLE": "orders",
	"BLOCKS": [
		{
			"FILTER_BLOCK": {
				"COLUMNS": ["order_value"],
				"COMPARISON_OPERATOR": ">",
				"VALUE": 5
			}
		}
	]
}
```

If multiple columns are passed in “COLUMNS” property, then each passed column is compared against the value with the given operator and linked with “AND” logic

Example: the following is a PQL filter block to remove rows from the latest table state where both cost and price where under 10 dollars

```json
/*
This PQL translates to SQL as
SELECT *
FROM orders
WHERE (cost > 10) AND (price > 10)
*/
{
    "VERSION": "v0.1.0",
    "NAME": "name of the final result",
    "DESCRIPTION": "description of the final result",
	"TABLE": "orders",
	"BLOCKS": [
		{
			"FILTER_BLOCK": {
				"COLUMNS": ["cost", "price"],
				"COMPARISON_OPERATOR": ">",
				"VALUE": 10
			}
		}
	]
}
```

#### Scalar Block

Scalar Blocks are sub-components of a PQL query. They can be used to calculate a scalar value from the latest table state and return a scalar value to answer the query. Scalar blocks are the final blocks in a PQL which return one single value - often referred to as a Key Performance Indicator (KPI) in business case.

The following is a definition of scalar blocks

```json
{
	"COLUMNS": 'a list of column names',
	"OPERATOR": 'operator to apply on the columns provided',
	"AS": 'name of the column for the final result'
}
```

Example: the following is a scalar block in PQL to get the total order value

```json
/*
This PQL translates to SQL as
SELECT SUM(order_value) AS total_order_value FROM orders
*/
{
    "VERSION": "v0.1.0",
    "NAME": "Total Order Value",
    "DESCRIPTION": "The total value of orders. Calculated by taking the sum of the order_value column",
	"TABLE": "orders",
	"BLOCKS": [
		{
            "SCALAR_BLOCK": {
                "COLUMNS": ["order_value"],
                "OPERATOR": "COLUMN_SUM",
                "AS": "total_order_value"
            }
		}
	]
}
```

Example: the following is a scalar block in PQL to count the total number of orders placed\

```json
/*
This PQL translate into SQL as
SELECT COUNT(id) AS order_count FROM orders WHERE id IS NOT NULL
*/
{
    "VERSION": "v0.1.0",
    "NAME": "Number of Orders",
    "DESCRIPTION": "The total number of orders. Calculated by counting the id column",
	"TABLE": "orders",
	"BLOCKS": [
		{
			"COLUMNS": ["id"],
			"OPERATOR": "COLUMN_COUNT",
			"AS": "order_count"
		}
	]
}
```

### Data Types

PQL supports the following data types

1. String
    - strings are text characters similar to VARCHAR in SQL
    - strings are surrounded by double quotes
    
    Example: the following are three strings
    
    ```json
    "hello"
    "123"
    "a_verY_W31rd @ S7R1N6"
    ```
    
2. Integer
    - integers are numbers without a floating point
    
    Example: the following are three integers
    
    ```json
    1
    -12242
    631
    ```
    
3. Float
    - floats are numbers with floating point
    
    Example: the following are three floats
    
    ```json
    1.1
    0.000003
    -9853.5
    ```
    
4. Date
    - date are string representations of a date with the format “YYYY-MM-DD”
    - dates are surrounded by double quotes
    
    Example: the following are three valid dates in PQL
    
    ```json
    "2024-09-09"
    "2022-05-14"
    "1990-12-12"
    ```
    
    Example the following are three invalid dates in PQL
    
    ```json
    "September 9, 2024" // is not in “YYYY-MM-DD” format
    "Apr 14, 2022" // is not in “YYYY-MM-DD” format
    "December nine 2024" // is not in “YYYY-MM-DD” format
    ```
    
5. Null
    - null represents a missing value
    - in PQL NULL also serves as a keyword in filters
    
    Example: use of Null in filter block
    
    ```json
    /*
    This PQL translates to SQL as
    SELECT * FROM table_name WHERE name IS NOT NULL
    */
    {
    	"COLUMNS": ["name"],
    	"COMPARISON_OPERATOR": "IS NOT NULL",
    	"VALUE": ''
    }
    ```
    

### Operators

Operators are functions in PQL that take input and return an output. There are three types of operators in PQL - Row Operators, Column Operators, Column Convert Operators. Row operators take one or more columns and return the same number of rows are both columns. Columns operators take one column and return one scalar value.Column Convert Operators take one column, and return the same number of rows are the passed column with modified values.

Operators are using in context with blocks.

#### Row Operators

Row Operators take one or more columns and return the same number of rows are both columns.

They have the prefix `ROW_` . The following is the list of row operators supported in PQL.

##### ROW_SUM
- for each row, returns the sum of the given columns
- Allowed data types: INTEGER, FLOAT
    - for INTEGER input, it returns the average numerical value as INTEGER data type
    - for FLOAT input, it returns the average numerical value as FLOAT data type

```json
/*
eg: an operator to create a new column called "full_price" from two columns
This PQL translates to SQL as
SELECT *, (cost + profit) AS "full_price" FROM table_name
*/
{
    "COLUMNS": ["cost", "profit"],
    "OPERATOR": "ROW_SUM",
    "AS": "full_price"
}
```
    
##### ROW_AVERAGE
- for each row, returns the average of the given columns
- Allowed data types: INTEGER, FLOAT
    - for INTEGER input, it returns the average numerical value as FLOAT data type
    - for FLOAT input, it returns the average numerical value as FLOAT data type

```json
/*
eg: an operator to create a new column called "average_price" from three columns for different prices for a product
This PQL translates to SQL as
SELECT *, (floor_price + list_price + discounted_price)/3.0 AS "average_price" FROM table_name
*/
{
    "COLUMNS": ["floor_price", "list_price", "discounted_price"],
    "OPERATOR": "ROW_AVERAGE",
    "AS": "average_price"
}
```
    
##### ROW_MULTIPLY
- for each row, returns the product of the given columns
- Allowed data types: INTEGER, FLOAT
    - for INTEGER input, it returns the average numerical value as INTEGER data type
    - for FLOAT input, it returns the average numerical value as FLOAT data type

```json
/*
eg: an operator to create a new column called "discounted_value" from two columns
This PQL translates to SQL as
SELECT *, (full_price * discount) AS "discounted_value" FROM table_name
*/
{
    "COLUMNS": ["full_price", "discount"],
    "OPERATOR": "ROW_MULTIPLY",
    "AS": "discounted_value"
}
```
    

#### Column Operators

Column Operators take one column and return a scalar value.

They have the prefix `COLUMN_`. The following is the list of column operators supported in PQL.

##### COLUMN_COUNT
- Returns: count of non NULL rows for a given column
- Allowed data types: INTEGER, FLOAT, DATE, STRING
    - for all, it returns total count of values as INTEGER

```json
/*
eg: an operator to count the total number of non-null "first_name"
This PQL translates to SQL as
SELECT COUNT("first_name") AS "first_name_count" FROM table_name
*/
{
    "COLUMNS": ["first_name"],
    "OPERATOR": "COLUMN_COUNT",
    "AS": "first_name_count"
}
```
    
##### COLUMN_SUM
- for a column returns the sum of that column
- Allowed data types: INTEGER, FLOAT, STRING
    - for INTEGER input, it returns the average numerical value as INTEGER data type
    - for FLOAT input, it returns the average numerical value as FLOAT data type

```json
/*
eg: an operator to find the total cost from a column named "cost"
This PQL translates to SQL as
SELECT *, SUM(cost) AS "total_cost" FROM table_name
*/
{
    "COLUMNS": ["cost"],
    "OPERATOR": "COLUMN_SUM",
    "AS": "total_cost"
}
```
    
##### COLUMN_AVERAGE
- returns the average of a given column
- Allowed data types: STRING, INTEGER, FLOAT, DATE
    - for INTEGER input, it returns the average numerical value as FLOAT data type
    - for FLOAT input, it returns the average numerical value as FLOAT data type

```json
/*
eg: an operator to create a new column called "average_floor_price" from a column of prices
This PQL translates to SQL as
SELECT *, AVG(floor_price) AS "average_price" FROM table_name
*/
{
    "COLUMNS": ["floor_price"],
    "OPERATOR": "COLUMN_AVERAGE",
    "AS": "average_price"
}
```
    
##### COLUMN_MIN
- Returns: minimum value in a give column
- Allowed data types: INTEGER, FLOAT, DATE
    - for all, it returns minimum value in that given column in the same data type as the column itself

```json
/*
eg: an operator to minimum price in a "floor_price" column
This PQL translates to SQL as
SELECT MIN("floor_price") AS "floor_price_min" FROM table_name
*/
{
    "COLUMNS": ["floor_price"],
    "OPERATOR": "COLUMN_MIN",
    "AS": "floor_price_min"
}
```
    
##### COLUMN_MAX
- Returns: maximum value in a give column
- Allowed data types: INTEGER, FLOAT, DATE
    - for all, it returns maximum value in that given column in the same data type as the column itself

```json
/*
eg: an operator to minimum price in a "floor_price" column
This PQL translates to SQL as
SELECT MAX("floor_price") AS "floor_price_max" FROM table_name
*/
{
    "COLUMNS": ["floor_price"],
    "OPERATOR": "COLUMN_MAX",
    "AS": "floor_price_max"
}
```
    
##### COLUMN_MODE
- Returns: mode value in a give column which is the most frequent value
- Allowed data types: INTEGER, FLOAT, DATE, STRING
    - for all, it returns mode value in that given column in the same data type as the column itself - ignores NULL

```json
/*
eg: an operator to find the most frequent first name in "first_name" column
This PQL translates to this pandas 2.0 code in Python 
first_name_mode = df["first_name"].mode()
*/
{
    "COLUMNS": ["first_name"],
    "OPERATOR": "COLUMN_MODE",
    "AS": "first_name_mode"
}
```
    
##### COLUMN_STANDARD_DEVIATION
- Returns: standard deviation value in a give column
- Allowed data types: INTEGER, FLOAT
    - for all, it returns mode value in that given column in the same data type as the column itself - ignores NULL

```json
/*
eg: an operator to find the standard deviation of "floor_price" column
This PQL translates to this pandas 2.0 code in Python 
floor_price_stddev = df["floor_price"].std(skipna=True)
*/
{
    "COLUMNS": ["floor_price"],
    "OPERATOR": "COLUMN_STANDARD_DEVIATION",
    "AS": "floor_price_stddev"
}
```
    

#### Column Conversion Operators

Column Conversion Operators take one column and return a modified column.

They have the prefix `COLUMN_CONVERT_`. The following is the list of column conversion operators supported in PQL.

##### COLUMN_CONVERT_YEAR
- for each row, extracts and returns the year
- Allowed data types: DATE
    - for DATE input, it returns the year of that date as INTEGER data type

```json
/*
eg: an operator to create a new column called "fiscal_year" from order_date
This PQL translates to SQL as
SELECT  *, YEAR(order_date) AS "fiscal_year" FROM table_name
*/
{
    "COLUMNS": ["order_date"],
    "OPERATOR": "COLUMN_CONVERT_YEAR",
    "AS": "fiscal_year"
}
```
    
##### COLUMN_CONVERT_MONTH
- for each row, extracts and returns the month
- Allowed data types: DATE
    - for DATE input, it returns the month of that date as INTEGER data type

```json
/*
eg: an operator to create a new column called "order_month" from order_date
This PQL translates to SQL as
SELECT  *, MONTH(order_date) AS "order_month" FROM table_name
*/
{
    "COLUMNS": ["order_date"],
    "OPERATOR": "COLUMN_CONVERT_MONTH",
    "AS": "order_month"
}
```
    
##### COLUMN_CONVERT_DAY
- for each row, extracts and returns the day of the month
- Allowed data types: DATE
    - for DATE input, it returns the date on the month of that date as INTEGER data type

```json
/*
eg: an operator to create a new column called "order_day" from order_date
This PQL translates to SQL as
SELECT  *, COLUMN_CONVERT_DAY(order_date) AS "order_day" FROM table_name
*/
{
    "COLUMNS": ["order_date"],
    "OPERATOR": "COLUMN_CONVERT_DAY",
    "AS": "order_day"
}
```
    
##### COLUMN_CONVERT_FLOOR
- for each row, returns the rounded down integer value
- Allowed data types: FLOAT
    - for FLOAT input, it returns the rounded down value as INTEGER data type

```json
/*
eg: an operator to create a new column called "order_round_down" from order_value
This PQL translates to SQL as
SELECT  *, FLOOR(order_value) AS "order_round_down" FROM table_name
*/
{
    "COLUMNS": ["order_value"],
    "OPERATOR": "COLUMN_CONVERT_FLOOR",
    "AS": "order_round_down"
}
```
    
##### COLUMN_CONVERT_CEILING
- for each row, returns the rounded up integer value
- Allowed data types: FLOAT
    - for FLOAT input, it returns the rounded up value as INTEGER data type

```json
/*
eg: an operator to create a new column called "order_round_up" from order_value
This PQL translates to SQL as
SELECT  *, FLOOR(order_value) AS "order_round_up" FROM table_name
*/
{
    "COLUMNS": ["order_value"],
    "OPERATOR": "COLUMN_CONVERT_CEILING",
    "AS": "order_round_up"
}
```
    
##### COLUMN_CONVERT_ABSOLUTE
- for each row, returns the absolute value of the given column
- Allowed data types: FLOAT, INTEGER
    - for all inputs, it returns the same data type as the input

```json
/*
eg: an operator to create a new column called "change" from subscriber_change
This PQL translates to SQL as
SELECT  *, ABS(subscriber_change) AS "change" FROM table_name
*/
{
    "COLUMNS": ["subscriber_change"],
    "OPERATOR": "COLUMN_CONVERT_ABSOLUTE",
    "AS": "change"
}
```
    

## Execution

### Section description

This section gives context on how PQL is executed. 

### How is PQL executed?

PQL follows a sequential block-by-block execution strategy. 

Each PQL starts with a given table that lives in a database - this is given with the “TABLE” property of the query. This table is considered mutable and can be modified by any Table Block (“EXTENSION_BLOCK”, “GROUPING_BLOCK”, and “FILTER_BLOCK”). Each time a Table Block changes the table, the change is persisted in the following blocks unless it is modified or overwritten by a following Table Block, by where the table is mutated again. This 

#### Sequential and Block-by-Block

Each block in the “BLOCKS” property is executed one after the other. And each block can change the table the query is working with. So, if block A comes before block B, and block A adds a new column to the table, then block B can make use of the newly created column. If block A removed a column, then block B can not use that column. 

Because each Table Block changes the table, PQL uses what is called latest table state. Latest Table State reflects the table’s state after previous Table Blocks are executed. It is the table and source of truth for any following blocks.

##### Example 1: 
this example shows how we can use PQL to get the average order value for order under 100 dollars. In this PQL query, first the table “orders” is read as is. The latest table state is the “orders” table as is. Then the PQL queries in “BLOCKS” are executed one after the other, in the order they are provided. 

The “FILTER_BLOCK” that is in the first position is executed and the table state changes. Now, the latest table state is the table “orders” without any rows where the order_value is under 100. 

The “SCALAR_BLOCK” which is the next block is executed next. The “SCALAR_BOCK” averages over the latest “order_value” column and returns a scalar value.

```json
{
    "VERSION": "v0.1.0",
    "NAME": "Average Order Value Under 100",
    "DESCRIPTION": "The average order value for orders with order_value under 100.",
	"TABLE": "orders",
	"BLOCKS": [
		{
			"FILTER_BLOCK": {
				"COLUMNS": ["order_value"],
				"COMPARISON_OPERATOR": "<",
				"VALUE": 100
			}
		},
		{
			"SCALAR_BLOCK": {
				"COLUMNS": ["order_value"],
				"OPERATOR": "COLUMN_AVERAGE",
				"AS": "average_order_value"
			}
		}
	]
}
```