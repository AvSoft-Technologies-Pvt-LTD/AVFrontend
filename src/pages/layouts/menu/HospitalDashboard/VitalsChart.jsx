import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea
} from 'recharts';

const vitalRanges = {
  heartRate: { min: 60, max: 100, label: "bpm", name: "Heart Rate", optimal: 70 },
  temperature: { min: 36.1, max: 37.2, label: "°C", name: "Temperature", optimal: 36.5 },
  bloodSugar: { min: 70, max: 140, label: "mg/dL", name: "Blood Sugar", optimal: 90 },
  bloodPressure: { min: 90, max: 120, label: "mmHg", name: "Blood Pressure", optimal: 110 },
  height: { min: 100, max: 220, label: "cm", name: "Height", optimal: 170 },
  weight: { min: 30, max: 200, label: "kg", name: "Weight", optimal: 70 },
};

const CHART_COLORS = {
  primary: '#0E1630',
  accent: '#01D48C',
  warning: '#f59e42',
  danger: '#ef4444',
  info: '#3b82f6',
  success: '#22c55e',
  morning: '#fbbf24',
  evening: '#8b5cf6'
};

const PIE_COLORS = [CHART_COLORS.morning, CHART_COLORS.evening, CHART_COLORS.info, CHART_COLORS.success];

