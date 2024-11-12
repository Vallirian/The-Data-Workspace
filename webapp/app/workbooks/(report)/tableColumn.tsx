import { FormulaInterface, ReportColumnInterface } from "@/interfaces/main";
import ArcStackedBarChart from "@/components/arc-components/report/arcStackedBarChart";
import { ArcLineChart } from "@/components/arc-components/report/arcLineChart";
import ArcTable from "@/components/arc-components/report/arcTable";

export default function TableColumn({ column, formulaValues, formulas }: { column: ReportColumnInterface; formulaValues: { [key: string]: any }; formulas: FormulaInterface[] }) {
	return (
		<div className="h-full w-full">
			{!column.formula || !formulaValues[column.formula] || !column.config.x || column.config.x === "" ? (
				<>
					<div className="mb-1">Chart Type: {column.config.chartType || "Not selected"}</div>
					<div className="mb-1">Formula: {column.formula ? formulas.find((f) => f.id === column.formula)?.name : "Not selected"}</div>
					<div className="mb-1">X-Axis: {column.config.x || "Not selected"}</div>
				</>
			) : (
				<div className="h-full w-full">
					<div className="w-full">
						<h5 className="mb-2 font-semibold">{formulas.find((f) => f.id === column.formula)?.name || ""}</h5>
						<p className="mb-2">{formulas.find((f) => f.id === column.formula)?.description || ""}</p>
					</div>
					<div className="h-[300px] w-full">
						{column.config.chartType === "bar-chart" && <ArcStackedBarChart data={formulaValues[column.formula]} x={column.config.x} />}
						{column.config.chartType === "line-chart" && <ArcLineChart data={formulaValues[column.formula]} x={column.config.x} />}
						{column.config.chartType === "table" && <ArcTable data={formulaValues[column.formula]} x={column.config.x} />}
					</div>
				</div>
			)}
		</div>
	);
}
