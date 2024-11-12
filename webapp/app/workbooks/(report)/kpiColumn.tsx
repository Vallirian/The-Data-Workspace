import { FormulaInterface, ReportColumnInterface } from "@/interfaces/main";
import { ArcAutoFormat } from "@/services/autoFormat";

export default function KpiColumn({column, formulaValues, formulas}: {column: ReportColumnInterface, formulaValues: {[key: string]: any}, formulas: FormulaInterface[]}) {
    return(
        <>
        {!column.formula ? (
            <div>
                <p>No Formula Selected</p>
                <p>Right click to select a formula</p>
            </div>
        ) : !formulaValues[column.formula] ? (
            <p>Right click to select a formula</p>
        ) : (
            <>
                <h5 className="mb-2 font-semibold">{formulas.find((f) => f.id === column.formula)?.name}</h5>
                <p className="mb-2">{formulas.find((f) => f.id === column.formula)?.description}</p>
                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">{ArcAutoFormat(formulaValues[column.formula])}</h3>
            </>
        )}
    </>
    )
}