const VitalsChart = ({ vital, records, selectedIdx, range ,chartType}) => {
//   const [chartType, setChartType] = useState('bar');
  
  const chartTypes = [
    // { id: 'bar', name: 'Bar Chart', icon: '📊' },
    // { id: 'line', name: 'Line Chart', icon: '📈' },
    // { id: 'area', name: 'Area Chart', icon: '🌄' },
    // { id: 'pie', name: 'Pie Chart', icon: '🥧' },
    // { id: 'radar', name: 'Radar Chart', icon: '🕸️' }
  ];

  // Process data for charts
  const chartData = useMemo(() => {
    if (!records || !vital) return [];
    
    return records
      .filter(record => record[vital])
      .map((record, index) => {
        let value = record[vital];
        
        // Handle blood pressure specially
        if (vital === 'bloodPressure') {
          const [systolic] = record[vital].split('/').map(Number);
          value = systolic;
        } else {
          value = parseFloat(value);
        }
        
        return {
          index,
          date: record.date,
          time: record.time,
          timeOfDay: record.timeOfDay,
          value,
          rawValue: record[vital],
          isSelected: selectedIdx === index,
          inRange: value >= range?.min && value <= range?.max,
          status: value < range?.min ? 'low' : value > range?.max ? 'high' : 'normal'
        };
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [records, vital, selectedIdx, range]);

  // Pie chart data for morning vs evening distribution
  const pieData = useMemo(() => {
    if (!chartData.length) return [];
    
    const morningCount = chartData.filter(d => d.timeOfDay === 'morning').length;
    const eveningCount = chartData.filter(d => d.timeOfDay === 'evening').length;
    const normalCount = chartData.filter(d => d.status === 'normal').length;
    const abnormalCount = chartData.filter(d => d.status !== 'normal').length;
    
    return [
      { name: 'Morning Records', value: morningCount, color: CHART_COLORS.morning },
      { name: 'Evening Records', value: eveningCount, color: CHART_COLORS.evening },
      { name: 'Normal Values', value: normalCount, color: CHART_COLORS.success },
      { name: 'Out of Range', value: abnormalCount, color: CHART_COLORS.warning }
    ].filter(item => item.value > 0);
  }, [chartData]);

  // Radar chart data for latest readings across all vitals
  const radarData = useMemo(() => {
    if (!records.length) return [];
    
    const latestRecord = records[records.length - 1];
    
    return Object.keys(vitalRanges).map(vitalKey => {
      const vitalRange = vitalRanges[vitalKey];
      let value = latestRecord[vitalKey];
      
      if (!value) return null;
      
      // Handle blood pressure
      if (vitalKey === 'bloodPressure') {
        const [systolic] = value.split('/').map(Number);
        value = systolic;
      } else {
        value = parseFloat(value);
      }
      
      // Normalize to percentage of range
      const percentage = ((value - vitalRange.min) / (vitalRange.max - vitalRange.min)) * 100;
      
      return {
        vital: vitalRange.name,
        value: Math.max(0, Math.min(100, percentage)),
        actualValue: latestRecord[vitalKey],
        status: value < vitalRange.min ? 'low' : value > vitalRange.max ? 'high' : 'normal'
      };
    }).filter(Boolean);
  }, [records]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label, chartType: tooltipChartType }) => {
    if (!active || !payload?.length) return null;
    
    const data = payload[0].payload;
    const vitalRange = range || vitalRanges[vital];
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
        {tooltipChartType === 'radar' ? (
          <div>
            <p className="font-semibold text-[var(--primary-color)]">{data.vital}</p>
            <p className="text-gray-600">Value: {data.actualValue}</p>
            <p className={`font-medium ${
              data.status === 'normal' ? 'text-green-600' :
              data.status === 'low' ? 'text-blue-600' : 'text-red-600'
            }`}>
              Status: {data.status.toUpperCase()}
            </p>
          </div>
        ) : (
          <div>
            <p className="font-semibold text-[var(--primary-color)]">{label}</p>
            <p className="text-gray-600">
              {data.date} at {data.time} ({data.timeOfDay})
            </p>
            <p className="text-gray-800">
              Value: {data.rawValue} {vitalRange?.label}
            </p>
            <p className="text-sm text-gray-500">
              Normal Range: {vitalRange?.min}-{vitalRange?.max} {vitalRange?.label}
            </p>
            <p className={`font-medium ${
              data.status === 'normal' ? 'text-green-600' :
              data.status === 'low' ? 'text-blue-600' : 'text-red-600'
            }`}>
              Status: {data.status.toUpperCase()}
            </p>
            {data.isSelected && (
              <p className="text-[var(--accent-color)] font-medium text-xs mt-1">
                ★ Selected Record
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderChart = () => {
    if (!chartData.length && chartType !== 'pie') {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <p className="text-lg">📊</p>
            <p>No data available for {vitalRanges[vital]?.name}</p>
          </div>
        </div>
      );
    }

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke={CHART_COLORS.primary}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke={CHART_COLORS.primary}
              />
              <Tooltip content={<CustomTooltip chartType="bar" />} />
              
              {/* Reference area for normal range */}
              {range && (
                <ReferenceArea 
                  y1={range.min} 
                  y2={range.max} 
                  fill={CHART_COLORS.success}
                  fillOpacity={0.1}
                  label="Normal Range"
                />
              )}
              
              {/* Reference lines for min/max */}
              {range && (
                <>
                  <ReferenceLine 
                    y={range.min} 
                    stroke={CHART_COLORS.warning} 
                    strokeDasharray="5 5"
                    label={{ value: "Min Normal", position: "topLeft" }}
                  />
                  <ReferenceLine 
                    y={range.max} 
                    stroke={CHART_COLORS.warning} 
                    strokeDasharray="5 5"
                    label={{ value: "Max Normal", position: "topLeft" }}
                  />
                </>
              )}
              
              <Bar 
                dataKey="value" 
                fill={(entry) => {
                  if (entry?.isSelected) return CHART_COLORS.accent;
                  if (entry?.timeOfDay === 'morning') return CHART_COLORS.morning;
                  return CHART_COLORS.evening;
                }}
                stroke={CHART_COLORS.primary}
                strokeWidth={1}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.isSelected ? CHART_COLORS.accent :
                      entry.timeOfDay === 'morning' ? CHART_COLORS.morning :
                      CHART_COLORS.evening
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke={CHART_COLORS.primary}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke={CHART_COLORS.primary}
              />
              <Tooltip content={<CustomTooltip chartType="line" />} />
              
              {/* Reference area for normal range */}
              {range && (
                <ReferenceArea 
                  y1={range.min} 
                  y2={range.max} 
                  fill={CHART_COLORS.success}
                  fillOpacity={0.1}
                />
              )}
              
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={CHART_COLORS.primary}
                strokeWidth={3}
                dot={{ fill: CHART_COLORS.accent, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: CHART_COLORS.accent }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke={CHART_COLORS.primary}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke={CHART_COLORS.primary}
              />
              <Tooltip content={<CustomTooltip chartType="area" />} />
              
              {/* Reference area for normal range */}
              {range && (
                <ReferenceArea 
                  y1={range.min} 
                  y2={range.max} 
                  fill={CHART_COLORS.success}
                  fillOpacity={0.2}
                />
              )}
              
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={CHART_COLORS.primary}
                fill={CHART_COLORS.accent}
                fillOpacity={0.6}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [value, name]}
                labelStyle={{ color: CHART_COLORS.primary }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
              <PolarGrid stroke="#f0f0f0" />
              <PolarAngleAxis 
                dataKey="vital" 
                tick={{ fontSize: 12, fill: CHART_COLORS.primary }}
              />
              <PolarRadiusAxis 
                angle={0} 
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: CHART_COLORS.primary }}
                tickCount={5}
              />
              <Radar
                name="Vital Signs"
                dataKey="value"
                stroke={CHART_COLORS.primary}
                fill={CHART_COLORS.accent}
                fillOpacity={0.3}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS.accent, strokeWidth: 1, r: 4 }}
              />
              <Tooltip content={<CustomTooltip chartType="radar" />} />
            </RadarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const getChartStats = () => {
    if (!chartData.length) return null;
    
    const normalCount = chartData.filter(d => d.status === 'normal').length;
    const totalCount = chartData.length;
    const normalPercentage = ((normalCount / totalCount) * 100).toFixed(1);
    
    const morningCount = chartData.filter(d => d.timeOfDay === 'morning').length;
    const eveningCount = chartData.filter(d => d.timeOfDay === 'evening').length;
    
    const avgValue = (chartData.reduce((sum, d) => sum + d.value, 0) / totalCount).toFixed(1);
    
    return {
      total: totalCount,
      normal: normalCount,
      normalPercentage,
      morning: morningCount,
      evening: eveningCount,
      average: avgValue
    };
  };

  const stats = getChartStats();

  return (
    <div className="w-full h-full flex flex-col">
      {/* Chart Type Selector */}
      <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 pb-3">
        {chartTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setChartType(type.id)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              chartType === type.id
                ? 'bg-[var(--primary-color)] text-white'
                : 'bg-gray-100 text-[var(--primary-color)] hover:bg-gray-200'
            }`}
          >
            <span>{type.icon}</span>
            <span>{type.name}</span>
          </button>
        ))}
      </div>

      {/* Chart Header with Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 text-xs">
          <div className="bg-blue-50 rounded-lg p-2 text-center">
            <p className="text-blue-600 font-semibold">{stats.total}</p>
            <p className="text-blue-500">Total Records</p>
          </div>
          <div className="bg-green-50 rounded-lg p-2 text-center">
            <p className="text-green-600 font-semibold">{stats.normalPercentage}%</p>
            <p className="text-green-500">In Normal Range</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-2 text-center">
            <p className="text-purple-600 font-semibold">{stats.average}</p>
            <p className="text-purple-500">Average Value</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-2 text-center">
            <p className="text-yellow-600 font-semibold">{stats.morning}</p>
            <p className="text-yellow-500">Morning</p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-2 text-center">
            <p className="text-indigo-600 font-semibold">{stats.evening}</p>
            <p className="text-indigo-500">Evening</p>
          </div>
          {range && (
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-gray-600 font-semibold">{range.min}-{range.max}</p>
              <p className="text-gray-500">Normal Range</p>
            </div>
          )}
        </div>
      )}

      {/* Chart Container */}
      <div className="flex-1 min-h-0">
        {renderChart()}
      </div>

      {/* Chart Legend */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs">
          {chartType === 'pie' ? (
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.morning }}></div>
                <span>Morning Records</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.evening }}></div>
                <span>Evening Records</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.success }}></div>
                <span>Normal Values</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.warning }}></div>
                <span>Out of Range</span>
              </div>
            </div>
          ) : chartType === 'radar' ? (
            <div className="text-center text-gray-600">
              <p>Radar chart shows latest record across all vitals as percentage of normal range</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.morning }}></div>
                <span>Morning</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.evening }}></div>
                <span>Evening</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.accent }}></div>
                <span>Selected Record</span>
              </div>
              {range && (
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-200 border border-green-400"></div>
                  <span>Normal Range</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VitalsChart;