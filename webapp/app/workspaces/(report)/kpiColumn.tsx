import { FormulaInterface, ReportColumnInterface } from "@/interfaces/main";
import { ArcAutoFormat } from "@/services/autoFormat";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export default function KpiColumn({ column, formulaValues, formulas }: { column: ReportColumnInterface; formulaValues: { [key: string]: any }; formulas: FormulaInterface[] }) {
	return (
		<div className="h-full w-full">
			{!column.formula ? (
				<div>
					<p>No Formula Selected</p>
					<p>Right click to select a formula</p>
				</div>
			) : !formulaValues[column.formula] ? (
				<p>Right click to select a formula</p>
			) : (
				<HoverCard>
					<HoverCardTrigger asChild>
						<div className="w-full">
							<h5 className="mb-2 font-semibold">{formulas.find((f) => f.id === column.formula)?.name}</h5>
							<p className="mb-2 line-clamp-3">{formulas.find((f) => f.id === column.formula)?.description}</p>
							<h3 className="scroll-m-20 text-xl font-semibold tracking-tight">{ArcAutoFormat(formulaValues[column.formula])}</h3>
						</div>
					</HoverCardTrigger>
					<HoverCardContent className="w-80">
						<div className="flex justify-between space-x-4">
							<p>{formulas.find((f) => f.id === column.formula)?.description}</p>
						</div>
					</HoverCardContent>
				</HoverCard>
			)}
		</div>
	);
}
