import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Svg, { Line, Rect, Circle, Path, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import Theme from '../theme';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface CustomChartProps {
  type: 'line' | 'bar';
  data: ChartDataPoint[];
  color?: string;
  height?: number;
  suffix?: string;
}

export const CustomChart: React.FC<CustomChartProps> = ({
  type,
  data,
  color = Theme.colors.primary,
  height = 180,
  suffix = '',
}) => {
  const screenWidth = Dimensions.get('window').width - Theme.spacing.lg * 4; // adjust for padding
  const paddingLeft = 40;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;
  
  const chartWidth = screenWidth - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  if (!data || data.length === 0) {
    return (
      <View style={[styles.emptyContainer, { height }]}>
        <Text style={styles.emptyText}>No data available to display</Text>
      </View>
    );
  }

  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values, 10) * 1.1; // Add 10% headroom
  const minValue = type === 'line' ? Math.max(0, Math.min(...values) * 0.9) : 0; // line chart starts near min, bar at 0
  const valueRange = maxValue - minValue || 1;

  // X coordinate calculation
  const getX = (index: number) => {
    if (data.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (data.length - 1)) * chartWidth;
  };

  // Y coordinate calculation
  const getY = (val: number) => {
    return paddingTop + chartHeight - ((val - minValue) / valueRange) * chartHeight;
  };

  // Generate SVG elements for line chart
  const renderLineChart = () => {
    const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
    
    // Path for gradient area underneath the line
    const areaPoints = data.length > 0 
      ? `${getX(0)},${paddingTop + chartHeight} ` + 
        data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ') + 
        ` ${getX(data.length - 1)},${paddingTop + chartHeight}`
      : '';

    return (
      <>
        <Defs>
          <LinearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Shaded Area Under Line */}
        {data.length > 1 && (
          <Path d={`M ${areaPoints}`} fill="url(#lineGrad)" />
        )}

        {/* Connecting Line */}
        {data.length > 1 && (
          <Path
            d={`M ${points}`}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Grid and Dots */}
        {data.map((d, i) => (
          <g key={`point-${i}`}>
            <Circle
              cx={getX(i)}
              cy={getY(d.value)}
              r="4"
              fill={Theme.colors.background}
              stroke={color}
              strokeWidth="2.5"
            />
            {/* Value Label above dot */}
            <SvgText
              x={getX(i)}
              y={getY(d.value) - 10}
              fill={Theme.colors.text}
              fontSize="9"
              textAnchor="middle"
              fontWeight="bold"
            >
              {d.value.toFixed(1)}
            </SvgText>
          </g>
        ))}
      </>
    );
  };

  // Generate SVG elements for bar chart
  const renderBarChart = () => {
    const barWidth = Math.max(10, (chartWidth / data.length) * 0.6);
    
    return (
      <>
        <Defs>
          <LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.4" />
          </LinearGradient>
        </Defs>

        {data.map((d, i) => {
          const x = getX(i) - barWidth / 2;
          const y = getY(d.value);
          const barHeight = Math.max(4, paddingTop + chartHeight - y);
          
          return (
            <g key={`bar-${i}`}>
              {/* Rectangular Bar */}
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="url(#barGrad)"
                rx="4"
              />
              {/* Value Label above bar */}
              <SvgText
                x={getX(i)}
                y={y - 8}
                fill={Theme.colors.text}
                fontSize="9"
                textAnchor="middle"
                fontWeight="semibold"
              >
                {d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value}
              </SvgText>
            </g>
          );
        })}
      </>
    );
  };

  // Calculate Y-axis tick values
  const yTicks = [minValue, minValue + valueRange / 2, maxValue];

  return (
    <View style={styles.container}>
      <Svg width={screenWidth} height={height}>
        {/* Horizontal Gridlines */}
        {yTicks.map((tick, i) => {
          const y = getY(tick);
          return (
            <g key={`grid-${i}`}>
              <Line
                x1={paddingLeft}
                y1={y}
                x2={paddingLeft + chartWidth}
                y2={y}
                stroke={Theme.colors.border}
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <SvgText
                x={paddingLeft - 8}
                y={y + 3}
                fill={Theme.colors.textSecondary}
                fontSize="10"
                textAnchor="end"
              >
                {tick.toFixed(0)}
                {suffix}
              </SvgText>
            </g>
          );
        })}

        {/* Chart Content */}
        {type === 'line' ? renderLineChart() : renderBarChart()}

        {/* X-Axis labels */}
        {data.map((d, i) => (
          <SvgText
            key={`x-label-${i}`}
            x={getX(i)}
            y={height - 8}
            fill={Theme.colors.textSecondary}
            fontSize="10"
            textAnchor="middle"
          >
            {d.label}
          </SvgText>
        ))}

        {/* Base Axis Line */}
        <Line
          x1={paddingLeft}
          y1={paddingTop + chartHeight}
          x2={paddingLeft + chartWidth}
          y2={paddingTop + chartHeight}
          stroke={Theme.colors.border}
          strokeWidth="1"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Theme.spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  emptyText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.sm,
  },
});

export default CustomChart;
