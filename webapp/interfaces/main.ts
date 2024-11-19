export interface UserInterface {
	uid: string;
	email: string | null;
	displayName: string | null;
}

export interface UserInfoInterface {
	inputTokenLimit: number;
	outputTokenLimit: number;
	inputTokenUtilization: number;
	outputTokenUtilization: number;
	tokenLimitExceeded: boolean;
	dataLimitMB: number;
	dataUtilizationMB: number;
}

export interface WorkbookInterface {
	id: string;
	name: string;
	createdAt: Date;
	dataTable: string;
	report: string;
}

export interface DataTableMetaInterface {
	id: string;
	name: string;
	description: string;
	dataSourceAdded: boolean;
	dataSource: "csv" | null;
	extractionStatus: "pending" | "success" | "error";
	extractionDetails: string;
	columns: DataTableColumnMetaInterface[];
}

export interface DataTableColumnMetaInterface {
	id: string;
	name: string;
	dtype: "string" | "integer" | "float" | "date";
	format: string;
	description: string;
}

export interface AnalysisChatInterface {
	id: string;
	name: string;
	updatedAt: Date;
	topic: string;
}

export interface AnalysisChatMessageInterface {
	id: string;
	formula: string;
	userId: string;
	userType: "user" | "model";
	createdAt: Date;

	text: string;
	name: string | null;
	description: string | null;

	messageType: "text" | "kpi" | "table";
}

export interface FormulaInterface {
	id: string;
	name: string;
	description: string;
	arcSql: string;
	isActive: boolean;
	isValidated: boolean;
	createdAt: Date;
	fromulaType: "kpi" | "table" | "text";
}

export interface ReportInterface {
	id: string;
	name: string;
	rows: ReportRowInterface[];
    sharedWith: string[];
}

export interface ReportRowInterface {
	rowType: "kpi" | "table";
	columns: ReportColumnInterface[];
}

export interface ReportColumnInterface {
	config: {
		chartType: "bar-chart" | "line-chart" | "table" | null;
		x: string | null;
	};
	formula: string;
}

export interface SharedReportInterface extends ReportInterface {
	name: string;
    formulas: FormulaInterface[];
    formulaValues: {
        [key: string]: any;
    };
}

export interface ErrorInterface {
	response: {
		status: number;
		data: {
			error: string;
		};
	};
}
