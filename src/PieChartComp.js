import React from 'react';
import { PieChart, Pie, Tooltip, Cell, Legend } from 'recharts';

const PieChartComp = ({ data }) => {

    // Calculate total rating
    const totalrating = data.reduce((acc, curr) => acc + curr.rating, 0) || 0;
    // Define custom colors for each segment
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const renderCustomizedLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
        index
    }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

        const isLeftHalf = midAngle > 90 && midAngle < 270;

        const labelX = isLeftHalf ? x - 10 : x + 10;
        const labelY = y;

        return (
            <text
                x={labelX}
                y={labelY}
                fill="#fff"
                textAnchor={isLeftHalf ? 'end' : 'start'}
                dominantBaseline="middle"
                fontSize={14}
            >
                {`${(percent * 100).toFixed(2)}%`}
            </text>
        );
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {totalrating > 0 ? (
                <PieChart width={500} height={400}>
                    <Pie
                        data={data}
                        dataKey="rating"
                        outerRadius={150}
                        fill="green"
                        labelLine={false}
                        label={renderCustomizedLabel}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            ) : (
                <div style={{ width: 500, height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <span data-testid="pie-no-data-available" className='no-data-message'>No data available</span>
                </div>
            )}
        </div>
    );
}

export default PieChartComp;
