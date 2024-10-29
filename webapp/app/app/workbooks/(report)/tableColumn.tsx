import { FormulaInterface, ReportColumnInterface } from "@/interfaces/main";
import ArcStackedBarChart from "../../sub-components/navigation/report/arcStackedBarChart";
import { ArcLineChart } from "../../sub-components/navigation/report/arcLineChart";
import ArcTable from "../../sub-components/navigation/report/arcTable";

export default function TableColumn({column, formulaValues, formulas}: {column: ReportColumnInterface, formulaValues: {[key: string]: any}, formulas: FormulaInterface[]}) {
    return(
        <>
        {!column.formula || !formulaValues[column.formula] || !column.config.x || column.config.x === "" ? (
            <>
                <div className="mb-1">Chart Type: {column.config.chartType || "Not selected"}</div>
                <div className="mb-1">Formula: {column.formula ? formulas.find((f) => f.id === column.formula)?.name : "Not selected"}</div>
                <div className="mb-1">X-Axis: {column.config.x || "Not selected"}</div>
            </>
        ) : (
            <>
                {column.config.chartType === "bar-chart" && <ArcStackedBarChart data={formulaValues[column.formula]} x={column.config.x} name={formulas.find((f) => f.id === column.formula)?.name || ""} description={formulas.find((f) => f.id === column.formula)?.description || ""} />}
                {column.config.chartType === "line-chart" && <ArcLineChart data={formulaValues[column.formula]} x={column.config.x} name={formulas.find((f) => f.id === column.formula)?.name || ""} description={formulas.find((f) => f.id === column.formula)?.description || ""} />}
                {column.config.chartType === "table" && <ArcTable data={formulaValues[column.formula]} x={column.config.x} name={formulas.find((f) => f.id === column.formula)?.name || ""} description={formulas.find((f) => f.id === column.formula)?.description || ""} />}
            </>
        )}
    </>
    )
}