import { useState } from 'react';


const ImportDataService = () => {
  const [validationMessage, setValidationMessage] = useState<string>('');

  /**
   * Validates the table name.
   * Table name must be alphanumeric, can contain underscores, and must not exceed 64 characters.
   * @param tableName Name of the table to validate.
   * @returns Object with result (boolean) and message (string).
   */
  const validateTableName = (tableName: string): { result: boolean; message: string } => {
    const tableNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/;
    if (tableName.length === 0) {
      return { result: false, message: 'Table name is required.' };
    }
    if (!tableNameRegex.test(tableName)) {
      return {
        result: false,
        message:
          'Invalid table name. It must start with a letter or underscore and contain only alphanumeric characters or underscores. It cannot exceed 64 characters.',
      };
    }
    return { result: true, message: 'Table name is valid.' };
  };

  /**
   * Validates the column names.
   * Each column name must be alphanumeric, can contain underscores, and must not exceed 64 characters.
   * The number of columns must not exceed 50.
   * @param columnNames Array of column names to validate.
   * @returns Object with result (boolean) and message (string).
   */
  const validateColumnNames = (columnNames: string[]): { result: boolean; message: string } => {
    const columnNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/;
    if (columnNames.length > 50) {
      return { result: false, message: 'Column limit exceeded. No more than 50 columns are allowed.' };
    }

    for (const columnName of columnNames) {
      if (!columnNameRegex.test(columnName)) {
        return {
          result: false,
          message: `Invalid column name: '${columnName}'. It must start with a letter or underscore and contain only alphanumeric characters or underscores. It cannot exceed 64 characters.`,
        };
      }
    }

    return { result: true, message: 'All column names are valid.' };
  };

  /**
   * Validates the data types for a sample of data.
   * @param data Sample data to validate.
   * @param selectedDataTypes Array of selected data types for the columns.
   * @param sampleSize Number of rows to sample (e.g., 500).
   * @returns Object with result (boolean) and message (string).
   */
  const validateDataTypes = (data: {[key: string]: any}[], selectedDataTypes: string[], sampleSize: number = 500): { result: boolean; message: string } => {
    const limitedData = data.slice(0, sampleSize);

    for (const row of limitedData) {
      for (let i = 0; i < row.length; i++) {
        const value = row[i];
        const expectedType = selectedDataTypes[i];

        if (!validateDataType(value, expectedType)) {
          return {
            result: false,
            message: `Data type mismatch for column ${i + 1}. Expected '${expectedType}', but received value '${value}'.`,
          };
        }
      }
    }

    return { result: true, message: 'Data types are valid for the sample of 500 rows.' };
  };

  /**
   * Checks if the value matches the expected data type.
   * @param value The value to validate.
   * @param expectedType The expected data type (e.g., 'string', 'integer', etc.).
   * @returns Boolean indicating whether the value matches the expected type.
   */
  const validateDataType = (value: any, expectedType: string): boolean => {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'integer':
        return Number.isInteger(+value); // Check if value can be parsed as an integer
      case 'float':
        return !isNaN(value) && parseFloat(value) === +value; // Check if value is a valid float
      case 'date':
        const date = new Date(value);
        return !isNaN(date.getTime()); // Check if value can be parsed as a valid date
      default:
        return false;
    }
  };

  return {
    validateTableName,
    validateColumnNames,
    validateDataTypes,
    validationMessage,
    setValidationMessage,
  };
};

export default ImportDataService;
