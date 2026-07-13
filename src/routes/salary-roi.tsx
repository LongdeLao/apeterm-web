import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Calculator, Euro, GraduationCap, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/salary-roi")({
  component: SalaryRoi,
});

type Scenario = "Worst" | "Average" | "Best";
type ProgramKey = "tum" | "hku";

const milestones = [1, 5, 10, 20] as const;

const programs: Record<
  ProgramKey,
  {
    name: string;
    shortName: string;
    color: string;
    mutedColor: string;
    defaultCost: number;
    salaries: Record<Scenario, Record<(typeof milestones)[number], number>>;
  }
> = {
  tum: {
    name: "TUM Computer Science",
    shortName: "TUM CS",
    color: "#0f766e",
    mutedColor: "#99f6e4",
    defaultCost: 80000,
    salaries: {
      Worst: { 1: 28000, 5: 33000, 10: 38000, 20: 41000 },
      Average: { 1: 35000, 5: 42000, 10: 48000, 20: 60000 },
      Best: { 1: 70000, 5: 100000, 10: 155000, 20: 180000 },
    },
  },
  hku: {
    name: "HKU Quantitative Finance",
    shortName: "HKU QFin",
    color: "#7c3aed",
    mutedColor: "#ddd6fe",
    defaultCost: 250000,
    salaries: {
      Worst: { 1: 35000, 5: 45000, 10: 55000, 20: 65000 },
      Average: { 1: 60000, 5: 95000, 10: 145000, 20: 225000 },
      Best: { 1: 100000, 5: 200000, 10: 375000, 20: 1100000 },
    },
  },
};

