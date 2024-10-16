#  Documentation
Version:
- v0.1.0


## 1. Introduction
This document outlines the testing strategy and test cases for evaluating Processly. Processly is an AI powered data analysis tool. It generates a PQL (an SQL-like query language) to answer busiess analysis questions. The PQL is the translated into SQL in the backend and executed on the data to provide the value as the answer.

This version of the documentation is for testing PQL version v0.1.0. PQL version v0.1.0 has the following characteristincs
### Overview and Philosophy of Processly Query Language (PQL)
#### Section description

this section gives context to understanding the PQL’s definition, principles, and approach to problem-solving.

#### Definition

Processly Query Language (PQL) is a proprietary programming language used in the Processly platform to perform database-side processing and get the processed information. The Processly platform is a platform for businesses to analyze their data with the help of Large Language Models (LLMs). In Processly platform, end users ask questions to the LLM in natural language, the LLM will return a valid PQL that the backend can execute to provide the answer to the end user.

#### Why PQL

The main goal of a PQL is to serve as a translation of natural language business intelligence questions into executable query via an LLM. The following make PQL a preferred language for this.

1. PQL has a smaller scope in what it can do than other query or programming languages. This means there is a stronger definition of the language which makes the results of the LLM more reliable.
2. The unique definition of the PQL provides LLMs with a single source of knowledge for formulating response for user queries. This removes the inaccuracy that comes from the wide range of knowledge available with widely adopted languages like SQL, and the confusion created by multiple versions of such languages.

#### Design Goals

PQL is a query language to gain insights from business data. And because of it’s purpose, PQL’s scope is limited to what is relevant for business users. While the language will grow and expand based on user demand, the current and latest version of PQL has the following design choices.

1. Operators chose and implemented are those that are relevant to business analysis use case only. This makes PQL a sub-set (in functionality) of larger languages like SQL.
2. While PQL supports the creation and manipulation of temporary tables, like similar to Common Table Expressions in SQL, the final output of PQL is a scalar value. This is often referred to as a KPI in business analysis.
3. To enable language flexibility, PQL does not have purely special function implementation. Instead, generic table manipulation and scalar operators should be combined to achieve desired outcomes.

#### Core Principles

PQL has the following core principles which the language strictly adheres, except in special cases that require to deviate from these principles.

1. Do not Repeat Yourself: Do not have multiple operators that do virtually the same thing.

## 2. Testing Objectives
- Verify the app correctly understands and interprets user questions
- Ensure the app generates valid, accurate, and efficient PQL queries
- Assess the app's error handling and robustness 
- Identify any security vulnerabilities or performance issues

## 3. Testing Scope
- Question understanding and interpretation
- PQL query generation and execution
- Error handling and edge cases
- Data collection on performance (not optimized in this version yet)

## 4. Test Datasets
- Datasets cover business areas like sales, inventory, products, customers, employees
- 5 Datasets each with 1000+ rows and 5+ columns of string, integer, float, date, and null types
- Specific datasets used:TBD

## 5. Testing Approach
- Automated testing using pre-generated question sets of varying complexity levels
- Collection of performance metrics for future optimization

## 6. Test Cases

### 6.1 Question Understanding
- TC1.1: Simple questions with direct mappings to PQL concepts
  - Q: "What is the total revenue?"
  - Validates: Generates a simple SUM() aggregate on the revenue column
- TC1.2: Questions with synonyms or alternative phrasings  
  - Q: "How many sales did we have in 2022?" vs "What was the number of orders placed last year?"
  - Validates: Recognizes both as a COUNT() aggregate on the orders table with a filter on the year
- TC1.3: Questions with business-specific terminology
  - Q: "What is our YTD gross margin?"
  - Validates: Calculates (Revenue - COGS) / Revenue, filtered for the current year
- TC1.4: Ambiguous questions requiring clarification
  - Q: "What were the sales last month?"
  - Validates: Asks for clarification on which specific measure of sales (average order value, count of orders )
- TC1.5: Incomplete questions missing key information
  - Q: "What is the average?"
  - Validates: Prompts user to specify which column to calculate average for
- TC1.6: Test consistency of results across semantically equivalent phrasings
  - Q1: "What is our best selling product?" vs Q2: "Which product has generated the most revenue?"
  - Validates: Both queries return the same top product by total sales

### 6.2 PQL Validity
- TC2.1: Basic PQL queries with simple SELECT, FROM, WHERE 
  - Q: "What is the total revenue from product X?"
  - Validates: final result is as expected
- TC2.2: PQL queries with multiple conditions
  - Q: "What is the average sales per active customer this quarter?" 
  - Validates: final result is as expected
- TC2.3: PQL queries with aggregations and GROUP BY
  - Q: "What is the total revenue by product category?"
  - Validates: final result is as expected
- TC2.4: Complex PQL queries with subqueries and UNIONs
  - Q: "What percentage of our revenue comes from our top 10 customers?"
  - Validates: final result is as expected
  
### 6.3 Query Accuracy
- TC3.1: Validate JOINs and filters are applied properly
  - Q: "How many active customers placed an order over $100 last month?"
  - Validates: final result is as expected
- TC3.3: Confirm handling of edge cases
  - Q: "What is the average order value for first-time customers?"
  - Validates: final result is as expected
- TC3.4: Verify accuracy of date range calculations
  - Q: "How many new customers did we acquire last quarter?" 
  - Validates: final result is as expected


### 6.4 Error Handling
- TC4.1: Test detection of irrelevant questions
  - Q: "What is the color of the sky"
  - Validates: return invalid query - irrelevant question
- TC4.2: Test handling of multi-value results for single-value expected
    Q: "What is the average order value by customer segment?"
    Validates: return invalid query - multiple values

### 6.5 Performance Metrics
- TC5.1: Measure query execution time and resources
  - Captures: Execution time, input tokens, output tokens

## 7. Testing Tools
- Automated testing framework: custom python notebook
- Logging and monitoring for performance data collection via JSON docs