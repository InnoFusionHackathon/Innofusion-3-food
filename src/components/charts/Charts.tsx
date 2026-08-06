import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

const axis = {
  stroke: "var(--muted-foreground)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: "14px",
    color: "var(--popover-foreground)",
    fontSize: "12px",
  },
  cursor: { fill: "var(--muted)", opacity: 0.3 },
};

const PIE_COLORS = ["var(--chart-1)", "var(--chart-3)", "var(--chart-2)", "var(--chart-5)", "var(--chart-4)"];

export function MealPieChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={62}
          outerRadius={95}
          paddingAngle={4}
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function HourlyBarChart({ data }: { data: { hour: string; scans: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="hour" {...axis} />
        <YAxis {...axis} width={32} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="scans" fill="var(--chart-1)" radius={[8, 8, 4, 4]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MealTrendChart({
  data,
}: {
  data: { day: string; goodies: number; day1_snacks: number; day1_lunch: number; day1_evening_snacks: number; day1_dinner: number; day2_breakfast: number; day2_lunch: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="day" {...axis} />
        <YAxis {...axis} width={32} />
        <Tooltip {...tooltipStyle} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="goodies" stroke="var(--chart-1)" strokeWidth={3} dot={false} />
        <Line type="monotone" dataKey="day1_snacks" stroke="var(--chart-2)" strokeWidth={3} dot={false} />
        <Line type="monotone" dataKey="day1_lunch" stroke="var(--chart-3)" strokeWidth={3} dot={false} />
        <Line type="monotone" dataKey="day1_evening_snacks" stroke="var(--chart-4)" strokeWidth={3} dot={false} />
        <Line type="monotone" dataKey="day1_dinner" stroke="var(--chart-5)" strokeWidth={3} dot={false} />
        <Line type="monotone" dataKey="day2_breakfast" stroke="var(--chart-1)" strokeWidth={3} dot={false} />
        <Line type="monotone" dataKey="day2_lunch" stroke="var(--chart-2)" strokeWidth={3} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CategoryBarChart({
  data,
  dataKey = "value",
  nameKey = "name",
  color = "var(--chart-2)",
  vertical = false,
}: {
  data: Record<string, string | number>[];
  dataKey?: string;
  nameKey?: string;
  color?: string;
  vertical?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout={vertical ? "vertical" : "horizontal"}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        {vertical ? (
          <>
            <XAxis type="number" {...axis} />
            <YAxis type="category" dataKey={nameKey} {...axis} width={110} />
          </>
        ) : (
          <>
            <XAxis dataKey={nameKey} {...axis} />
            <YAxis {...axis} width={32} />
          </>
        )}
        <Tooltip {...tooltipStyle} />
        <Bar dataKey={dataKey} fill={color} radius={8} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DailyLineChart({ data }: { data: { day: string; scans: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="day" {...axis} />
        <YAxis {...axis} width={32} />
        <Tooltip {...tooltipStyle} />
        <Line type="monotone" dataKey="scans" stroke="var(--chart-1)" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