function SalaryRoi() {
  const [scenario, setScenario] = useState<Scenario>("Average");
  const [tumCost, setTumCost] = useState(programs.tum.defaultCost);
  const [hkuCost, setHkuCost] = useState(programs.hku.defaultCost);
  const [monthlyInvestment, setMonthlyInvestment] = useState(500);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [performanceDrag, setPerformanceDrag] = useState(0.4);

  const model = useMemo(() => {
    const costs = { tum: tumCost, hku: hkuCost };
    const netAnnualReturn = Math.max(annualReturn - performanceDrag, -99);
    const rows = Array.from({ length: 20 }, (_, index) => {
      const year = index + 1;
      const investmentValue = futureValueMonthly(monthlyInvestment, netAnnualReturn, year);
      const tumSalary = salaryAtYear("tum", scenario, year);
      const hkuSalary = salaryAtYear("hku", scenario, year);
      const tumCumulative = cumulativeSalary("tum", scenario, year);
      const hkuCumulative = cumulativeSalary("hku", scenario, year);

      return {
        year,
        investmentValue,
        tumSalary,
        hkuSalary,
        tumRoi: tumCumulative - costs.tum,
        hkuRoi: hkuCumulative - costs.hku,
        tumWithInvestments: tumCumulative - costs.tum + investmentValue,
        hkuWithInvestments: hkuCumulative - costs.hku + investmentValue,
      };
    });

    return {
      netAnnualReturn,
      rows,
      milestoneRows: milestones.map((year) => {
        const row = rows[year - 1];
        return {
          year,
          tum: row.tumRoi,
          hku: row.hkuRoi,
          delta: row.hkuRoi - row.tumRoi,
          tumTotal: row.tumWithInvestments,
          hkuTotal: row.hkuWithInvestments,
        };
      }),
      breakEven: {
        tum: rows.find((row) => row.tumRoi >= 0)?.year,
        hku: rows.find((row) => row.hkuRoi >= 0)?.year,
      },
    };
  }, [annualReturn, hkuCost, monthlyInvestment, performanceDrag, scenario, tumCost]);

  const year20 = model.rows[19];

  return (
    <main className="min-h-screen bg-[#f7f8f3] text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600">
                <Calculator className="h-4 w-4" />
                Salary and ROI model
              </div>
              <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
                TUM CS vs HKU QFin salary progression
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Compare milestone salaries, cumulative gross earnings after degree cost, and
                optional MSCI World monthly investing assumptions.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric icon={Euro} label="TUM cost" value={formatEuro(tumCost)} />
              <Metric icon={Euro} label="HKU cost" value={formatEuro(hkuCost)} />
              <Metric icon={TrendingUp} label="Net return" value={`${model.netAnnualReturn.toFixed(1)}%`} />
              <Metric icon={GraduationCap} label="Scenario" value={scenario} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[320px_1fr] lg:px-8">
        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Assumptions</h2>
          <div className="mt-5 space-y-6">
            <div>
              <LabelRow label="Salary case" value={scenario} />
              <div className="grid grid-cols-3 gap-2">
                {(["Worst", "Average", "Best"] as Scenario[]).map((item) => (
                  <button
                    key={item}
                    onClick={() => setScenario(item)}
                    className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                      scenario === item
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <SliderField
              label="TUM total cost"
              value={tumCost}
              min={0}
              max={200000}
              step={5000}
              format={formatEuro}
              onChange={setTumCost}
            />
            <SliderField
              label="HKU total cost"
              value={hkuCost}
              min={0}
              max={400000}
              step={5000}
              format={formatEuro}
              onChange={setHkuCost}
            />
            <SliderField
              label="Monthly MSCI World"
              value={monthlyInvestment}
              min={0}
              max={5000}
              step={50}
              format={formatEuro}
              onChange={setMonthlyInvestment}
            />
            <SliderField
              label="Annual return"
              value={annualReturn}
              min={-5}
              max={12}
              step={0.1}
              format={(value) => `${value.toFixed(1)}%`}
              onChange={setAnnualReturn}
            />
            <SliderField
              label="Performance drag"
              value={performanceDrag}
              min={0}
              max={3}
              step={0.1}
              format={(value) => `${value.toFixed(1)}%`}
              onChange={setPerformanceDrag}
            />
          </div>
        </aside>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard
              title="20Y TUM net"
              value={formatEuro(year20.tumWithInvestments)}
              caption={`Break-even: ${model.breakEven.tum ? `year ${model.breakEven.tum}` : "after 20Y"}`}
            />
            <SummaryCard
              title="20Y HKU net"
              value={formatEuro(year20.hkuWithInvestments)}
              caption={`Break-even: ${model.breakEven.hku ? `year ${model.breakEven.hku}` : "after 20Y"}`}
            />
            <SummaryCard
              title="HKU vs TUM gap"
              value={formatEuro(year20.hkuWithInvestments - year20.tumWithInvestments)}
              caption="At year 20, same investing input"
            />
          </div>

          <ChartPanel title="Annual salary progression">
            <ResponsiveContainer width="100%" height={330}>
              <LineChart data={model.rows} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis dataKey="year" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={compactEuro} width={70} />
                <Tooltip formatter={(value) => formatEuro(Number(value))} labelFormatter={(year) => `Year ${year}`} />
                <Legend />
                <Line type="monotone" dataKey="tumSalary" name="TUM CS" stroke={programs.tum.color} strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="hkuSalary" name="HKU QFin" stroke={programs.hku.color} strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartPanel>

          <ChartPanel title="Cumulative ROI after degree cost">
            <ResponsiveContainer width="100%" height={330}>
              <AreaChart data={model.rows} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
                <defs>
                  <linearGradient id="tumFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor={programs.tum.color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={programs.tum.color} stopOpacity={0.03} />
                  </linearGradient>
                  <linearGradient id="hkuFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor={programs.hku.color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={programs.hku.color} stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis dataKey="year" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={compactEuro} width={70} />
                <Tooltip formatter={(value) => formatEuro(Number(value))} labelFormatter={(year) => `Year ${year}`} />
                <Legend />
                <Area type="monotone" dataKey="tumRoi" name="TUM ROI" stroke={programs.tum.color} fill="url(#tumFill)" strokeWidth={3} />
                <Area type="monotone" dataKey="hkuRoi" name="HKU ROI" stroke={programs.hku.color} fill="url(#hkuFill)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartPanel>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold">ROI table</h2>
              <p className="mt-1 text-sm text-slate-500">
                Cumulative gross salary minus program cost. Total includes MSCI World investment value.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-5 py-3 font-medium">Horizon</th>
                    <th className="px-5 py-3 font-medium">TUM ROI</th>
                    <th className="px-5 py-3 font-medium">HKU ROI</th>
                    <th className="px-5 py-3 font-medium">HKU advantage</th>
                    <th className="px-5 py-3 font-medium">TUM total</th>
                    <th className="px-5 py-3 font-medium">HKU total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {model.milestoneRows.map((row) => (
                    <tr key={row.year}>
                      <td className="px-5 py-4 font-medium">{row.year} Year{row.year > 1 ? "s" : ""}</td>
                      <td className="px-5 py-4">{formatEuro(row.tum)}</td>
                      <td className="px-5 py-4">{formatEuro(row.hku)}</td>
                      <td className={`px-5 py-4 font-medium ${row.delta >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        {formatEuro(row.delta)}
                      </td>
                      <td className="px-5 py-4">{formatEuro(row.tumTotal)}</td>
                      <td className="px-5 py-4">{formatEuro(row.hkuTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ChartPanel title="MSCI World investment value">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={model.rows} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis dataKey="year" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={compactEuro} width={70} />
                <Tooltip formatter={(value) => formatEuro(Number(value))} labelFormatter={(year) => `Year ${year}`} />
                <Area
                  type="monotone"
                  dataKey="investmentValue"
                  name="Investment value"
                  stroke="#ca8a04"
                  fill="#fef3c7"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartPanel>
        </div>
      </section>
    </main>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Euro;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium uppercase text-slate-500">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold text-slate-950">{value}</div>
    </div>
  );
}

function SummaryCard({ title, value, caption }: { title: string; value: string; caption: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-medium text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-950">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{caption}</div>
    </div>
  );
}

function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <LabelRow label={label} value={format(value)} />
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([next]) => onChange(next)} />
    </div>
  );
}

function LabelRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <span className="font-mono text-slate-950">{value}</span>
    </div>
  );
}

function salaryAtYear(program: ProgramKey, scenario: Scenario, year: number) {
  const salary = programs[program].salaries[scenario];
  if (year <= 1) return salary[1];

  for (let i = 1; i < milestones.length; i += 1) {
    const previousYear = milestones[i - 1];
    const nextYear = milestones[i];
    if (year <= nextYear) {
      const progress = (year - previousYear) / (nextYear - previousYear);
      return salary[previousYear] + (salary[nextYear] - salary[previousYear]) * progress;
    }
  }

  return salary[20];
}

function cumulativeSalary(program: ProgramKey, scenario: Scenario, years: number) {
  return Array.from({ length: years }, (_, index) => salaryAtYear(program, scenario, index + 1)).reduce(
    (sum, salary) => sum + salary,
    0,
  );
}

function futureValueMonthly(monthlyAmount: number, annualReturnPercent: number, years: number) {
  const months = years * 12;
  const monthlyRate = annualReturnPercent / 100 / 12;
  if (monthlyRate === 0) return monthlyAmount * months;
  return monthlyAmount * (((1 + monthlyRate) ** months - 1) / monthlyRate);
}

function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function compactEuro(value: number) {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}€${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}€${Math.round(abs / 1_000)}k`;
  return `${sign}€${Math.round(abs)}`;
}
