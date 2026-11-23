import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function ChartPanel({ title, data, dataKey, color = '#e60000', formatValue }) {
  return (
    <section className="panel chart-panel">
      <div className="panel__heading">
        <div>
          <h2>{title}</h2>
          <p>Historical performance</p>
        </div>
        <span className="chart-legend"><i style={{ backgroundColor: color }} /> Trend</span>
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 12, left: 8, bottom: 0 }}>
            <CartesianGrid stroke="#edf0f3" vertical={false} />
            <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#77808c' }} minTickGap={22} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#77808c' }} width={52} />
            <Tooltip formatter={(value) => formatValue ? formatValue(value) : value} />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
