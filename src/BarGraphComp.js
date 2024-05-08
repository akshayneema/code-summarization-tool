import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from 'recharts';

const BarGraphComp = () => {
    // Sample data
    const data = [
        { name: 'Geeksforgeeks', rating: 400 },
        { name: 'Technical scripter', rating: 700 },
        { name: 'Geek-o-mania', rating: 600 }
    ];

    // Calculate total rating
    const totalRating = data.reduce((acc, cur) => acc + cur.rating, 0);

    // Determine the maximum rating for setting Y-axis domain
    const maxRating = Math.max(...data.map(item => item.rating));

    // Set a buffer for Y-axis domain
    const yAxisDomain = [0, Math.ceil(maxRating * 1.1)]; // Adjust the multiplier as needed

    return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <BarChart width={600} height={400} data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={yAxisDomain} />
                <Tooltip />
                <Bar dataKey="rating" fill="#8884d8">
                    <LabelList 
                        dataKey={({rating}) => `${((rating / totalRating) * 100).toFixed(2)}%`} 
                        position="top"
                    />
                </Bar>
            </BarChart>
        </div>
    );
}

export default BarGraphComp;
